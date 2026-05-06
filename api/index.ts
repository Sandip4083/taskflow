import app from '../backend/src/server';

export default async function handler(req: any, res: any) {
  try {
    // Basic health check to see if we reach this point
    if (req.url === '/api/ping') {
      return res.status(200).json({ pong: true, time: new Date().toISOString() });
    }
    
    // Execute the Express app
    return app(req, res);
  } catch (err: any) {
    console.error('Vercel API Crash:', err);
    return res.status(500).json({ 
      error: 'Vercel API Crash', 
      message: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
}
