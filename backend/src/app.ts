import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import authRoutes from './routes/auth';
import telegramRoutes from './routes/telegram';
import marketRoutes from './routes/market';
import rewardsRoutes from './routes/rewards';
import contentRoutes from './routes/content';
import adminRoutes from './routes/admin';

dotenv.config();

const app = express();

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

app.get('/health', (req, res) => {
  res.send('OK');
});

app.use('/api/auth', authRoutes);
app.use('/api/telegram', telegramRoutes);
app.use('/api/market', marketRoutes);
app.use('/api/rewards', rewardsRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api', contentRoutes);

export default app;
