import { DecorativeBackdrop } from "./DecorativeBackdrop";
import { GraduationCapMotif } from "./GraduationMotif";

interface HeroProps {
  onConfirmClick: () => void;
}

export function Hero({ onConfirmClick }: HeroProps) {
  return (
    <header className="relative overflow-hidden rounded-2xl border border-white/60 bg-gradient-to-br from-blush-100/90 via-champagne-100/95 to-amber-50/90 px-4 py-8 shadow-2xl shadow-blush-900/10 sm:rounded-[2rem] sm:px-8 sm:py-10 md:px-12 md:py-14">
      <DecorativeBackdrop />

      <div className="relative z-10 mx-auto max-w-3xl text-center">
        <div className="mb-4 flex justify-center">
          <GraduationCapMotif className="h-12 w-16 text-champagne-800 sm:h-14 sm:w-[4.5rem]" />
        </div>
        <p className="mb-3 text-xs font-medium uppercase tracking-[0.25em] text-blush-600/90 sm:text-sm sm:tracking-[0.35em]">
          Maturska večer · graduation party
        </p>
        <h1 className="font-display text-4xl font-semibold leading-tight text-champagne-900 sm:text-5xl md:text-6xl lg:text-7xl">
          Pozvani ste!
        </h1>
        <p className="mt-4 text-base font-light text-champagne-800 sm:text-lg md:text-xl">
          Slavimo kraj jedne priče i početak nove — dođi na matursku proslavu
        </p>

        <div className="mx-auto mt-8 max-w-md space-y-3 rounded-2xl border border-white/70 bg-white/50 px-4 py-6 shadow-inner backdrop-blur-sm sm:mt-10 sm:px-6 sm:py-8">
          <p className="font-display text-xl text-blush-800 sm:text-2xl md:text-3xl">
            [Ime] — maturska večer
          </p>
          <div className="h-px w-full bg-gradient-to-r from-transparent via-blush-200 to-transparent" />
          <p className="text-sm text-champagne-800 sm:text-base">
            <span className="font-medium">Datum:</span> [Datum]
          </p>
          <p className="text-sm text-champagne-800 sm:text-base">
            <span className="font-medium">Vreme:</span> [Vreme]
          </p>
          <p className="text-sm text-champagne-800 sm:text-base">
            <span className="font-medium">Mesto:</span> [Lokacija]
          </p>
        </div>

        <button
          type="button"
          onClick={onConfirmClick}
          className="mt-10 min-h-[48px] w-full max-w-xs touch-manipulation rounded-full bg-gradient-to-r from-blush-500 to-blush-600 px-8 py-3.5 text-sm font-medium tracking-wide text-white shadow-lg shadow-blush-500/30 transition hover:from-blush-600 hover:to-blush-700 hover:shadow-xl hover:shadow-blush-500/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blush-500 sm:mt-12 sm:w-auto sm:px-10"
        >
          Kreni kroz pozivnicu (RSVP)
        </button>
      </div>
    </header>
  );
}
