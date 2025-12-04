import { Router } from 'express';
import { authenticateUser } from '../middleware/auth';
import { createMarketItem, addMarketItemGrants, createTournament, createTicketOffer, createCodeReward } from '../controllers/admin';
import { Request, Response, NextFunction } from 'express';
import { pool } from '../db';
import { AuthRequest } from '../middleware/auth';

const isAdmin = async (req: Request, res: Response, next: NextFunction) => {
    const userId = (req as AuthRequest).user!.id;
    const result = await pool.query('SELECT is_admin FROM users WHERE id = $1', [userId]);
    if (result.rows[0]?.is_admin) next();
    else res.status(403).json({ message: 'Admin only' });
};

const router = Router();
router.use(authenticateUser, isAdmin);

router.post('/market-items', createMarketItem);
router.post('/market-items/grants', addMarketItemGrants);
router.post('/tournaments', createTournament);
router.post('/ticket-offers', createTicketOffer);
router.post('/code-rewards', createCodeReward);

export default router;
