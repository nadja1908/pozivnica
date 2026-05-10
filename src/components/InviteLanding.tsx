import { useState } from "react";
import { GraduationCapMotif } from "./GraduationMotif";
import { EventDetails } from "./EventDetails";
import {
  EVENT_LOCATION_DISPLAY,
  getEditDeadline,
  getEventEnd,
  getEventStart,
} from "../constants/event";

interface InviteLandingProps {
  onStartWizard: () => void;
  onOpenEdit: () => void;
}

const HERO_IMAGE_SRC = "/images/malaNadja.PNG";

const GOLD_BTN =
  "bg-[#b8944d] shadow-[0_4px_14px_-4px_rgba(90,70,30,0.45)] hover:bg-[#a6823f]";
const GOLD_OUTLINE =
  "border-2 border-[#b8944d] bg-transparent text-[#6b5420] hover:bg-[#fdf6e8]";

function CalendarIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M8 2v3m8-3v3M4 10h16M5 4h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V6a2 2 0 012-2z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ClockIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.75" />
      <path
        d="M12 7v6l4 2"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
    </svg>
  );
}

function PinIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 21s7-4.35 7-11a7 7 0 10-14 0c0 6.65 7 11 7 11z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="10" r="2" fill="currentColor" />
    </svg>
  );
}

/** Tri kruga kao na referenci: belo, zlatno puno, zlatni obrub */
function ThreeBalloons({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 140 110"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <circle
        cx="36"
        cy="52"
        r="26"
        fill="#ffffff"
        stroke="#e5dcc8"
        strokeWidth="1.5"
      />
      <circle cx="72" cy="38" r="30" fill="#d4af37" />
      <circle
        cx="108"
        cy="56"
        r="24"
        fill="none"
        stroke="#c9a227"
        strokeWidth="3"
      />
    </svg>
  );
}

function MockupDecorations() {
  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden"
      aria-hidden
    >
      <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-[#ede6dc]/95 to-transparent" />
      {[...Array(36)].map((_, i) => (
        <div
          key={i}
          className="absolute bottom-3 h-1 w-3 rounded-[1px] bg-[#d4af37]/70"
          style={{
            left: `${(i * 41 + 9) % 100}%`,
            bottom: `${6 + (i % 4) * 5}px`,
            transform: `rotate(${i * 19}deg)`,
            opacity: 0.25 + (i % 6) * 0.1,
          }}
        />
      ))}
    </div>
  );
}

