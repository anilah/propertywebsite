/**
 * Normalize user input to NZ domestic mobile: 0 + 9 digits (10 chars total).
 */
export function normalizeNzMobile(raw: string): string {
  let s = String(raw ?? '')
    .replace(/\s+/g, '')
    .trim();
  if (s.startsWith('+')) s = s.slice(1);
  if (s.startsWith('640') && /^640\d{9}$/.test(s)) {
    s = `0${s.slice(3)}`;
  } else if (s.startsWith('64') && s.length === 11 && /^64[2-9]\d{8}$/.test(s)) {
    s = `0${s.slice(2)}`;
  }
  if (/^2\d{8}$/.test(s)) {
    s = `0${s}`;
  }
  return s;
}

export function isValidNzMobile(digits: string): boolean {
  return /^0\d{9}$/.test(digits);
}
