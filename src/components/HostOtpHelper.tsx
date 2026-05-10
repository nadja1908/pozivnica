import { useMemo, useState } from "react";
import type { Guest } from "../data/guests";
import { sortGuestsByName } from "../data/guests";
import {
  guestOtpDigits,
  getGuestOtpSecret,
  isGuestOtpConfigured,
} from "../lib/guestOtp";

interface HostOtpHelperProps {
  guests: Guest[];
}

export function HostOtpHelper({ guests }: HostOtpHelperProps) {
  const [guestId, setGuestId] = useState("");
  const list = useMemo(() => sortGuestsByName(guests), [guests]);
  const secret = getGuestOtpSecret();

  const otp =
    guestId && isGuestOtpConfigured()
      ? guestOtpDigits(guestId, secret)
      : "";

  function copy() {
    if (!otp) return;
    void navigator.clipboard.writeText(otp);
  }

  if (!isGuestOtpConfigured()) {
    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
        Dodaj u <code className="rounded bg-amber-100 px-1">.env</code>{" "}
        <code className="rounded bg-amber-100 px-1">VITE_GUEST_OTP_SECRET</code>{" "}
        (min. 8 karaktera), restartuj dev server — tek onda šalji OTP gostima.
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-champagne-200 bg-white/90 px-4 py-4">
      <h3 className="font-display text-lg text-velvet-900">
        OTP za gosta (izmena odgovora)
      </h3>
      <p className="mt-1 text-xs text-champagne-600">
        Izaberi osobu i pošalji joj privatno ovih 6 cifara (ne u grupi).
      </p>
      <select
        value={guestId}
        onChange={(e) => setGuestId(e.target.value)}
        className="mt-3 w-full min-h-[44px] rounded-xl border border-champagne-200 bg-white px-3 text-sm"
      >
        <option value="">— Kome šalješ OTP? —</option>
        {list.map((g) => (
          <option key={g.id} value={g.id}>
            {g.fullName} ({g.id})
          </option>
        ))}
      </select>
      {otp && (
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <span className="font-mono text-2xl font-bold tracking-widest text-velvet-900">
            {otp}
          </span>
          <button
            type="button"
            onClick={copy}
            className="rounded-full bg-blush-500 px-4 py-2 text-xs font-semibold text-white"
          >
            Kopiraj
          </button>
        </div>
      )}
    </div>
  );
}
