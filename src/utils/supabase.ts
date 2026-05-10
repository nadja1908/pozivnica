import { createClient } from "@supabase/supabase-js";

const supabaseUrl = (
  import.meta.env.VITE_SUPABASE_URL as string | undefined
)?.trim() ?? "";

const supabaseKey = (
  (import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined) ??
  (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined) ??
  ""
).trim();

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false,
  },
});

function isPlausibleSupabaseUrl(u: string): boolean {
  try {
    const parsed = new URL(u);
    if (parsed.protocol === "https:") return true;
    if (
      parsed.protocol === "http:" &&
      /^(127\.0\.0\.1|localhost)$/i.test(parsed.hostname)
    ) {
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

function looksLikeSupabaseKey(key: string): boolean {
  const k = key.trim();
  if (k.length < 20) return false;
  if (k.startsWith("eyJ")) return true;
  if (k.startsWith("sb_publishable_")) return k.length >= 32;
  return k.length >= 40;
}

export function isSupabaseConfigured(): boolean {
  if (!supabaseUrl || !supabaseKey) return false;
  if (!isPlausibleSupabaseUrl(supabaseUrl)) return false;
  if (!looksLikeSupabaseKey(supabaseKey)) return false;
  return true;
}
