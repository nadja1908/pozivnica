import {
  ATTENDANCE_OPTIONS,
  DRINK_OPTIONS,
  PICKUP_LOCATIONS,
} from "../constants/options";
import type {
  AttendanceStatus,
  DrinkPreference,
  PickupLocation,
  TransportDirection,
} from "../types/rsvp";

const ATTENDANCE_LABEL_FALLBACK: Record<AttendanceStatus, string> = {
  yes: "Da, dolazim",
  no: "Nažalost ne mogu",
  maybe: "Možda (stari zapis)",
};

export function attendanceLabel(v: AttendanceStatus): string {
  return (
    ATTENDANCE_OPTIONS.find((o) => o.value === v)?.label ??
    ATTENDANCE_LABEL_FALLBACK[v] ??
    v
  );
}

export function drinkLabel(v: DrinkPreference): string {
  return DRINK_OPTIONS.find((o) => o.value === v)?.label ?? v;
}

const DRINK_VALUE_SET = new Set<string>(DRINK_OPTIONS.map((o) => o.value));

export function parseDrinkPreferences(
  raw: string | null | undefined,
): DrinkPreference[] {
  if (!raw?.trim()) return [];
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter((s): s is DrinkPreference => DRINK_VALUE_SET.has(s));
}

export function formatDrinkPreferences(prefs: DrinkPreference[]): string {
  if (!prefs.length) return "—";
  return prefs.map((p) => drinkLabel(p)).join(" · ");
}

/** Stari zapisi u bazi (pre promene zona). */
const PICKUP_LEGACY_LABELS: Record<string, string> = {
  city_center: "Centar",
  liman: "Liman",
  detelinara: "Detelinara",
  novo_naselje: "Novo naselje",
  bulevar: "Bulevar",
  railway_station: "Železnička stanica",
};

export function pickupLabel(v: PickupLocation | string | null): string {
  if (!v) return "—";
  return (
    PICKUP_LOCATIONS.find((o) => o.value === v)?.label ??
    PICKUP_LEGACY_LABELS[v] ??
    v
  );
}

export function transportDirectionLabel(
  d: TransportDirection | "" | null | undefined,
): string {
  if (d === null || d === undefined || d === "") return "—";
  const m: Record<TransportDirection, string> = {
    none: "Ne treba prevoz",
    to_cottage: "Samo do vikendice (polazak)",
    return_only: "Samo povratak",
    both: "Oba smera",
  };
  return m[d] ?? "—";
}
