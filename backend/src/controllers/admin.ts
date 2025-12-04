import { Request, Response } from 'express';
import { pool } from '../db';

export const createMarketItem = async (req: Request, res: Response) => {
  const { name, description, image_url, price_points, stock_quantity } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO market_items (name, description, image_url, price_points, stock_quantity) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [name, description, image_url, price_points, stock_quantity]
    );
    res.json({ item: result.rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error' });
  }
};

export const addMarketItemGrants = async (req: Request, res: Response) => {
  const { marketItemId, codes } = req.body; // codes is array of strings
  try {
    for (const code of codes) {
      await pool.query('INSERT INTO market_item_grants (market_item_id, code) VALUES ($1, $2)', [marketItemId, code]);
    }

    if (codes.length > 0) {
        // Only update stock if it is not null (limited)
        await pool.query('UPDATE market_items SET stock_quantity = stock_quantity + $1 WHERE id = $2 AND stock_quantity IS NOT NULL', [codes.length, marketItemId]);
    }
    res.json({ message: 'Codes added' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error' });
  }
};

export const createTournament = async (req: Request, res: Response) => {
  const { name, description, game, start_date, end_date, prize_pool, banner_image_url } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO tournaments (name, description, game, start_date, end_date, prize_pool, banner_image_url) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [name, description, game, start_date, end_date, prize_pool, banner_image_url]
    );
    res.json({ tournament: result.rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error' });
  }
};

export const createTicketOffer = async (req: Request, res: Response) => {
  const { tournament_id, name, price_points, price_tickets, quantity_available } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO ticket_offers (tournament_id, name, price_points, price_tickets, quantity_available) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [tournament_id, name, price_points, price_tickets, quantity_available]
    );
    res.json({ offer: result.rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error' });
  }
};

export const createCodeReward = async (req: Request, res: Response) => {
  const { code, description, points_reward, tickets_reward, max_uses_per_user, global_max_uses, valid_from, valid_until } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO code_rewards (code, description, points_reward, tickets_reward, max_uses_per_user, global_max_uses, valid_from, valid_until) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
      [code, description, points_reward, tickets_reward, max_uses_per_user, global_max_uses, valid_from, valid_until]
    );
    res.json({ reward: result.rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error' });
  }
};
