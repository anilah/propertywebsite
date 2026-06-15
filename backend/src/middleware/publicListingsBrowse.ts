import type { Request, Response, NextFunction } from 'express';

/**
 * When PUBLIC_LISTINGS_API_ENABLED=false, public browse/search and enquiries are off.
 * Sprint 1 (admin/agent only): set false in production so consumers are not distracted
 * and listing discovery APIs are not exposed.
 */
export function requirePublicListingsBrowseEnabled(
  _req: Request,
  res: Response,
  next: NextFunction
): void {
  if (process.env.PUBLIC_LISTINGS_API_ENABLED === 'false') {
    res.status(404).json({ error: 'Not found' });
    return;
  }
  next();
}
