import { Request, Response } from 'express';
import { pool } from '../db';
import { AuthRequest } from '../middleware/auth';
import crypto from 'crypto';

export const startLink = async (req: Request, res: Response) => {
  const userId = (req as AuthRequest).user!.id;

  try {
    const linkToken = crypto.randomBytes(16).toString('hex');

    const check = await pool.query('SELECT * FROM telegram_links WHERE user_id = $1', [userId]);
    if (check.rows.length > 0) {
      await pool.query('UPDATE telegram_links SET link_token = $1 WHERE user_id = $2', [linkToken, userId]);
    } else {
      await pool.query('INSERT INTO telegram_links (user_id, link_token) VALUES ($1, $2)', [userId, linkToken]);
    }

    const botName = process.env.TELEGRAM_BOT_NAME || 'GamerAppBot';
    const link = `https://t.me/${botName}?start=${linkToken}`;

    res.json({ link, linkToken });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const handleWebhook = async (req: Request, res: Response) => {
  const { message } = req.body;
  if (!message || !message.text) return res.send('OK');

  const text = message.text;
  const chatId = message.chat.id;
  const username = message.chat.username;

  if (text.startsWith('/start ')) {
    const token = text.split(' ')[1];

    try {
      const result = await pool.query('SELECT * FROM telegram_links WHERE link_token = $1', [token]);
      if (result.rows.length > 0) {
        const link = result.rows[0];

        await pool.query(
          'UPDATE telegram_links SET telegram_user_id = $1, telegram_username = $2, linked_at = NOW() WHERE id = $3',
          [chatId.toString(), username, link.id]
        );

        await pool.query('UPDATE users SET telegram_verified = TRUE WHERE id = $1', [link.user_id]);

        console.log(`[TELEGRAM] Linked user ${link.user_id} to Telegram ${username}`);
      }
    } catch (error) {
      console.error(error);
    }
  }

  res.send('OK');
};
