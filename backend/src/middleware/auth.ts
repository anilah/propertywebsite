import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UserRole as DbUserRole } from '../types/enums.js';
import prisma from '../config/database.js';

export type UserRole = 'SUPER_ADMIN' | 'AGENT' | 'PENDING';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    mobileNumber: string;
    role: UserRole;
    isActive?: boolean;
  };
}

export const authenticate = (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      id: string;
      mobileNumber: string;
      role: UserRole;
      isActive?: boolean;
    };

    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

/** Optional auth: attach req.user when token is valid; continue silently otherwise */
export const authenticateOptional = (req: AuthRequest, _res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) return next();

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      id: string;
      mobileNumber: string;
      role: UserRole;
      isActive?: boolean;
    };

    req.user = decoded;
    next();
  } catch {
    // Keep public behavior for invalid/missing token on public routes.
    next();
  }
};

/** Agent area: list/manage properties. Allowed for active AGENT and SUPER_ADMIN */
export const requireAgent = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (req.user?.role !== 'AGENT' && req.user?.role !== 'SUPER_ADMIN') {
    return res.status(403).json({
      error: 'Agent access required',
      code: req.user?.role === 'PENDING' ? 'PENDING_APPROVAL' : 'FORBIDDEN',
    });
  }
  if (req.user?.role === 'AGENT' && req.user?.isActive === false) {
    return res.status(403).json({
      error: 'Your agent account has been deactivated. Contact a super admin.',
      code: 'AGENT_DEACTIVATED',
    });
  }
  next();
};

/**
 * Super admin only. Re-validates role from the database so demoted users cannot keep acting
 * with an old JWT until expiry (enterprise expectation for privileged routes).
 */
export const requireSuperAdmin = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (req.user?.role !== 'SUPER_ADMIN') {
      return res.status(403).json({ error: 'Super admin access required' });
    }
    const uid = req.user.id;
    const row = await prisma.user.findUnique({
      where: { id: uid },
      select: { role: true },
    });
    if (!row || row.role !== DbUserRole.SUPER_ADMIN) {
      return res.status(403).json({ error: 'Super admin access required' });
    }
    next();
  } catch (err) {
    next(err as Error);
  }
};

/** @deprecated Use requireAgent */
export const requireAdmin = requireAgent;
