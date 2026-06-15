import { Request, Response } from 'express';
import prisma from '../config/database.js';
import { normalizeNzMobile, isValidNzMobile } from '../utils/nzPhone.js';
import { sendServerError } from '../utils/serverError.js';
import { getHttpRequestMeta, logInfo, logWarn } from '../utils/logger.js';
import { issueUserJwt } from '../utils/authToken.js';
import { timingSafeSecretEqual } from '../utils/timingSafeSecret.js';

const MIN_SETUP_SECRET_LEN = 32;

function setupSecretConfigured(): boolean {
  const s = process.env.APP_SETUP_SECRET?.trim() ?? '';
  return s.length >= MIN_SETUP_SECRET_LEN;
}

/** GET — whether the one-time bootstrap UI may be used (no secret is returned). */
export const getSetupStatus = async (_req: Request, res: Response) => {
  try {
    if (!setupSecretConfigured()) {
      return res.json({ setupAvailable: false });
    }
    const superAdminCount = await prisma.user.count({ where: { role: 'SUPER_ADMIN' } });
    res.json({ setupAvailable: superAdminCount === 0 });
  } catch (error: unknown) {
    sendServerError(res, error, { flow: 'setup_status' });
  }
};

/** POST — create the first SUPER_ADMIN once; requires APP_SETUP_SECRET. */
export const createFirstSuperAdmin = async (req: Request, res: Response) => {
  const baseLog = { flow: 'setup_first_super_admin', ...getHttpRequestMeta(req) };

  try {
    const envSecret = process.env.APP_SETUP_SECRET?.trim() ?? '';
    if (!setupSecretConfigured()) {
      return res.status(503).json({
        error: 'First-time setup is not configured. Set APP_SETUP_SECRET (32+ characters) in the server environment.',
      });
    }

    const { setupSecret, mobileNumber, firstName, lastName, email } = req.body ?? {};
    if (!timingSafeSecretEqual(String(setupSecret ?? ''), envSecret)) {
      logWarn('setup_invalid_secret', baseLog);
      return res.status(401).json({ error: 'Invalid setup credentials.' });
    }

    const superAdminCount = await prisma.user.count({ where: { role: 'SUPER_ADMIN' } });
    if (superAdminCount > 0) {
      return res.status(403).json({
        error: 'Application setup is already complete. Sign in with OTP or remove extra super admins to reuse setup (not recommended).',
      });
    }

    const cleaned = normalizeNzMobile(String(mobileNumber ?? ''));
    if (!isValidNzMobile(cleaned)) {
      return res.status(400).json({ error: 'Invalid mobile number format' });
    }

    const existing = await prisma.user.findUnique({ where: { mobileNumber: cleaned } });
    if (existing) {
      return res.status(409).json({
        error: 'A user with this mobile number already exists. Use a different number or sign in.',
      });
    }

    const user = await prisma.user.create({
      data: {
        mobileNumber: cleaned,
        role: 'SUPER_ADMIN',
        firstName: firstName != null && String(firstName).trim() ? String(firstName).trim() : null,
        lastName: lastName != null && String(lastName).trim() ? String(lastName).trim() : null,
        email: email != null && String(email).trim() ? String(email).trim() : null,
      },
    });

    const token = issueUserJwt(user);
    logInfo('setup_first_super_admin_ok', { ...baseLog, userId: user.id });

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        mobileNumber: user.mobileNumber,
        role: user.role,
        isActive: user.isActive,
        firstName: user.firstName ?? undefined,
        lastName: user.lastName ?? undefined,
        email: user.email ?? undefined,
        agencyName: user.agencyName ?? undefined,
        licenseNumber: user.licenseNumber ?? undefined,
      },
    });
  } catch (error: unknown) {
    sendServerError(res, error, baseLog);
  }
};
