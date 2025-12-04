import { pool } from './db';
import bcrypt from 'bcryptjs';

const seed = async () => {
  try {
    console.log('Seeding...');

    // Admin User
    const hash = await bcrypt.hash('admin123', 10);
    const adminRes = await pool.query(
        `INSERT INTO users (email, username, password_hash, email_verified, is_admin, points, tickets)
         VALUES ('admin@example.com', 'admin', $1, TRUE, TRUE, 10000, 100)
         ON CONFLICT (email) DO UPDATE SET is_admin = TRUE
         RETURNING id`,
         [hash]
    );
    console.log('Admin user created');

    // Normal User
    const userHash = await bcrypt.hash('password', 10);
    await pool.query(
        `INSERT INTO users (email, username, password_hash, email_verified, points, tickets)
         VALUES ('user@example.com', 'testuser', $1, TRUE, 500, 10)
         ON CONFLICT DO NOTHING`,
         [userHash]
    );

    // Market Items
    const itemRes = await pool.query(
        `INSERT INTO market_items (name, description, price_points, stock_quantity, image_url)
         VALUES
         ('Steam Gift Card $10', 'Redeemable on Steam.', 1000, 5, 'https://via.placeholder.com/200?text=Steam'),
         ('Discord Nitro 1 Month', 'Boost your server.', 500, 10, 'https://via.placeholder.com/200?text=Nitro')
         RETURNING id`
    );
    const itemIds = itemRes.rows.map((r: any) => r.id);

    // Market Grants
    await pool.query('INSERT INTO market_item_grants (market_item_id, code) VALUES ($1, $2)', [itemIds[0], 'STEAM-XXXX-YYYY']);
    await pool.query('INSERT INTO market_item_grants (market_item_id, code) VALUES ($1, $2)', [itemIds[0], 'STEAM-AAAA-BBBB']);
    await pool.query('INSERT INTO market_item_grants (market_item_id, code) VALUES ($1, $2)', [itemIds[1], 'NITRO-1234-5678']);

    // Tournaments
    const tourneyRes = await pool.query(
        `INSERT INTO tournaments (name, description, game, start_date, prize_pool, status, banner_image_url)
         VALUES
         ('Summer Championship 2024', 'The biggest event of the summer.', 'League of Legends', NOW() + INTERVAL '7 days', 10000, 'upcoming', 'https://via.placeholder.com/800x300?text=Summer+Championship'),
         ('Weekly Valorant Bash', 'Community tournament.', 'Valorant', NOW() + INTERVAL '2 days', 500, 'upcoming', 'https://via.placeholder.com/800x300?text=Valorant+Bash')
         RETURNING id`
    );
    const tIds = tourneyRes.rows.map((r: any) => r.id);

    // Ticket Offers
    await pool.query('INSERT INTO ticket_offers (tournament_id, name, price_points, quantity_available) VALUES ($1, $2, $3, $4)', [tIds[0], 'Standard Entry', 100, 50]);
    await pool.query('INSERT INTO ticket_offers (tournament_id, name, price_tickets, quantity_available) VALUES ($1, $2, $3, $4)', [tIds[0], 'VIP Entry', 5, 10]);

    // Code Rewards
    await pool.query('INSERT INTO code_rewards (code, description, points_reward, max_uses_per_user) VALUES ($1, $2, $3, $4) ON CONFLICT DO NOTHING', ['WELCOME', 'Welcome bonus', 100, 1]);
    await pool.query('INSERT INTO code_rewards (code, description, tickets_reward, max_uses_per_user) VALUES ($1, $2, $3, $4) ON CONFLICT DO NOTHING', ['TICKET1', 'Free Ticket', 1, 1]);

    // Fortune Tiers
    await pool.query('DELETE FROM fortune_prize_tiers'); // clear dups if re-running
    await pool.query('INSERT INTO fortune_prize_tiers (name, points_reward, weight) VALUES ($1, $2, $3)', ['Small Win', 10, 60]);
    await pool.query('INSERT INTO fortune_prize_tiers (name, points_reward, weight) VALUES ($1, $2, $3)', ['Big Win', 100, 30]);
    await pool.query('INSERT INTO fortune_prize_tiers (name, points_reward, weight) VALUES ($1, $2, $3)', ['Jackpot', 1000, 10]);

    console.log('Seeding complete.');
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

seed();
