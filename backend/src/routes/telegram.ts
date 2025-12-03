import { Router } from 'express';
import { authenticateUser } from '../middleware/auth';
import { startLink, handleWebhook } from '../controllers/telegram';

const router = Router();

router.post('/link/start', authenticateUser, startLink);
router.post('/webhook', handleWebhook);

export default router;
