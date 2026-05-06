import app from '../backend/src/server';

export default function handler(req: any, res: any) {
  try {
    return app(req, res);
  } catch (err: any) {
    console.error('Runtime error:', err);
    res.status(500).json({ error: 'Runtime error', details: err.message, stack: err.stack });
  }
}
