import { useMemo } from "react";
import type { Guest } from "../data/guests";
import { getGuestNameFrom } from "../data/guests";

interface GuestSearchPickProps {
  guests: Guest[];
  value: string;
  onChange: (guestId: string) => void;
  /** Zaključan izbor (npr. posle OTP) — samo ime, bez liste. */
  selectionLocked?: boolean;
  disabled?: boolean;
  ariaInvalid?: boolean;
  inputId?: string;
}

export function GuestSearchPick({
  guests,
  value,
  onChange,
  selectionLocked = false,
  disabled,
  ariaInvalid,
  inputId = "guest-name-list",
}: GuestSearchPickProps) {
  const sorted = useMemo(
    () =>
      [...guests].sort((a, b) =>
        a.fullName.localeCompare(b.fullName, "sr-Latn", { sensitivity: "base" }),
      ),
    [guests],
  );

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
    <div
      id={inputId}
      className="max-h-[min(280px,42dvh)] overflow-y-auto rounded-2xl border border-[rgba(138,101,28,0.18)] bg-[#FFFCF9]/95 shadow-inner backdrop-blur-sm"
      role="listbox"
      aria-label="Spisak gostiju"
      aria-invalid={ariaInvalid}
    >
      {sorted.length === 0 ? (
        <p className="px-4 py-8 text-center text-sm text-champagne-600">
          Spisak se još učitava.
        </p>
      ) : (
        <ul className="divide-y divide-champagne-100/90 p-2">
          {sorted.map((g) => (
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
  );
}
