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
const allowedOrigins = [
  env.CLIENT_URL,
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175',
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, Postman, server-to-server)
    if (!origin) return callback(null, true);
    // Allow any localhost origin in dev
    if (origin.startsWith('http://localhost')) return callback(null, true);
    // Allow any Vercel deployment origin
    if (origin.endsWith('.vercel.app')) return callback(null, true);
    // Allow configured CLIENT_URL
    if (allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Connect DB for serverless environments — lazy connection with caching
let dbConnectionPromise: Promise<void> | null = null;

app.use(async (_req, res, next) => {
  if (!dbConnectionPromise) {
    dbConnectionPromise = connectDB().catch((err) => {
      dbConnectionPromise = null; // Reset so next request retries
      throw err;
    });
  }
  try {
    await dbConnectionPromise;
    next();
  } catch (err) {
    console.error('Failed to connect to DB in serverless function', err);
    res.status(503).json({ error: 'Database connection failed. Please try again.' });
  }
});

// Health check (no auth required)
app.get('/api/health', (_req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    env: {
      has_mongo: !!env.MONGODB_URI,
      has_jwt: !!env.JWT_SECRET,
      client_url: env.CLIENT_URL,
      node_env: process.env.NODE_ENV,
      is_vercel: !!process.env.VERCEL
    }
  });
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
