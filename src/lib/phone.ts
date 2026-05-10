/** Lokalni deo srpskog mobilnog broja posle +381, bez vodeće nule (npr. 64…). */
const RS_MOBILE_LOCAL = /^6[0-9]{7,8}$/;

export function sanitizePhoneLocal(input: string): string {
  let d = input.replace(/\D/g, "");
  if (d.startsWith("381")) d = d.slice(3);
  if (d.startsWith("0")) d = d.slice(1);
  return d.slice(0, 9);
}

export function isValidPhoneLocal(d: string): boolean {
  return RS_MOBILE_LOCAL.test(d);
}

export function phoneLocalToE164(local: string): string {
  return `+381${local}`;
}

/** Iz +381… ili legacy zapisa izvlači lokalni deo za input. */
export function phoneE164ToLocal(e164: string | null | undefined): string {
  if (!e164) return "";
  let d = e164.replace(/\D/g, "");
  if (d.startsWith("381")) d = d.slice(3);
  if (d.startsWith("0")) d = d.slice(1);
  return d.slice(0, 9);
}
