/**
 * Jednostavan OTP po gostu (sa javnog liste ID-a).
 * Tajnu držiš samo ti u .env — bez nje izmena nije omogućena u browseru.
 */

export function guestOtpDigits(guestId: string, secret: string): string {
  let h = 2166136261;
  const s = `${guestId}|${secret}`;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  const n = Math.abs(h) % 900000;
  return String(100000 + n).padStart(6, "0").slice(0, 6);
}

export function getGuestOtpSecret(): string {
  return import.meta.env.VITE_GUEST_OTP_SECRET?.trim() ?? "";
}

export function isGuestOtpConfigured(): boolean {
  return getGuestOtpSecret().length >= 8;
}

export function verifyGuestOtp(guestId: string, entered: string): boolean {
  const secret = getGuestOtpSecret();
  if (!isGuestOtpConfigured()) return false;
  const clean = entered.replace(/\s/g, "");
  if (!/^\d{6}$/.test(clean)) return false;
  return guestOtpDigits(guestId, secret) === clean;
}
