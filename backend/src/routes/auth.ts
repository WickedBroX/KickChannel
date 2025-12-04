import { Router } from 'express';
import { signup, login, logout, getMe, verifyEmail } from '../controllers/auth';

const router = Router();

router.post('/signup', signup);
router.post('/login', login);
router.post('/logout', logout);
router.get('/me', getMe);
router.get('/verify-email', verifyEmail);

export default router;
