import type { Request, Response } from 'express';
import { geocodeAddress } from '../services/geocode/nominatimAdapter.js';

export async function geocodeHandler(req: Request, res: Response): Promise<void> {
  const q = typeof req.query.q === 'string' ? req.query.q : '';
  if (!q.trim()) {
    res.status(400).json({ error: 'q query parameter is required.' });
    return;
  }
  try {
    const result = await geocodeAddress(q);
    res.json(result);
  } catch (err) {
    res.status(502).json({
      error: 'Geocoding service unavailable.',
      message: err instanceof Error ? err.message : 'Unknown error',
    });
  }
}
