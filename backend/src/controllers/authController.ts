import { Request, Response } from 'express';
import prisma from '../config/database.js';
import { normalizeNzMobile, isValidNzMobile } from '../utils/nzPhone.js';
import { sendServerError } from '../utils/serverError.js';
import { getHttpRequestMeta, logInfo, logWarn } from '../utils/logger.js';
import { issueUserJwt } from '../utils/authToken.js';
import type { AuthRequest } from '../middleware/auth.js';

/**
 * Returns the SUPER_ADMIN_OTP from env.
 * Must be a non-empty string; the server will refuse to start login if missing.
 */
function getSuperAdminOtp(): string {
  return process.env.SUPER_ADMIN_OTP?.trim() ?? '';
}

/**
 * Returns the normalised SUPER_ADMIN_MOBILE from env.
 * Super admin's mobile number is controlled exclusively via this env var.
 */
function getSuperAdminMobile(): string {
  return process.env.SUPER_ADMIN_MOBILE?.trim() ?? '';
}

/** POST /api/auth/login — mobile + PIN, single step */
export const login = async (req: Request, res: Response) => {
  const baseLog = { flow: 'login', ...getHttpRequestMeta(req) };
  try {
    const { mobileNumber, pin } = req.body ?? {};

    const cleaned = normalizeNzMobile(String(mobileNumber ?? ''));
    if (!isValidNzMobile(cleaned)) {
      logWarn('login_invalid_mobile', baseLog);
      return res.status(400).json({ error: 'Invalid mobile number format' });
    }

    const pinStr = String(pin ?? '').trim();
    if (!pinStr) {
      return res.status(400).json({ error: 'PIN is required' });
    }

    const user = await prisma.user.findUnique({ where: { mobileNumber: cleaned } });

    if (!user) {
      logInfo('login_user_not_found', baseLog);
      return res.status(401).json({ error: 'Invalid mobile number or PIN' });
    }

    if (user.role === 'PENDING') {
      return res.status(403).json({
        error: 'Your registration is pending approval by an administrator. You will be able to log in once approved.',
        code: 'PENDING_APPROVAL',
      });
    }
    if (user.role !== 'SUPER_ADMIN' && user.role !== 'AGENT') {
      return res.status(403).json({ error: 'Sign-in is not available for this account.' });
    }
    if (user.role === 'AGENT' && user.isActive === false) {
      return res.status(403).json({ error: 'Your agent account has been deactivated. Contact a super admin.' });
    }

    // Super Admin: both mobile and PIN come exclusively from env vars, never from DB
    if (user.role === 'SUPER_ADMIN') {
      const envMobile = getSuperAdminMobile();
      if (!envMobile) {
        logWarn('login_super_admin_mobile_not_configured', { ...baseLog, userId: user.id });
        return res.status(503).json({ error: 'Super admin login is not configured. Set SUPER_ADMIN_MOBILE in server environment.' });
      }
      if (cleaned !== normalizeNzMobile(envMobile)) {
        logWarn('login_super_admin_mobile_mismatch', { ...baseLog, userId: user.id });
        return res.status(401).json({ error: 'Invalid mobile number or PIN' });
      }
      const envOtp = getSuperAdminOtp();
      if (!envOtp) {
        logWarn('login_super_admin_otp_not_configured', { ...baseLog, userId: user.id });
        return res.status(503).json({ error: 'Super admin login is not configured. Set SUPER_ADMIN_OTP in server environment.' });
      }
      if (pinStr !== envOtp) {
        logWarn('login_super_admin_wrong_pin', { ...baseLog, userId: user.id });
        return res.status(401).json({ error: 'Invalid mobile number or PIN' });
      }
    } else {
      // Agent: PIN stored as plain text (visible to super admin for sharing)
      if (!user.pin) {
        logWarn('login_agent_no_pin', { ...baseLog, userId: user.id });
        return res.status(401).json({ error: 'No PIN set for this account. Ask your super admin to generate one.' });
      }
      if (pinStr !== user.pin) {
        logWarn('login_agent_wrong_pin', { ...baseLog, userId: user.id });
        return res.status(401).json({ error: 'Invalid mobile number or PIN' });
      }
    }

    const token = issueUserJwt(user);
    logInfo('login_success', { ...baseLog, userId: user.id, role: user.role });

    return res.json({
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

/**
 * PATCH /api/auth/me/pin — agent changes their own PIN.
 * Super admins change their PIN by updating SUPER_ADMIN_OTP in the server environment.
 */
export const changeMyPin = async (req: AuthRequest, res: Response) => {
  const baseLog = { flow: 'change_pin', ...getHttpRequestMeta(req) };
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: 'Authentication required' });

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return res.status(404).json({ error: 'User not found' });

    if (user.role === 'SUPER_ADMIN') {
      return res.status(400).json({
        error: 'Super admin PIN is managed via the SUPER_ADMIN_OTP environment variable.',
      });
    }

    const { currentPin, newPin } = req.body ?? {};
    const currentPinStr = String(currentPin ?? '').trim();
    const newPinStr = String(newPin ?? '').trim();

    if (!newPinStr || !/^\d{6}$/.test(newPinStr)) {
      return res.status(400).json({ error: 'New PIN must be exactly 6 digits' });
    }

    // Require current PIN if one is already stored
    if (user.pin) {
      if (!currentPinStr) return res.status(400).json({ error: 'Current PIN is required' });
      if (currentPinStr !== user.pin) {
        logWarn('change_pin_wrong_current', { ...baseLog, userId });
        return res.status(401).json({ error: 'Current PIN is incorrect' });
      }
    }

    await prisma.user.update({ where: { id: userId }, data: { pin: newPinStr } });
    logInfo('change_pin_success', { ...baseLog, userId });

    return res.json({ success: true, message: 'PIN changed successfully' });
  } catch (error: unknown) {
    sendServerError(res, error, baseLog);
  }
};

/** POST /api/auth/register — public self-signup for agents */
export const register = async (req: Request, res: Response) => {
  const baseLog = { flow: 'register', ...getHttpRequestMeta(req) };
  try {
    const {
      mobileNumber, firstName, lastName, pin,
      email, agencyName, licenseNumber, officePhone, whatsappNumber,
    } = req.body ?? {};

    const cleaned = normalizeNzMobile(String(mobileNumber ?? ''));
    if (!isValidNzMobile(cleaned)) {
      return res.status(400).json({ error: 'Invalid mobile number. Please enter a valid NZ mobile number.' });
    }
    if (!String(firstName ?? '').trim()) return res.status(400).json({ error: 'First name is required.' });
    if (!String(lastName ?? '').trim())  return res.status(400).json({ error: 'Last name is required.' });

    const pinStr = String(pin ?? '').trim();
    if (!/^\d{6}$/.test(pinStr)) {
      return res.status(400).json({ error: 'PIN must be exactly 6 digits.' });
    }

    const existing = await prisma.user.findUnique({ where: { mobileNumber: cleaned } });
    if (existing) {
      return res.status(409).json({ error: 'An account with this mobile number already exists.' });
    }

    const user = await prisma.user.create({
      data: {
        mobileNumber:  cleaned,
        firstName:     String(firstName).trim(),
        lastName:      String(lastName).trim(),
        pin:           pinStr,
        role:          'PENDING',
        isActive:      true,
        email:         email ? String(email).trim() || null : null,
        agencyName:    agencyName ? String(agencyName).trim() || null : null,
        licenseNumber:   licenseNumber ? String(licenseNumber).trim() || null : null,
        officePhone:     officePhone ? String(officePhone).trim() || null : null,
        whatsappNumber:  whatsappNumber ? String(whatsappNumber).trim() || null : null,
      },
    });

    logInfo('agent_registered', { ...baseLog, userId: user.id });

    return res.status(201).json({
      success: true,
      message: 'Registration submitted. You can log in once an administrator approves your account.',
    });
  } catch (error: unknown) {
    sendServerError(res, error, baseLog);
  }
};
