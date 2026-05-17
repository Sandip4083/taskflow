// Vercel Serverless Function — delegates all /api/* requests to Express app
// This file is the entry point for @vercel/node builder
import app from '../backend/src/server.js';
import type { VercelRequest, VercelResponse } from '@vercel/node';

// Export as a Vercel serverless handler
export default function handler(req: VercelRequest, res: VercelResponse) {
  // Ensure the Express app processes the request
  return app(req, res);
}
