import { useCallback, useEffect, useState } from "react";
import type { LucideIcon } from "lucide-react";
import { Calendar, Clock, MapPin } from "lucide-react";
import {
  EVENT_LOCATION_DISPLAY,
  formatEventDateSerbian,
  formatEventTimeSerbian,
} from "./constants/event";
import { RsvpForm } from "./components/RsvpForm";
import { useGuests } from "./hooks/useGuests";
import { isSupabaseConfigured } from "./lib/supabase";
import { formStateToPayload } from "./lib/rsvpFormMap";
import { fetchRsvpResponses, upsertRsvp } from "./services/rsvp";
import { publicSelfieUrl, uploadRsvpSelfie } from "./services/selfieUpload";
import type { FormState } from "./types/rsvpForm";

/** Probaj prvo glavnu sliku u repo-u (OneDrive); rezerva graduation-child.png u public/. */
const HERO_IMAGE_PRIMARY = "/images/malaNadja.PNG";
const HERO_IMAGE_FALLBACK = "/graduation-child.png";

function HeroPhoto({ className }: { className: string }) {
  const candidates = [HERO_IMAGE_PRIMARY, HERO_IMAGE_FALLBACK] as const;
  const [attempt, setAttempt] = useState(0);
  const src = candidates[Math.min(attempt, candidates.length - 1)];

  return (
    <img
      src={src}
      alt=""
      className={className}
      loading="eager"
      decoding="async"
      draggable={false}
      onError={() =>
        setAttempt((i) => Math.min(i + 1, candidates.length - 1))
      }
    />
  );
}

/**
 * Edit event rows here — labels & values for the invitation card.
 */
const EVENT_ROWS: {
  icon: LucideIcon;
  label: string;
  value: string;
}[] = [
  {
    icon: Calendar,
    label: "Datum",
    value: formatEventDateSerbian(),
  },
  {
    icon: Clock,
    label: "Vreme",
    value: formatEventTimeSerbian(),
  },
  {
    icon: MapPin,
    label: "Mesto",
    value: EVENT_LOCATION_DISPLAY,
  },
];

function ConfettiLayer() {
  const pieces = [
    { t: "12%", l: "8%", w: 5, h: 5, r: 12, o: 0.35 },
    { t: "18%", l: "22%", w: 4, h: 10, r: 40, o: 0.28 },
    { t: "8%", l: "42%", w: 7, h: 7, r: 2, o: 0.3 },
    { t: "24%", l: "58%", w: 5, h: 5, r: 45, o: 0.25 },
    { t: "14%", l: "78%", w: 6, h: 4, r: 20, o: 0.32 },
    { t: "38%", l: "12%", w: 4, h: 8, r: -22, o: 0.22 },
    { t: "44%", l: "88%", w: 5, h: 5, r: 12, o: 0.3 },
    { t: "52%", l: "6%", w: 8, h: 3, r: 55, o: 0.2 },
    { t: "58%", l: "92%", w: 5, h: 9, r: -35, o: 0.26 },
    { t: "68%", l: "28%", w: 4, h: 4, r: 0, o: 0.34 },
    { t: "72%", l: "72%", w: 7, h: 4, r: 72, o: 0.24 },
    { t: "82%", l: "48%", w: 5, h: 5, r: 28, o: 0.3 },
    { t: "88%", l: "18%", w: 6, h: 6, r: 45, o: 0.22 },
    { t: "30%", l: "66%", w: 4, h: 6, r: -15, o: 0.26 },
  ];
  return (
    <div
      className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
      aria-hidden
    >
      {pieces.map((p, i) => (
        <span
          key={i}
          className="absolute bg-[#C99A2E]"
          style={{
            top: p.t,
            left: p.l,
            width: p.w,
            height: p.h,
            opacity: p.o,
            transform: `rotate(${p.r}deg)`,
          }}
        />
      ))}
      {[...Array(24)].map((_, i) => (
        <span
          key={`d-${i}`}
          className="absolute h-1 w-1 rounded-full bg-[#E7C76F]"
          style={{
            top: `${(i * 17 + 7) % 92}%`,
            left: `${(i * 23 + 11) % 96}%`,
            opacity: 0.15 + (i % 5) * 0.06,
          }}
        />
      ))}
    </div>
  );
}

