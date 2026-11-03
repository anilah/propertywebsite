import type { Request, Response } from 'express';
import { getSchoolZones } from '../services/schoolZones/index.js';

function parseCoord(value: unknown): number | null {
  if (typeof value !== 'string') return null;
  const n = Number(value);
  if (!Number.isFinite(n)) return null;
  return n;
}

export async function getSchoolZonesHandler(req: Request, res: Response): Promise<void> {
  const lat = parseCoord(req.query.lat);
  const lng = parseCoord(req.query.lng);
  if (lat === null || lng === null) {
    res.status(400).json({ error: 'lat and lng query parameters are required (numbers).' });
    return;
  }
  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
    res.status(400).json({ error: 'lat must be in [-90, 90] and lng in [-180, 180].' });
    return;
  }
  try {
    const data = await getSchoolZones(lat, lng);
    // 1h CDN-friendly cache; per-listing usage is low-volume and MOE data changes infrequently.
    res.setHeader('Cache-Control', 'public, max-age=3600');
    res.json(data);
  } catch (err) {
    res.status(502).json({
      error: 'Upstream school zone data unavailable.',
      message: err instanceof Error ? err.message : 'Unknown error',
    });
  }
}