export function InviteLanding({
  onStartWizard,
  onOpenEdit,
}: InviteLandingProps) {
  const [heroFailed, setHeroFailed] = useState(false);

  const deadlineFmt = new Intl.DateTimeFormat("sr-Latn-RS", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(getEditDeadline());

  const start = getEventStart();
  const end = getEventEnd();

  const dateLine = new Intl.DateTimeFormat("sr-Latn-RS", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(start);

  const timeLine = `${new Intl.DateTimeFormat("sr-Latn-RS", {
    hour: "numeric",
    minute: "2-digit",
  }).format(start)} — ${new Intl.DateTimeFormat("sr-Latn-RS", {
    hour: "numeric",
    minute: "2-digit",
  }).format(end)}`;

  const titleBlock = (
    <header className="text-center lg:text-left">
      <div className="mb-3 flex justify-center lg:justify-start">
        <GraduationCapMotif className="h-8 w-[3.25rem] shrink-0 sm:h-9 sm:w-14" />
      </div>
      <h1 className="font-display font-bold leading-[0.9] tracking-tight">
        <span className="block text-[2.45rem] text-neutral-900 sm:text-5xl lg:text-[3.25rem] xl:text-6xl">
          Graduation
        </span>
        <span className="mt-1 block text-[2.45rem] text-[#b8944d] sm:text-5xl lg:text-[3.25rem] xl:text-6xl">
          Party
        </span>
      </h1>
      <p className="mt-4 font-sans text-[10px] font-bold uppercase tracking-[0.28em] text-[#b8944d] sm:text-[11px]">
        Pridružite nam se da proslavimo!
      </p>
    </header>
  );

  const eventCard = (
    <div className="w-full rounded-2xl border border-neutral-200/70 bg-white p-6 shadow-[0_12px_40px_-16px_rgba(45,35,20,0.2)] max-lg:text-center lg:max-w-[420px]">
      <ul className="space-y-5 font-sans text-sm text-neutral-900 lg:text-left">
        <li className="flex gap-4 max-lg:flex-col max-lg:items-center">
          <CalendarIcon className="mt-0.5 h-6 w-6 shrink-0 text-[#c9a227]" />
          <span>
            <span className="block text-[11px] font-bold uppercase tracking-[0.2em] text-[#b8944d]">
              Datum
            </span>
            <span className="mt-1 block text-[15px] font-normal leading-snug">
              {dateLine}
            </span>
          </span>
        </li>
        <li className="flex gap-4 max-lg:flex-col max-lg:items-center">
          <ClockIcon className="mt-0.5 h-6 w-6 shrink-0 text-[#c9a227]" />
          <span>
            <span className="block text-[11px] font-bold uppercase tracking-[0.2em] text-[#b8944d]">
              Vreme
            </span>
            <span className="mt-1 block text-[15px] font-normal leading-snug">
              {timeLine}
            </span>
          </span>
        </li>
        <li className="flex gap-4 max-lg:flex-col max-lg:items-center">
          <PinIcon className="mt-0.5 h-6 w-6 shrink-0 text-[#c9a227]" />
          <span>
            <span className="block text-[11px] font-bold uppercase tracking-[0.2em] text-[#b8944d]">
              Lokacija
            </span>
            <span className="mt-1 block text-[15px] font-normal leading-snug">
              {EVENT_LOCATION_DISPLAY}
            </span>
          </span>
        </li>
      </ul>

      <p className="mt-5 border-t border-[#eee8df] pt-4 text-xs leading-relaxed text-neutral-600">
        Izmenu odgovora možeš do{" "}
        <strong className="text-neutral-900">{deadlineFmt}</strong>, uz OTP koji
        šalje domaćin.
      </p>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:gap-3">
        <button
          type="button"
          onClick={onStartWizard}
          className={`min-h-[48px] flex-1 rounded-xl px-5 py-3 text-center text-xs font-bold uppercase tracking-[0.14em] text-white transition active:scale-[0.99] sm:text-sm ${GOLD_BTN}`}
        >
          Potvrdi dolazak
        </button>
        <a
          href="#details"
          className={`flex min-h-[48px] flex-1 items-center justify-center rounded-xl px-5 py-3 text-center text-xs font-bold uppercase tracking-[0.12em] transition active:scale-[0.99] sm:text-sm ${GOLD_OUTLINE}`}
        >
          Vidi detalje
        </a>
      </div>

      <p className="mt-4 text-center lg:text-left">
        <button
          type="button"
          onClick={onOpenEdit}
          className="text-xs font-semibold text-[#8a7349] underline decoration-[#c9a227]/60 underline-offset-4 hover:text-neutral-900"
        >
          Izmeni odgovor · OTP
        </button>
      </p>
    </div>
  );

  const heroPhoto = (
    <div className="relative inline-flex items-end justify-center">
      <ThreeBalloons className="pointer-events-none absolute -right-2 top-[6%] z-20 h-24 w-[7rem] sm:h-28 sm:w-[8rem] lg:-right-4 lg:top-[10%] lg:h-32 lg:w-[9rem]" />
      {!heroFailed ? (
        <img
          src={HERO_IMAGE_SRC}
          alt=""
          className="relative z-10 max-h-[min(50vh,440px)] w-auto max-w-[min(100%,380px)] object-contain object-bottom drop-shadow-[0_18px_42px_rgba(25,20,12,0.15)] sm:max-w-[420px] lg:max-h-[min(68vh,560px)] lg:max-w-[min(100%,460px)] xl:max-h-[min(72vh,600px)]"
          onError={() => setHeroFailed(true)}
        />
      ) : (
        <div className="flex min-h-[240px] w-full max-w-sm flex-col items-center justify-center rounded-3xl border-2 border-dashed border-[#dcc39a] bg-white/70 p-8 text-center">
          <GraduationCapMotif className="h-16 w-24 text-[#b8944d]" />
          <p className="mt-3 text-xs text-neutral-600">
            Dodaj{" "}
            <code className="rounded bg-[#fdf0db] px-1">public/images/malaNadja.PNG</code>
          </p>
        </div>
      )}
    </div>
  );

  return (
    <div className="relative flex min-h-full w-full flex-1 flex-col bg-[#faf9f6]">
      <MockupDecorations />

      <div className="relative z-10 mx-auto flex w-full max-w-[1200px] flex-1 flex-col px-5 pb-[max(1rem,env(safe-area-inset-bottom))] pt-6 sm:px-10 sm:pt-8 lg:px-12">
        {/* Mobilni: naslov → slika → kartica (-mt). Laptop: levo naslov+kartica | desno slika; sve vertikalno centrirano. */}
        <section className="flex min-h-[min(100%,calc(100dvh-6rem))] flex-1 flex-col justify-center lg:min-h-[min(90dvh,800px)]">
          {/* Telefon */}
          <div className="flex w-full flex-col items-center gap-6 lg:hidden">
            {titleBlock}
            <div className="flex w-full justify-center px-2">{heroPhoto}</div>
            <div className="relative z-20 -mt-14 w-full max-w-md px-1">
              {eventCard}
            </div>
          </div>

          {/* Laptop / tablet široko */}
          <div className="hidden w-full items-center justify-center gap-x-12 xl:gap-x-20 lg:flex lg:flex-row">
            <div className="flex w-full max-w-[400px] flex-shrink-0 flex-col gap-10 lg:ml-6 xl:ml-10">
              {titleBlock}
              {eventCard}
            </div>
            <div className="flex min-w-0 flex-1 justify-center">
              {heroPhoto}
            </div>
          </div>
        </section>

        <div className="relative z-10 mx-auto mt-12 w-full max-w-4xl scroll-mt-24 border-t border-[#ebe8e2] pt-10 text-center lg:mt-16 lg:text-left [&_h2]:mx-auto [&_p]:mx-auto lg:[&_h2]:mx-0 lg:[&_p]:mx-0">
          <EventDetails />
        </div>
      </div>
    </div>
  );
}
