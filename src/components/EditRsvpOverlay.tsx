import { useState } from "react";
import type { Guest } from "../data/guests";
import { sortGuestsByName } from "../data/guests";
import { GuestSearchPick } from "./GuestSearchPick";
import {
  canEditRsvpNow,
  getEditDeadline,
} from "../constants/event";
import {
  isGuestOtpConfigured,
  verifyGuestOtp,
} from "../lib/guestOtp";
import { responseToFormState } from "../lib/rsvpFormMap";
import { fetchRsvpByGuestId } from "../services/rsvp";
import type { FormState } from "../types/rsvpForm";

interface EditRsvpOverlayProps {
  open: boolean;
  onClose: () => void;
  guests: Guest[];
  guestsLoading: boolean;
  supabaseReady: boolean;
  onSuccess: (prefill: FormState) => void;
}

export function EditRsvpOverlay({
  open,
  onClose,
  guests,
  guestsLoading,
  supabaseReady,
  onSuccess,
}: EditRsvpOverlayProps) {
  const [guestId, setGuestId] = useState("");
  const [otp, setOtp] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const guestList = sortGuestsByName(guests);
  const deadlineStr = new Intl.DateTimeFormat("sr-Latn-RS", {
    dateStyle: "long",
    timeStyle: "short",
  }).format(getEditDeadline());

  async function handleUnlock() {
    setError(null);
    if (!supabaseReady) {
      setError("Baza još nije podešena (.env).");
      return;
    }
    if (!canEditRsvpNow()) {
      setError(
        `Rok za izmenu je istekao (${deadlineStr}). Javi domaćinu ako treba pomoć.`,
      );
      return;
    }
    if (!isGuestOtpConfigured()) {
      setError(
        "OTP za goste nije podešen (VITE_GUEST_OTP_SECRET u .env). Pitaj domaćina.",
      );
      return;
    }
    if (!guestId) {
      setError("Izaberi ime sa spiska.");
      return;
    }
    if (!verifyGuestOtp(guestId, otp)) {
      setError("Pogrešan OTP — proveri sa domaćinom.");
      return;
    }

    setBusy(true);
    try {
      const row = await fetchRsvpByGuestId(guestId);
      if (!row) {
        setError(
          "Za ovo ime još nema sačuvanog odgovora. Prvo pošalji potvrdu preko „Potvrdi dolazak”.",
        );
        return;
      }
      onSuccess(responseToFormState(row, guestId));
      setOtp("");
      setGuestId("");
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Greška pri učitavanju.");
    } finally {
      setBusy(false);
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center bg-[#1c1917]/35 p-4 backdrop-blur-md">
      <div className="max-h-[90dvh] w-full max-w-md overflow-y-auto rounded-[1.75rem] border border-[rgba(138,101,28,0.18)] bg-[#FFFCF7]/98 p-7 shadow-[0_28px_70px_-20px_rgba(60,45,20,0.25)] backdrop-blur-xl">
        <h2 className="font-display text-2xl text-[#1c1917]">
          Izmeni svoj odgovor
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-[#6b5b42]">
          Do <strong>{deadlineStr}</strong> možeš da promeniš potvrdu ako si već
          jednom poslala/poslao — uz OTP koji dobiješ od domaćina.
        </p>

        <p className="mt-5 text-sm font-semibold text-[#1c1917]">
          Ti si na spisku kao
        </p>
        <div className="mt-1">
          {guestsLoading ? (
            <p className="text-sm text-champagne-600">Učitavam spisak…</p>
          ) : (
            <GuestSearchPick
              guests={guestList}
              value={guestId}
              onChange={setGuestId}
              disabled={guestList.length === 0}
              inputId="edit-guest-search"
              searchHint="Ceo spisak — nađi sebe, pa unesi OTP ispod."
            />
          )}
        </div>

        <label className="mt-5 block text-sm font-semibold text-[#1c1917]">
          OTP (6 cifara)
        </label>
        <input
          type="text"
          inputMode="numeric"
          maxLength={8}
          autoComplete="one-time-code"
          value={otp}
          onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
          placeholder="••••••"
          className="mt-2 w-full min-h-[52px] rounded-2xl border border-[rgba(138,101,28,0.22)] bg-white px-4 py-3 tracking-[0.45em] text-[#1c1917] outline-none focus:border-[#C99A2E] focus:ring-2 focus:ring-[#E7C76F]/45"
        />

        {error && (
          <p className="mt-4 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-900 ring-1 ring-red-100">
            {error}
          </p>
        )}

        <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border-2 border-[rgba(138,101,28,0.25)] px-6 py-3 text-sm font-semibold text-[#5c4a32] transition hover:bg-[#FAF0D4]/50"
          >
            Otkaži
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => void handleUnlock()}
            className="rounded-full bg-gradient-to-r from-[#C99A2E] via-[#d4af37] to-[#E7C76F] px-8 py-3 text-sm font-semibold text-white shadow-[0_8px_24px_-10px_rgba(138,101,28,0.45)] disabled:opacity-60"
          >
            {busy ? "Proveravam…" : "Otvori izmenu"}
          </button>
        </div>
      </div>
    </div>
  );
}
