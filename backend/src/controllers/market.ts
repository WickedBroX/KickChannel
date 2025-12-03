import { Request, Response } from 'express';
import { pool } from '../db';
import { AuthRequest } from '../middleware/auth';

export const getItems = async (req: Request, res: Response) => {
  try {
    const result = await pool.query('SELECT * FROM market_items WHERE is_active = TRUE ORDER BY created_at DESC');
    res.json({ items: result.rows });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const purchaseItem = async (req: Request, res: Response) => {
  const userId = (req as AuthRequest).user!.id;
  const itemId = req.params.id;

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const userRes = await client.query('SELECT points FROM users WHERE id = $1 FOR UPDATE', [userId]);
    const userPoints = userRes.rows[0].points;

    const itemRes = await client.query('SELECT * FROM market_items WHERE id = $1 FOR UPDATE', [itemId]);
    if (itemRes.rows.length === 0) throw new Error('Item not found');
    const item = itemRes.rows[0];

    if (item.stock_quantity !== null && item.stock_quantity <= 0) throw new Error('Out of stock');
    if (userPoints < item.price_points) throw new Error('Insufficient points');

    const grantRes = await client.query(
      'SELECT id, code FROM market_item_grants WHERE market_item_id = $1 AND is_redeemed = FALSE LIMIT 1 FOR UPDATE SKIP LOCKED',
      [itemId]
    );

    if (grantRes.rows.length === 0) {
       throw new Error('Out of stock (no codes available)');
    }
    const grant = grantRes.rows[0];

    await client.query('UPDATE users SET points = points - $1 WHERE id = $2', [item.price_points, userId]);

    if (item.stock_quantity !== null) {
      await client.query('UPDATE market_items SET stock_quantity = stock_quantity - 1 WHERE id = $1', [itemId]);
    }

    await client.query(
      'UPDATE market_item_grants SET is_redeemed = TRUE, redeemed_by_user_id = $1, redeemed_at = NOW() WHERE id = $2',
      [userId, grant.id]
    );

    await client.query(
      'INSERT INTO user_market_purchases (user_id, market_item_id, market_item_grant_id, points_spent) VALUES ($1, $2, $3, $4)',
      [userId, itemId, grant.id, item.price_points]
    );

    await client.query('COMMIT');

    res.json({ success: true, code: grant.code, itemName: item.name });
  } catch (error: any) {
    await client.query('ROLLBACK');
    res.status(400).json({ message: error.message || 'Purchase failed' });
  } finally {
    client.release();
  }
};

export const getMyPurchases = async (req: Request, res: Response) => {
  const userId = (req as AuthRequest).user!.id;
  try {
    const result = await pool.query(`
      SELECT p.*, i.name as item_name, i.image_url, g.code
      FROM user_market_purchases p
      JOIN market_items i ON p.market_item_id = i.id
      JOIN market_item_grants g ON p.market_item_grant_id = g.id
      WHERE p.user_id = $1
      ORDER BY p.created_at DESC
    `, [userId]);
    res.json({ purchases: result.rows });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
