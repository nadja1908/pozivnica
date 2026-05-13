import { getSupabase } from "../lib/supabase";

export const SELFIE_BUCKET = "rsvp-selfies";

const MAX_BYTES = 5 * 1024 * 1024;

const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

function extFor(file: File): string {
  const t = file.type;
  if (t === "image/png") return "png";
  if (t === "image/webp") return "webp";
  return "jpg";
}

export function validateSelfieFile(file: File): string | null {
  if (!ALLOWED_TYPES.has(file.type)) {
    return "Dozvoljeni formati: JPG, PNG ili WebP.";
  }
  if (file.size > MAX_BYTES) {
    return "Slika je prevelika — maks. 5 MB.";
  }
  return null;
}

export async function uploadRsvpSelfie(
  guestId: string,
  file: File,
): Promise<string> {
  const err = validateSelfieFile(file);
  if (err) throw new Error(err);

  const supabase = getSupabase();
  const safeGuest = guestId.replace(/[^a-zA-Z0-9_-]/g, "_");
  const name = `${safeGuest}/${crypto.randomUUID()}.${extFor(file)}`;
  const { error } = await supabase.storage
    .from(SELFIE_BUCKET)
    .upload(name, file, {
      cacheControl: "3600",
      upsert: false,
      contentType: file.type || "image/jpeg",
    });

  if (error) {
    const m = error.message ?? "";
    if (/bucket|not found|does not exist/i.test(m)) {
      throw new Error(
        "Bucket „rsvp-selfies” nije podešen. U Supabase SQL Editoru pokreni supabase/migration_selfie_storage.sql.",
      );
    }
    throw new Error(m || "Greška pri otpremanju slike.");
  }
  return name;
}

/**
 * Javna adresa slike za img src ili otvaranje u browseru.
 * Prihvata relativnu putanju iz Storage-a (npr. `gost/uuid.jpg`) ili već
 * sačuvan pun `https://…` URL u bazi.
 */
export function publicSelfieUrl(storagePathOrUrl: string | null | undefined): string {
  const s = storagePathOrUrl?.trim() ?? "";
  if (!s) return "";
  if (/^https?:\/\//i.test(s)) return s;

  const base = (
    import.meta.env.VITE_SUPABASE_URL as string | undefined
  )?.trim();
  if (!base) return "";
  const root = base.replace(/\/$/, "");
  const enc = s.split("/").map(encodeURIComponent).join("/");
  return `${root}/storage/v1/object/public/${SELFIE_BUCKET}/${enc}`;
}
