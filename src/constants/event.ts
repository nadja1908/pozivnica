export const EVENT_TIMEZONE = "Europe/Belgrade";

export const EVENT_START_ISO = "2026-06-05T19:00:00";

export const EVENT_END_ISO = "2026-06-06T01:00:00";

export const EDIT_WINDOW_DAYS_BEFORE = 5;

export function getEventStart(): Date {
  return new Date(EVENT_START_ISO);
}

export function getEventEnd(): Date {
  return new Date(EVENT_END_ISO);
}

export function getEditDeadline(): Date {
  const start = getEventStart();
  return new Date(
    start.getTime() - EDIT_WINDOW_DAYS_BEFORE * 24 * 60 * 60 * 1000,
  );
}

export function canEditRsvpNow(now = new Date()): boolean {
  return now.getTime() <= getEditDeadline().getTime();
}

export const EVENT_SUMMARY_LINES = [
  "Proslava na vikendici — obuci se lepo.",
  "Petak 5. jun · oko 19:00 — kasno u noć subote 6. jun (~1:00).",
  "Organizovan prevoz biće obezbeđen — više stanica / zona preuzimanja širom grada (biraš u potvrdi ako ti treba prevoz).",
] as const;

export const EVENT_LOCATION_DISPLAY =
  "Vikendica – tačna zona prevoza u tvojoj potvrdi";

const SR_MONTHS_SHORT = [
  "jan",
  "feb",
  "mar",
  "apr",
  "maj",
  "jun",
  "jul",
  "avg",
  "sep",
  "okt",
  "nov",
  "dec",
] as const;

/** Datum za karticu pozivnice (latinica). */
export function formatEventDateSerbian(date = getEventStart()): string {
  return `${date.getDate()}. ${SR_MONTHS_SHORT[date.getMonth()]} ${date.getFullYear()}.`;
}

/** Vreme početka u formatu HH:mm (lokalno za ISO polje). */
export function formatEventTimeSerbian(date = getEventStart()): string {
  const h = date.getHours().toString().padStart(2, "0");
  const m = date.getMinutes().toString().padStart(2, "0");
  return `${h}:${m}`;
}
