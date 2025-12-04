import request from 'supertest';
import app from '../src/app';
import { pool } from '../src/db';
import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';

describe('Integration Tests', () => {
  let userToken = '';
  let marketItemId = '';
  let emailToken = '';

  beforeAll(async () => {
    // Reset DB
    await pool.query('DROP SCHEMA public CASCADE; CREATE SCHEMA public;');

    // Apply Schema
    const schemaPath = path.join(__dirname, '../src/schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    await pool.query(schema);

    // Seed Admin
    const hash = await bcrypt.hash('admin123', 10);
    await pool.query(
        `INSERT INTO users (email, username, password_hash, email_verified, is_admin, points, tickets)
         VALUES ('admin@example.com', 'admin', $1, TRUE, TRUE, 10000, 100)`, [hash]
    );

    // Seed Market Item
    const itemRes = await pool.query(
        `INSERT INTO market_items (name, description, price_points, stock_quantity) VALUES ('Test Item', 'Desc', 10, 5) RETURNING id`
    );
    marketItemId = itemRes.rows[0].id;
    await pool.query('INSERT INTO market_item_grants (market_item_id, code) VALUES ($1, $2)', [marketItemId, 'TEST-CODE']);

    // Seed Fortune Tiers
    await pool.query('INSERT INTO fortune_prize_tiers (name, points_reward, weight) VALUES ($1, $2, $3)', ['Win', 10, 100]);
  });

  afterAll(async () => {
    await pool.end();
  });

  test('Auth: Signup', async () => {
    const res = await request(app)
      .post('/api/auth/signup')
      .send({ email: 'new@example.com', username: 'newuser', password: 'password' });

    expect(res.status).toBe(201);
    expect(res.body.user).toHaveProperty('id');

    // Get verification token
    const tokenRes = await pool.query('SELECT token FROM email_verification_tokens WHERE user_id = $1', [res.body.user.id]);
    emailToken = tokenRes.rows[0].token;
  });

  test('Auth: Login', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'new@example.com', password: 'password' });

    expect(res.status).toBe(200);
    expect(res.headers['set-cookie']).toBeDefined();

    const cookie = res.headers['set-cookie'][0];
    userToken = cookie.split(';')[0];
  });

  test('Auth: Verify Email', async () => {
    const res = await request(app)
      .get(`/api/auth/verify-email?token=${emailToken}`);

    expect(res.status).toBe(302); // Redirect

    const userRes = await pool.query('SELECT email_verified FROM users WHERE email = $1', ['new@example.com']);
    expect(userRes.rows[0].email_verified).toBe(true);
  });

  test('Auth: Verify Email Replay (Should Fail)', async () => {
    const res = await request(app)
        .get(`/api/auth/verify-email?token=${emailToken}`);
    expect(res.status).toBe(400);
  });

  test('Rewards: Daily Login', async () => {
    const res = await request(app)
      .post('/api/rewards/daily-login')
      .set('Cookie', [userToken]);

    expect(res.status).toBe(200);
    expect(res.body.points).toBeGreaterThan(0);
  });

  test('Rewards: Daily Login Replay (Should Fail)', async () => {
    const res = await request(app)
      .post('/api/rewards/daily-login')
      .set('Cookie', [userToken]);

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/Already claimed/);
  });

  test('Market: Purchase', async () => {
    // Give points first
    await pool.query('UPDATE users SET points = 100 WHERE email = $1', ['new@example.com']);

    const res = await request(app)
      .post(`/api/market/items/${marketItemId}/purchase`)
      .set('Cookie', [userToken]);

    expect(res.status).toBe(200);
    expect(res.body.code).toBe('TEST-CODE');
  });

  test('Market: Purchase Out of Stock', async () => {
     const res = await request(app)
      .post(`/api/market/items/${marketItemId}/purchase`)
      .set('Cookie', [userToken]);

     expect(res.status).toBe(400);
     expect(res.body.message).toMatch(/Out of stock/);
  });

  test('Fortune Wheel', async () => {
      const res = await request(app)
        .post('/api/rewards/fortune-spin')
        .set('Cookie', [userToken]);

      expect(res.status).toBe(200);
  });

  test('Fortune Wheel Replay', async () => {
      const res = await request(app)
        .post('/api/rewards/fortune-spin')
        .set('Cookie', [userToken]);

      expect(res.status).toBe(400);
  });

});