/** Tri kruga gore desno kao na referenci + blagi „konfeti“ baloni */
function BalloonsBehindDesktop({ className = "" }: { className?: string }) {
  return (
    <div
      className={`pointer-events-none absolute inset-0 z-[1] ${className}`}
      aria-hidden
    >
      <svg
        className="absolute right-[2%] top-[4%] h-[min(38%,220px)] w-auto opacity-[0.95] lg:right-[5%] lg:top-[6%] xl:h-[min(42%,260px)]"
        viewBox="0 0 200 180"
        fill="none"
      >
        <circle
          cx="148"
          cy="52"
          r="34"
          stroke="#C99A2E"
          strokeWidth="3.5"
          fill="none"
          opacity="0.92"
        />
        <circle cx="92" cy="64" r="40" fill="#FAF0D4" stroke="#E7C76F" strokeWidth="2" />
        <circle cx="52" cy="88" r="32" fill="#D4AF37" opacity="0.92" />
        <path
          d="M92 104 Q88 138 84 168"
          stroke="#C99A2E"
          strokeWidth="2"
          opacity="0.35"
          fill="none"
          strokeLinecap="round"
        />
        <path
          d="M148 84 Q152 130 156 172"
          stroke="#C99A2E"
          strokeWidth="1.75"
          opacity="0.3"
          fill="none"
          strokeLinecap="round"
        />
      </svg>
      <svg
        className="absolute bottom-[14%] left-[4%] hidden h-24 w-20 opacity-[0.22] lg:block"
        viewBox="0 0 80 100"
      >
        <ellipse cx="44" cy="36" rx="28" ry="32" fill="#E7C76F" />
        <ellipse cx="28" cy="52" rx="18" ry="22" fill="#FFFDF8" opacity="0.9" />
      </svg>
    </div>
  );
}

function BalloonsMobileSides() {
  return (
    <>
      <div
        className="pointer-events-none absolute inset-x-0 top-[4%] z-[1] flex justify-between px-2 md:hidden"
        aria-hidden
      >
        <svg className="h-[4.5rem] w-14 opacity-[0.88]" viewBox="0 0 56 80">
          <ellipse cx="28" cy="32" rx="24" ry="28" fill="#D4AF37" opacity="0.9" />
          <path d="M28 58 Q26 68 24 76" stroke="#C99A2E" strokeWidth="1.5" fill="none" opacity="0.4" />
        </svg>
        <svg className="h-16 w-[3.25rem] opacity-[0.82]" viewBox="0 0 52 72">
          <ellipse cx="26" cy="28" rx="22" ry="26" fill="#FFFDF8" stroke="#E7C76F" strokeWidth="1.5" />
          <circle cx="22" cy="24" r="2.5" fill="#C99A2E" opacity="0.35" />
          <circle cx="32" cy="30" r="2" fill="#C99A2E" opacity="0.28" />
        </svg>
      </div>
      <div
        className="pointer-events-none absolute inset-x-0 bottom-[12%] z-[1] flex justify-between px-6 opacity-50 md:hidden"
        aria-hidden
      >
        <svg className="h-10 w-9" viewBox="0 0 40 52">
          <ellipse cx="20" cy="22" rx="16" ry="19" fill="#E7C76F" opacity="0.65" />
        </svg>
        <svg className="h-11 w-10" viewBox="0 0 44 56">
          <ellipse cx="22" cy="24" rx="18" ry="21" fill="#C99A2E" opacity="0.55" />
        </svg>
      </div>
    </>
  );
}

function BottomGoldRibbon() {
  return (
    <div
      className="pointer-events-none absolute inset-x-0 bottom-0 z-[1] h-[4.5rem] overflow-hidden lg:h-20"
      aria-hidden
    >
      <svg
        className="absolute bottom-0 left-1/2 w-[150%] max-w-none -translate-x-1/2 text-[#E7C76F]"
        viewBox="0 0 1200 72"
        preserveAspectRatio="none"
      >
        <path
          fill="currentColor"
          d="M0 48 Q180 14 360 42 T720 40 T1080 46 T1200 38 V72 H0Z"
          opacity="0.42"
        />
        <path
          fill="none"
          stroke="#C99A2E"
          strokeWidth="1.25"
          opacity="0.28"
          d="M0 52 Q200 28 400 48 T800 44 T1200 42"
        />
      </svg>
    </div>
  );
}

