import type { SupabaseClient } from "@supabase/supabase-js";
import { isSupabaseConfigured, supabase } from "../utils/supabase";

export { isSupabaseConfigured } from "../utils/supabase";

export function getSupabase(): SupabaseClient {
  if (!isSupabaseConfigured()) {
    throw new Error(
      "Missing or invalid .env: set VITE_SUPABASE_URL and " +
        "VITE_SUPABASE_PUBLISHABLE_KEY (or VITE_SUPABASE_ANON_KEY).",
    );
  }
  return supabase;
}
