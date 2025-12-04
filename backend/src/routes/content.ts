import { Router } from 'express';
import { authenticateUser } from '../middleware/auth';
import { getStreams, getStream, getHighlights, getTournaments, getTournament, redeemTicketOffer } from '../controllers/content';

const router = Router();

router.get('/streams', getStreams);
router.get('/streams/:id', getStream);
router.get('/highlights', getHighlights);
router.get('/tournaments', getTournaments);
router.get('/tournaments/:id', getTournament);
router.post('/ticket-offers/redeem', authenticateUser, redeemTicketOffer);

export default router;
