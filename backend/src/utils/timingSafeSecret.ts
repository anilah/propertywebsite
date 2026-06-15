import { createHash, timingSafeEqual } from 'node:crypto';

/** Compare two strings without early exit on length mismatch (via SHA-256 digests). */
export function timingSafeSecretEqual(provided: string, expected: string): boolean {
  const ha = createHash('sha256').update(provided, 'utf8').digest();
  const hb = createHash('sha256').update(expected, 'utf8').digest();
  try {
    return timingSafeEqual(ha, hb);
  } catch {
    return false;
  }
}
