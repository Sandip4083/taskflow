import express from 'express';
import cors from 'cors';
import { createServer } from 'http';

import { env } from './config/env.js';
import { connectDB } from './config/db.js';
import { errorHandler } from './middleware/errorHandler.js';

// Routes
import authRoutes from './routes/authRoutes.js';
import projectRoutes from './routes/projectRoutes.js';
import taskRoutes from './routes/taskRoutes.js';
import commentRoutes from './routes/commentRoutes.js';
import userRoutes from './routes/userRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';

const app = express();
const httpServer = createServer(app);



// Middleware
app.use(cors({
  origin: (origin, callback) => {
    // Allow any localhost origin in dev, or the configured CLIENT_URL
    if (!origin || origin.startsWith('http://localhost') || origin === env.CLIENT_URL) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Connect DB for serverless environments
let isDbConnected = false;
app.use(async (req, res, next) => {
  if (!isDbConnected) {
    try {
      await connectDB();
      isDbConnected = true;
    } catch (err) {
      console.error('Failed to connect to DB in serverless function', err);
    }
  }
  next();
});

// Health check (no auth required)
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api', taskRoutes);
app.use('/api', commentRoutes);
app.use('/api', userRoutes);
app.use('/api/analytics', analyticsRoutes);

// Error handler (must be last)
app.use(errorHandler);

// Start (Only run listen if not on Vercel)
if (!process.env.VERCEL) {
  const start = async () => {
    await connectDB();
    httpServer.listen(env.PORT, () => {
      console.log(`🚀 Server running on http://localhost:${env.PORT}`);
    });
  };
  start();
}

export default app;
