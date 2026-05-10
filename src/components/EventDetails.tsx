import {
  EVENT_LOCATION_DISPLAY,
  EVENT_SUMMARY_LINES,
  getEditDeadline,
  getEventEnd,
  getEventStart,
} from "../constants/event";
import { SectionCard } from "./SectionCard";

export function EventDetails() {
  const start = getEventStart();
  const end = getEventEnd();
  const deadline = getEditDeadline();

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

  const deadlineLine = new Intl.DateTimeFormat("sr-Latn-RS", {
    dateStyle: "long",
    timeStyle: "short",
  }).format(deadline);

  const detailItems = [
    { title: "Datum", value: dateLine },
    { title: "Vreme", value: timeLine },
    { title: "Mesto", value: EVENT_LOCATION_DISPLAY },
    { title: "Odevanje", value: EVENT_SUMMARY_LINES[0] },
    { title: "Potvrdi dolazak do", value: deadlineLine },
  ];

  return (
    <SectionCard
      id="details"
      className="border border-[rgba(138,101,28,0.14)] bg-[#FFFDF8]/95 shadow-[0_12px_36px_-18px_rgba(17,17,17,0.12)]"
    >
      <h2 className="font-invite text-2xl font-medium tracking-[0.02em] text-[#1c1917] sm:text-3xl md:text-[2.15rem]">
        Detalji večeri
      </h2>

      <div className="mt-6 grid gap-3 sm:grid-cols-2 sm:gap-4">
        {detailItems.map((item) => (
          <article
            key={item.title}
            className="rounded-2xl border border-[rgba(138,101,28,0.12)] bg-[#FBF6EF]/90 p-4 transition hover:border-[#C99A2E]/45 sm:p-5"
          >
            <h3 className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#8A651C] sm:text-[11px]">
              {item.title}
            </h3>
            <p className="mt-2 font-sans text-sm leading-snug text-[#111111] sm:text-[15px]">
              {item.value}
            </p>
          </article>
        ))}
      </div>
    </SectionCard>
  );
}
