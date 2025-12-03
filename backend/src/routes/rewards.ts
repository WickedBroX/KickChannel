import { Router } from 'express';
import { authenticateUser } from '../middleware/auth';
import { dailyLogin, redeemCode, fortuneSpin } from '../controllers/rewards';

const router = Router();

router.post('/daily-login', authenticateUser, dailyLogin);
router.post('/redeem-code', authenticateUser, redeemCode);
router.post('/fortune-spin', authenticateUser, fortuneSpin);

export default router;
