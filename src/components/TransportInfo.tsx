import { PICKUP_LOCATIONS } from "../constants/options";
import { SectionCard } from "./SectionCard";

export function TransportInfo() {
  return (
    <SectionCard id="transport">
      <h2 className="font-display text-2xl font-semibold text-champagne-900 sm:text-3xl md:text-4xl">
        Prevoz do večeri
      </h2>
      <div className="mt-3 max-w-2xl space-y-3 text-sm leading-relaxed text-champagne-800 sm:text-base">
        <p>
          <strong className="text-champagne-900">
            Javite dolazak autobusom
          </strong>{" "}
          — potrebno mi je da{" "}
          <strong>svi koji idu organizovanim prevozom prijave sa koje stanice /
          zone u Novom Sadu</strong> kreću, kako bih mogla da uskladim rute i
          mesta.
        </p>
        <p className="rounded-2xl border border-amber-200/80 bg-amber-50/90 px-4 py-3 text-champagne-900 shadow-sm">
          <span className="font-semibold">Okvirno vreme polaska: 19:00</span>
          <br />
          <span className="text-champagne-800">
            Tačno vreme zavisi od stanice / zone — zato je važno da u potvrdi
            odaberete mesto preuzimanja koje vama odgovara.
          </span>
        </p>
        <p className="text-sm text-champagne-700 sm:text-base">
          Moguće zone preuzimanja (izaberi u RSVP koracima):
        </p>
      </div>

      <ul className="mt-4 flex flex-wrap gap-2">
        {PICKUP_LOCATIONS.map(({ label }) => (
          <li
            key={label}
            className="rounded-full border border-champagne-200 bg-white/80 px-3 py-2 text-xs text-champagne-800 shadow-sm transition hover:border-blush-200 hover:shadow-md sm:px-4 sm:text-sm"
          >
            {label}
          </li>
        ))}
      </ul>
    </SectionCard>
  );
}
