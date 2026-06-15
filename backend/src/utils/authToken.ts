import jwt from 'jsonwebtoken';
import type { User } from '@prisma/client';

export function issueUserJwt(user: Pick<User, 'id' | 'mobileNumber' | 'role' | 'isActive'>): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET is not set');
  const expiresIn = process.env.JWT_EXPIRES_IN || '7d';
  return jwt.sign(
    {
      id: user.id,
      mobileNumber: user.mobileNumber,
      role: user.role,
      isActive: user.isActive,
    },
    secret,
    { expiresIn } as jwt.SignOptions
  );
}
