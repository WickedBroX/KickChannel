import { Request, Response } from 'express';
import { pool } from '../db';
import { AuthRequest } from '../middleware/auth';

// Streams
export const getStreams = async (req: Request, res: Response) => {
  try {
    const result = await pool.query('SELECT * FROM streams ORDER BY is_live DESC, started_at DESC');
    res.json({ streams: result.rows });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const getStream = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const result = await pool.query('SELECT * FROM streams WHERE id = $1', [id]);
    if (result.rows.length === 0) return res.status(404).json({ message: 'Stream not found' });
    res.json({ stream: result.rows[0] });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Highlights
export const getHighlights = async (req: Request, res: Response) => {
  try {
    const result = await pool.query('SELECT * FROM highlights ORDER BY created_at DESC');
    res.json({ highlights: result.rows });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Tournaments
export const getTournaments = async (req: Request, res: Response) => {
  try {
    const result = await pool.query('SELECT * FROM tournaments ORDER BY start_date ASC');
    const tournaments = await Promise.all(result.rows.map(async (t) => {
      const offers = await pool.query('SELECT * FROM ticket_offers WHERE tournament_id = $1', [t.id]);
      return { ...t, offers: offers.rows };
    }));
    res.json({ tournaments });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const getTournament = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const result = await pool.query('SELECT * FROM tournaments WHERE id = $1', [id]);
    if (result.rows.length === 0) return res.status(404).json({ message: 'Not found' });
    const offers = await pool.query('SELECT * FROM ticket_offers WHERE tournament_id = $1', [id]);
    res.json({ tournament: result.rows[0], offers: offers.rows });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const redeemTicketOffer = async (req: Request, res: Response) => {
  const userId = (req as AuthRequest).user!.id;
  const { offerId } = req.body;

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const userRes = await client.query('SELECT telegram_verified, points, tickets FROM users WHERE id = $1 FOR UPDATE', [userId]);
    const user = userRes.rows[0];

    if (!user.telegram_verified) {
      throw new Error('Telegram verification required');
    }

    const offerRes = await client.query('SELECT * FROM ticket_offers WHERE id = $1 FOR UPDATE', [offerId]);
    if (offerRes.rows.length === 0) throw new Error('Offer not found');
    const offer = offerRes.rows[0];

    if (offer.price_points && user.points < offer.price_points) throw new Error('Insufficient points');
    if (offer.price_tickets && user.tickets < offer.price_tickets) throw new Error('Insufficient tickets');

    if (offer.quantity_available !== null && offer.quantity_available <= 0) throw new Error('Sold out');

    if (offer.price_points) await client.query('UPDATE users SET points = points - $1 WHERE id = $2', [offer.price_points, userId]);
    if (offer.price_tickets) await client.query('UPDATE users SET tickets = tickets - $1 WHERE id = $2', [offer.price_tickets, userId]);

    if (offer.quantity_available !== null) {
      await client.query('UPDATE ticket_offers SET quantity_available = quantity_available - 1 WHERE id = $1', [offerId]);
    }

    // Note: In a real app, we would insert into a user_tournament_entries table here.

    await client.query('COMMIT');
    res.json({ message: 'Ticket redeemed! You are joined.', tournamentId: offer.tournament_id });
  } catch (error: any) {
    await client.query('ROLLBACK');
    res.status(400).json({ message: error.message });
  } finally {
    client.release();
  }
};
