/**
 * Normalize user input to NZ domestic mobile: 0 + 9 digits (10 chars total).
 */
export function normalizeNzMobile(raw: string): string {
  let s = raw.replace(/\s+/g, '').trim();
  if (s.startsWith('+')) s = s.slice(1);
  // +64 021 … pasted as 640211234567 → 0211234567
  if (s.startsWith('640') && /^640\d{9}$/.test(s)) {
    s = `0${s.slice(3)}`;
  } else if (s.startsWith('64') && s.length === 11 && /^64[2-9]\d{8}$/.test(s)) {
    // 64211234567 → 0211234567
    s = `0${s.slice(2)}`;
  }
  // Domestic missing trunk 0: 211234567 → 0211234567
  if (/^2\d{8}$/.test(s)) {
    s = `0${s}`;
  }
  return s;
}

export function isValidNzMobile(digits: string): boolean {
  return /^0\d{9}$/.test(digits);
}
