import { Request, Response } from 'express';
import { pool } from '../db';
import { AuthRequest } from '../middleware/auth';

export const dailyLogin = async (req: Request, res: Response) => {
  const userId = (req as AuthRequest).user!.id;

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const userRes = await client.query('SELECT last_daily_login_at, points, tickets FROM users WHERE id = $1 FOR UPDATE', [userId]);
    const user = userRes.rows[0];

    const now = new Date();
    const lastLogin = user.last_daily_login_at ? new Date(user.last_daily_login_at) : null;

    if (lastLogin && lastLogin.toDateString() === now.toDateString()) {
      throw new Error('Already claimed today');
    }

    const POINTS_REWARD = 10;
    const TICKETS_REWARD = 1;

    await client.query('UPDATE users SET points = points + $1, tickets = tickets + $2, last_daily_login_at = NOW() WHERE id = $3', [POINTS_REWARD, TICKETS_REWARD, userId]);

    await client.query('COMMIT');
    res.json({ points: user.points + POINTS_REWARD, tickets: user.tickets + TICKETS_REWARD, message: 'Daily reward claimed!' });
  } catch (error: any) {
    await client.query('ROLLBACK');
    res.status(400).json({ message: error.message });
  } finally {
    client.release();
  }
};

export const redeemCode = async (req: Request, res: Response) => {
  const userId = (req as AuthRequest).user!.id;
  const { code } = req.body;

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const codeRes = await client.query('SELECT * FROM code_rewards WHERE code = $1 FOR UPDATE', [code]);
    if (codeRes.rows.length === 0) throw new Error('Invalid code');
    const reward = codeRes.rows[0];

    if (!reward.is_active) throw new Error('Code inactive');
    if (reward.valid_from && new Date() < new Date(reward.valid_from)) throw new Error('Code not active yet');
    if (reward.valid_until && new Date() > new Date(reward.valid_until)) throw new Error('Code expired');
    if (reward.global_max_uses && reward.used_count >= reward.global_max_uses) throw new Error('Code fully redeemed');

    const usageRes = await client.query('SELECT COUNT(*) as count FROM user_code_redemptions WHERE user_id = $1 AND code_reward_id = $2', [userId, reward.id]);
    if (parseInt(usageRes.rows[0].count) >= reward.max_uses_per_user) throw new Error('Max uses reached for this code');

    await client.query('UPDATE users SET points = points + $1, tickets = tickets + $2 WHERE id = $3', [reward.points_reward, reward.tickets_reward, userId]);
    await client.query('UPDATE code_rewards SET used_count = used_count + 1 WHERE id = $1', [reward.id]);
    await client.query('INSERT INTO user_code_redemptions (user_id, code_reward_id) VALUES ($1, $2)', [userId, reward.id]);

    await client.query('COMMIT');
    res.json({ message: 'Code redeemed!', pointsAdded: reward.points_reward, ticketsAdded: reward.tickets_reward });
  } catch (error: any) {
    await client.query('ROLLBACK');
    res.status(400).json({ message: error.message });
  } finally {
    client.release();
  }
};

export const fortuneSpin = async (req: Request, res: Response) => {
  const userId = (req as AuthRequest).user!.id;

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const userRes = await client.query('SELECT last_fortune_spin_at, points FROM users WHERE id = $1 FOR UPDATE', [userId]);
    const user = userRes.rows[0];

    const now = new Date();
    const lastSpin = user.last_fortune_spin_at ? new Date(user.last_fortune_spin_at) : null;

    if (lastSpin && lastSpin.toDateString() === now.toDateString()) {
      throw new Error('Already spun today');
    }

    const tiersRes = await client.query('SELECT * FROM fortune_prize_tiers WHERE is_active = TRUE');
    const tiers = tiersRes.rows;
    if (tiers.length === 0) throw new Error('No prizes configured');

    const totalWeight = tiers.reduce((acc: number, t: any) => acc + t.weight, 0);
    let random = Math.random() * totalWeight;
    let selectedTier = tiers[0];

    for (const tier of tiers) {
      if (random < tier.weight) {
        selectedTier = tier;
        break;
      }
      random -= tier.weight;
    }

    await client.query('UPDATE users SET points = points + $1, last_fortune_spin_at = NOW() WHERE id = $2', [selectedTier.points_reward, userId]);
    await client.query('INSERT INTO fortune_spins (user_id, prize_tier_id, points_awarded) VALUES ($1, $2, $3)', [userId, selectedTier.id, selectedTier.points_reward]);

    await client.query('COMMIT');
    res.json({ pointsAwarded: selectedTier.points_reward, prizeName: selectedTier.name, newPoints: user.points + selectedTier.points_reward });
  } catch (error: any) {
    await client.query('ROLLBACK');
    res.status(400).json({ message: error.message });
  } finally {
    client.release();
  }
};
