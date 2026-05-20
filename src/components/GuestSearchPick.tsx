import { useMemo, useState } from "react";
import type { Guest } from "../data/guests";
import { getGuestNameFrom } from "../data/guests";

interface GuestSearchPickProps {
  guests: Guest[];
  value: string;
  onChange: (guestId: string) => void;
  /** Zaključan izbor (npr. posle OTP) — samo ime, bez pretrage i bez „Izabrano“ trake. */
  selectionLocked?: boolean;
  disabled?: boolean;
  ariaInvalid?: boolean;
  inputId?: string;
  searchHint?: string;
}

export function GuestSearchPick({
  guests,
  value,
  onChange,
  selectionLocked = false,
  disabled,
  ariaInvalid,
  inputId = "guest-name-search",
  searchHint = "Klikni na svoje ime na listi.",
}: GuestSearchPickProps) {
  const [query, setQuery] = useState("");

  const sorted = useMemo(
    () =>
      [...guests].sort((a, b) =>
        a.fullName.localeCompare(b.fullName, "sr-Latn", { sensitivity: "base" }),
      ),
    [guests],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return sorted;
    return sorted.filter((g) => g.fullName.toLowerCase().includes(q));
  }, [sorted, query]);

  if (selectionLocked && value) {
    return (
      <p className="text-base font-medium leading-snug text-[#1c1917]">
        {getGuestNameFrom(guests, value)}
      </p>
    );
  }

  if (disabled) {
    return (
      <p className="mt-2 text-sm text-[#6b5b42]">
        Spisak gostiju trenutno nije dostupan.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      <div>
        <label
          htmlFor={inputId}
          className="block text-sm font-semibold text-[#1c1917]"
        >
          Pronađi se na spisku
        </label>
        <input
          id={inputId}
          name="guest_name_filter"
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
          autoCapitalize="off"
          inputMode="search"
          aria-invalid={ariaInvalid}
          aria-describedby={`${inputId}-hint`}
          data-lpignore="true"
          data-1p-ignore="true"
          disabled={guests.length === 0}
          placeholder="Kucaj ime ili prezime…"
          className="mt-2 w-full min-h-[48px] rounded-2xl border border-[rgba(138,101,28,0.22)] bg-white/95 px-4 py-3 text-base text-[#1c1917] shadow-inner outline-none transition focus:border-[#C99A2E] focus:ring-2 focus:ring-[#E7C76F]/45 disabled:bg-champagne-100"
        />
        <p id={`${inputId}-hint`} className="mt-2 text-xs text-champagne-600">
          {searchHint}
        </p>
      </div>

      <div
        className="max-h-[min(220px,36dvh)] overflow-y-auto rounded-2xl border border-[rgba(138,101,28,0.18)] bg-[#FFFCF9]/95 shadow-inner backdrop-blur-sm"
        role="listbox"
        aria-label="Spisak gostiju"
      >
        {filtered.length === 0 ? (
          <p className="px-4 py-8 text-center text-sm text-champagne-600">
            {guests.length === 0
              ? "Spisak se još učitava."
              : "Nema pogotka — proveri slova ili javi domaćinu porukom (vidi obaveštenje ispod)."}
          </p>
        ) : (
          <ul className="divide-y divide-champagne-100/90 p-2">
            {filtered.map((g) => (
              <li key={g.id}>
                <button
                  type="button"
                  role="option"
                  aria-selected={value === g.id}
                  onClick={() => onChange(g.id)}
                  className={`flex w-full min-h-[44px] items-center rounded-xl px-4 py-2.5 text-left text-sm font-medium text-[#1c1917] transition hover:bg-[#FAF0D4]/80 active:scale-[0.995] ${
                    value === g.id
                      ? "bg-[#FAF0D4] ring-2 ring-inset ring-[#C99A2E]/70"
                      : ""
                  }`}
                >
                  {g.fullName}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
