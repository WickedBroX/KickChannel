import { Router } from 'express';
import { authenticateUser } from '../middleware/auth';
import { getItems, purchaseItem, getMyPurchases } from '../controllers/market';

const router = Router();

router.get('/items', getItems);
router.post('/items/:id/purchase', authenticateUser, purchaseItem);
router.get('/my-purchases', authenticateUser, getMyPurchases);

export default router;
