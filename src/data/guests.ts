/**
 * Spisak pozvanih gostiju — biraju se u RSVP-u (padajuća lista).
 * Kasnije možeš:
 * - proširiti ovaj niz ručno ili skriptom iz Excel/CSV,
 * - ili u `guests.ts` učitati podatke iz Supabase/Firebase (tabela `guests`).
 */

export type Guest = {
  id: string;
  fullName: string;
};

/** Rezerva ako `public/guests.json` ne može da se učita (obično prazan — izvor je JSON na hostingu). */
export const GUESTS: Guest[] = [];

export function getGuestById(id: string): Guest | undefined {
  return GUESTS.find((g) => g.id === id);
}

export function getGuestName(id: string): string {
  return getGuestById(id)?.fullName ?? "";
}

/** Ime za izabrani id iz proizvoljnog niza (npr. učitano sa hosta). */
export function getGuestNameFrom(list: Guest[], id: string): string {
  return list.find((g) => g.id === id)?.fullName ?? "";
}

export function sortGuestsByName(guests: Guest[]): Guest[] {
  return [...guests].sort((a, b) =>
    a.fullName.localeCompare(b.fullName, "sr-Latn", { sensitivity: "base" }),
  );
}

export function guestsSortedByName(): Guest[] {
  return sortGuestsByName(GUESTS);
}
