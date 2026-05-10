import type { PostgrestError } from "@supabase/supabase-js";

function isPostgrestError(e: unknown): e is PostgrestError {
  return (
    typeof e === "object" &&
    e !== null &&
    "message" in e &&
    typeof (e as PostgrestError).message === "string"
  );
}

export function formatSupabaseError(error: unknown): string {
  if (isPostgrestError(error)) {
    const msg = error.message ?? "";
    const code = error.code ?? "";

    if (
      msg.includes("relation") &&
      (msg.includes("does not exist") || msg.includes("ne postoji"))
    ) {
      return (
        "Tabela u bazi ne postoji. Pokreni supabase/schema.sql (ili migration_guest_id.sql) u Supabase SQL Editoru."
      );
    }

    if (
      code === "42501" ||
      /permission denied|RLS|row-level security/i.test(msg)
    ) {
      return (
        "Supabase je blokirao upit — proveri RLS politike za anon insert/select/update na public.rsvp_responses (vidi schema.sql)."
      );
    }

    if (
      /no unique|exclusion constraint matching/i.test(msg) ||
      /ON CONFLICT/i.test(msg)
    ) {
      return (
        "Nedostaje jedinstveni uslov na guest_id. Primeni supabase/schema.sql ili migration_guest_id.sql."
      );
    }

    if (code === "PGRST301" || /JWT|invalid api key/i.test(msg)) {
      return (
        "Nevažeći API ključ — koristi publishable ili anon ključ iz Supabase → Project Settings → API u VITE_SUPABASE_PUBLISHABLE_KEY ili VITE_SUPABASE_ANON_KEY."
      );
    }

    if (/fetch failed|network|Failed to fetch/i.test(msg)) {
      return (
        "Nije moguće doći do Supabase-a — proveri VITE_SUPABASE_URL i mrežu."
      );
    }

    return msg || "Greška baze.";
  }

  if (error instanceof Error) return error.message;
  return "Nepoznata greška baze.";
}
