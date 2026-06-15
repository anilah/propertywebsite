import { Response } from 'express';
import prisma from '../config/database.js';
import { AuthRequest } from '../middleware/auth.js';
import { sendServerError } from '../utils/serverError.js';
import { normalizeNzMobile, isValidNzMobile } from '../utils/nzPhone.js';

/** GET /api/auth/me — current user's own profile */
export const getMyProfile = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: 'Authentication required' });

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        mobileNumber: true,
        role: true,
        isActive: true,
        firstName: true,
        lastName: true,
        email: true,
        agencyName: true,
        licenseNumber: true,
        profilePhotoUrl: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ user });
  } catch (error: unknown) {
    sendServerError(res, error);
  }
};

/** PATCH /api/auth/me — update own profile (name, email, agency, license, photo) */
export const updateMyProfile = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: 'Authentication required' });

    const body = req.body as Record<string, unknown>;

    // Super admin mobile is controlled exclusively via SUPER_ADMIN_MOBILE env var
    if (req.user?.role === 'SUPER_ADMIN' && body.mobileNumber !== undefined) {
      return res.status(400).json({
        error: 'Super admin mobile number is managed via the SUPER_ADMIN_MOBILE environment variable.',
      });
    }

    const data: {
      mobileNumber?: string;
      firstName?: string;
      lastName?: string;
      email?: string | null;
      agencyName?: string | null;
      licenseNumber?: string | null;
      profilePhotoUrl?: string | null;
    } = {};

    if (body.mobileNumber !== undefined) {
      const cleaned = normalizeNzMobile(String(body.mobileNumber ?? ''));
      if (!isValidNzMobile(cleaned)) {
        return res.status(400).json({ error: 'Invalid mobile number format' });
      }
      const taken = await prisma.user.findUnique({ where: { mobileNumber: cleaned } });
      if (taken && taken.id !== userId) {
        return res.status(409).json({ error: 'A user with this mobile number already exists' });
      }
      data.mobileNumber = cleaned;
    }

    if (body.firstName !== undefined) {
      const v = String(body.firstName ?? '').trim();
      if (!v) return res.status(400).json({ error: 'First name cannot be empty' });
      data.firstName = v;
    }
    if (body.lastName !== undefined) {
      const v = String(body.lastName ?? '').trim();
      if (!v) return res.status(400).json({ error: 'Last name cannot be empty' });
      data.lastName = v;
    }
    if (body.email !== undefined) {
      data.email = body.email != null && String(body.email).trim() ? String(body.email).trim() : null;
    }
    if (body.agencyName !== undefined) {
      data.agencyName =
        body.agencyName != null && String(body.agencyName).trim()
          ? String(body.agencyName).trim()
          : null;
    }
    if (body.licenseNumber !== undefined) {
      data.licenseNumber =
        body.licenseNumber != null && String(body.licenseNumber).trim()
          ? String(body.licenseNumber).trim()
          : null;
    }
    if (body.profilePhotoUrl !== undefined) {
      data.profilePhotoUrl =
        body.profilePhotoUrl != null && String(body.profilePhotoUrl).trim()
          ? String(body.profilePhotoUrl).trim()
          : null;
    }

    if (Object.keys(data).length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data,
      select: {
        id: true,
        mobileNumber: true,
        role: true,
        isActive: true,
        firstName: true,
        lastName: true,
        email: true,
        agencyName: true,
        licenseNumber: true,
        profilePhotoUrl: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    res.json({ success: true, user: updated });
  } catch (error: unknown) {
    sendServerError(res, error);
  }
};
