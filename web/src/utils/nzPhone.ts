/**
 * Normalize user input to NZ domestic mobile format.
 * Handles both standard (10-digit) and extended (11-digit) domestic formats,
 * and their international equivalents (+64 with 9 or 10 digit suffix).
 */
export function normalizeNzMobile(raw: string): string {
  let s = raw.replace(/[\s\-().]/g, '').trim();
  if (s.startsWith('+')) s = s.slice(1);

  // +64 0xx … → strip redundant trunk: 640211234567 → 0211234567
  if (s.startsWith('640') && /^640\d{8,9}$/.test(s)) {
    s = `0${s.slice(3)}`;
  } else if (s.startsWith('64') && /^64[2-9]\d{8,9}$/.test(s)) {
    // 64211234567 (11 digits) or 642102971565 (12 digits) → 0xx…
    s = `0${s.slice(2)}`;
  }

  // Domestic missing trunk 0: 21xxxxxxx or 21xxxxxxxxx → 021…
  if (/^[2-9]\d{7,9}$/.test(s)) {
    s = `0${s}`;
  }

  return s;
}

export function isValidNzMobile(digits: string): boolean {
  // Accepts 10-digit (021 xxx xxxx) and 11-digit extended (021 0xxx xxxx) domestic formats
  return /^0[2-9]\d{8,9}$/.test(digits);
}

/**
 * Convert any NZ phone number (domestic or already international) to the
 * E.164 international format used by WhatsApp links (without leading +).
 * e.g. "021 123 4567" → "64211234567"
 * Returns null if the number cannot be normalised to a valid NZ mobile.
 */
export function toWhatsAppNumber(raw: string): string | null {
  const domestic = normalizeNzMobile(raw);
  if (!isValidNzMobile(domestic)) return null;
  // Strip leading 0 and prepend NZ country code 64
  return `64${domestic.slice(1)}`;
}

/**
 * Returns a WhatsApp deep-link URL with an optional pre-filled message.
 * e.g. toWhatsAppUrl("021 123 4567", "Hi, I'm interested in your listing...")
 */
export function toWhatsAppUrl(raw: string, message?: string): string | null {
  const intl = toWhatsAppNumber(raw);
  if (!intl) return null;
  const base = `https://wa.me/${intl}`;
  if (!message) return base;
  return `${base}?text=${encodeURIComponent(message)}`;
}