function EventInformationCard({
  className = "",
  onConfirmRsvp,
}: {
  className?: string;
  onConfirmRsvp: () => void;
}) {
  return (
    <div
      className={[
        "w-full max-w-[min(100%,22rem)] shrink-0 rounded-2xl border border-[rgba(138,101,28,0.12)] bg-[#FFFDF8]/98 px-4 py-4 shadow-[0_12px_36px_-18px_rgba(17,17,17,0.2)] backdrop-blur-[2px]",
        "sm:max-w-[min(100%,24rem)] sm:rounded-[22px] sm:px-5 sm:py-5",
        "lg:px-4 lg:py-4 xl:max-w-[min(100%,23rem)] xl:px-5 xl:py-5",
        className,
      ].join(" ")}
    >
      <ul className="divide-y divide-[rgba(138,101,28,0.15)]">
        {EVENT_ROWS.map(({ icon: Icon, label, value }) => (
          <li
            key={label}
            className="flex gap-3 py-3 first:pt-0 last:pb-0 sm:gap-3.5 sm:py-3.5 lg:py-2.5 xl:py-3"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#E7C76F]/35 text-[#8A651C] ring-1 ring-[#C99A2E]/25 sm:h-10 sm:w-10 sm:rounded-xl lg:h-9 lg:w-9">
              <Icon size={20} strokeWidth={1.75} aria-hidden />
            </div>
            <div className="min-w-0 flex-1 text-left font-sans">
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#8A651C] sm:text-[11px]">
                {label}
              </p>
              <p className="mt-0.5 text-[13px] leading-snug text-[#111111] sm:text-[14px] lg:text-[13px] xl:text-[14px]">
                {value}
              </p>
            </div>
          </li>
        ))}
      </ul>

      <div className="mt-4 sm:mt-5 lg:mt-4">
        <button
          type="button"
          onClick={onConfirmRsvp}
          className="min-h-[46px] w-full rounded-full bg-gradient-to-r from-[#C99A2E] via-[#d4af37] to-[#E7C76F] px-4 text-center text-[12px] font-bold uppercase tracking-[0.12em] text-white shadow-[0_8px_28px_-10px_rgba(138,101,28,0.55)] transition hover:brightness-105 active:scale-[0.99] sm:min-h-[48px] sm:text-xs lg:min-h-[42px] lg:text-[11px]"
        >
          Potvrdi dolazak
        </button>
      </div>
    </div>
  );
}

function TitleBlock() {
  return (
    <header className="flex flex-col items-center gap-4 text-center lg:items-start lg:gap-5 lg:text-left">
      <p className="max-w-[22rem] font-sans text-[0.8rem] font-normal italic leading-relaxed text-[#6b5b42] sm:text-[0.85rem] lg:max-w-none lg:text-[0.9rem]">
        „Dođi da proslavimo jedan kraj a i jedan početak.“
      </p>

      <div className="w-full">
        <h1 className="font-invite text-[2.65rem] font-light leading-[1.02] tracking-[0.02em] text-[#1c1917] sm:text-[3rem] lg:text-[clamp(2.35rem,3.8vw,3.65rem)] xl:text-[4rem]">
          Graduation
        </h1>

        <p className="font-script mt-1 text-[3.25rem] leading-[0.95] text-[#C99A2E] drop-shadow-[0_1px_0_rgba(255,255,255,0.55)] sm:text-[3.75rem] lg:mt-1.5 lg:text-[clamp(2.85rem,5vw,4.85rem)] xl:text-[5.25rem]">
          Party
        </p>
      </div>
    </header>
  );
}

