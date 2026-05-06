import mongoose from 'mongoose';
import { env } from './env.js';

let isConnected = false;

export const connectDB = async () => {
  if (isConnected) return;

  try {
    const conn = await mongoose.connect(env.MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    });
    isConnected = true;
    console.log(`✅ MongoDB connected: ${conn.connection.host}`);
  } catch (error: any) {
    if (error.message?.includes('SSL') || error.message?.includes('TLS')) {
      console.error('❌ MongoDB SSL Error. Likely causes:');
      console.error('   1. Your IP is not whitelisted on MongoDB Atlas');
      console.error('   2. Go to Atlas → Network Access → Add Current IP');
      console.error('   3. Or add 0.0.0.0/0 to allow all IPs (dev only)');
    }
    console.error('❌ MongoDB connection error:', error.message);
    // Don't process.exit() in serverless — throw so the caller can handle it
    throw error;
  }
};
