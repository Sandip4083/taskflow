import dotenv from 'dotenv';

// Only load .env file in non-Vercel environments
// On Vercel, env vars are injected by the platform
if (!process.env.VERCEL) {
  dotenv.config();
}

export const env = {
  PORT: parseInt(process.env.PORT || '4000'),
  MONGODB_URI: process.env.MONGODB_URI || '',
  JWT_SECRET: process.env.JWT_SECRET || 'fallback-secret',
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || 'fallback-refresh',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '15m',
  JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173',
};