export default function App() {
  const { guests, loading: guestsLoading } = useGuests();
  const [rsvpFlowOpen, setRsvpFlowOpen] = useState(false);
  const [rsvpFormMountKey, setRsvpFormMountKey] = useState(0);
  const [submittedGuestIds, setSubmittedGuestIds] = useState<string[]>([]);
  const [rsvpSubmitting, setRsvpSubmitting] = useState(false);
  const [rsvpSubmitError, setRsvpSubmitError] = useState<string | null>(null);
  const [rsvpSuccess, setRsvpSuccess] = useState(false);

  const supabaseReady = isSupabaseConfigured();
  const configWarning = supabaseReady
    ? null
    : "Supabase nije podešen (.env) — potvrde se ne šalju u bazu dok ne dodaš URL i ključ.";

  const refreshSubmittedGuestIds = useCallback(async () => {
    if (!supabaseReady) {
      setSubmittedGuestIds([]);
      return;
    }
    try {
      const rows = await fetchRsvpResponses();
      setSubmittedGuestIds(
        rows.map((r) => r.guestId).filter((id): id is string => id != null),
      );
    } catch {
      setSubmittedGuestIds([]);
    }
  }, [supabaseReady]);

  useEffect(() => {
    if (!rsvpFlowOpen) return;
    void refreshSubmittedGuestIds();
  }, [rsvpFlowOpen, refreshSubmittedGuestIds]);

  const openRsvpFlow = () => {
    setRsvpSuccess(false);
    setRsvpSubmitError(null);
    setRsvpFormMountKey((k) => k + 1);
    setRsvpFlowOpen(true);
  };

  const closeRsvpFlow = () => {
    setRsvpFlowOpen(false);
    setRsvpSuccess(false);
    setRsvpSubmitError(null);
    setRsvpFormMountKey((k) => k + 1);
  };

  const handleRsvpSubmit = async (form: FormState) => {
    setRsvpSubmitError(null);
    setRsvpSubmitting(true);
    try {
      const payload = formStateToPayload(form, guests);
      let selfiePath = payload.selfieStoragePath;
      if (form.selfieFile) {
        const storagePath = await uploadRsvpSelfie(form.guestId, form.selfieFile);
        selfiePath = publicSelfieUrl(storagePath);
      }
      await upsertRsvp({ ...payload, selfieStoragePath: selfiePath });
      setRsvpSuccess(true);
      await refreshSubmittedGuestIds();
    } catch (e) {
      setRsvpSubmitError(
        e instanceof Error ? e.message : "Greška pri slanju potvrde.",
      );
    } finally {
      setRsvpSubmitting(false);
    }
  };

  return (
    <div className="relative flex h-full min-h-0 flex-col overflow-hidden bg-[#FBF6EF]">
      <ConfettiLayer />
      <BottomGoldRibbon />

      {/* Mobilni — jedan ekran, bez skrola stranice; slika centrirana */}
      <section className="relative z-[2] flex min-h-0 flex-1 flex-col overflow-hidden lg:hidden">
        <div className="invite-fade flex min-h-0 flex-1 flex-col gap-3 px-4 py-4 sm:gap-4 sm:px-5 sm:py-5">
          <div className="shrink-0">
            <TitleBlock />
          </div>

          <div className="relative flex min-h-0 flex-1 items-center justify-center">
            <BalloonsMobileSides />
            <HeroPhoto className="relative z-[3] max-h-full max-w-full object-contain object-center" />
          </div>

          <div className="flex shrink-0 justify-center pb-[max(0.75rem,env(safe-area-inset-bottom))]">
            <EventInformationCard onConfirmRsvp={openRsvpFlow} />
          </div>
        </div>
      </section>

      {/* Desktop — 50/50, h-full roditelja, slika vertikalno centrirana */}
      <section className="relative z-[2] hidden min-h-0 flex-1 flex-col overflow-hidden lg:flex">
        <div className="invite-fade grid h-full min-h-0 flex-1 grid-cols-2 gap-0">
          <div className="relative flex h-full min-h-0 min-w-0 flex-col justify-center overflow-hidden px-6 py-6 xl:px-12 xl:py-8">
            <div className="relative z-[2] mx-auto flex w-full max-w-[min(100%,22rem)] flex-col gap-5 xl:max-w-[23rem] lg:mx-0 lg:max-w-[min(100%,24rem)]">
              <TitleBlock />
              <EventInformationCard
                className="max-w-none"
                onConfirmRsvp={openRsvpFlow}
              />
            </div>
          </div>

          <div className="relative flex h-full min-h-0 min-w-0 items-center justify-center overflow-hidden bg-[#FBF6EF] px-3">
            <BalloonsBehindDesktop />
            <HeroPhoto className="relative z-[3] max-h-full max-w-[min(100%,46vw)] object-contain object-center" />
          </div>
        </div>
      </section>

      {rsvpFlowOpen && (
        <div className="fixed inset-0 z-[100] flex max-h-[100dvh] flex-col overflow-hidden bg-[#FBF6EF] pb-[max(0.5rem,env(safe-area-inset-bottom))]">
          <div className="z-[101] flex shrink-0 items-center border-b border-[#ebe8e2] bg-[#FBF6EF]/98 px-4 py-2.5 backdrop-blur-sm sm:px-6 sm:py-3">
            <button
              type="button"
              onClick={closeRsvpFlow}
              className="shrink-0 rounded-full border border-[#dcc39a] bg-white/90 px-4 py-2 text-sm font-semibold text-[#5c4a32] shadow-sm transition hover:bg-white"
            >
              ← Nazad na pozivnicu
            </button>
          </div>

          <div className="mx-auto flex min-h-0 w-full max-w-[min(100%,52rem)] flex-1 flex-col px-3 pt-1 sm:px-6 sm:pt-2">
            <RsvpForm
              key={rsvpFormMountKey}
              guests={guests}
              guestsLoading={guestsLoading}
              guestIdsAlreadySubmitted={submittedGuestIds}
              onSubmit={handleRsvpSubmit}
              isSubmitting={rsvpSubmitting}
              submitError={rsvpSubmitError}
              success={rsvpSuccess}
              configWarning={configWarning}
              onBackToInvite={closeRsvpFlow}
            />
          </div>
        </div>
      )}

    </div>
  );
}
