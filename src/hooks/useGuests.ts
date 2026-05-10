import { useEffect, useState } from "react";
import type { Guest } from "../data/guests";
import { GUESTS } from "../data/guests";

/**
 * Na hostingu gosti žive u `public/guests.json` — ažuriraš fajl na serveru bez build-a,
 * ili zameniš niz ručno / skriptom posle deploy-a.
 */
export function useGuests(): { guests: Guest[]; loading: boolean } {
  const [guests, setGuests] = useState<Guest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetch(`${import.meta.env.BASE_URL}guests.json`)
      .then((res) => {
        if (!res.ok) throw new Error("no file");
        return res.json() as Promise<unknown>;
      })
      .then((data) => {
        if (cancelled) return;
        if (Array.isArray(data)) setGuests(data as Guest[]);
        else setGuests(GUESTS);
      })
      .catch(() => {
        if (!cancelled) setGuests(GUESTS);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return { guests, loading };
}
