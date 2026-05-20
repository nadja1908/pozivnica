import type {
  AttendanceStatus,
  DrinkPreference,
  PickupLocation,
} from "../types/rsvp";

export const PICKUP_LOCATIONS: { value: PickupLocation; label: string }[] = [
  { value: "gsp_futogski_put", label: "GSP Futogski put" },
  { value: "novo_naselje", label: "Novo naselje" },
  { value: "kampus", label: "Kampus" },
];

export const ATTENDANCE_OPTIONS: { value: AttendanceStatus; label: string }[] =
  [
    { value: "yes", label: "Da, dolazim" },
    { value: "no", label: "Nažalost ne mogu" },
  ];

export const DRINK_OPTIONS: { value: DrinkPreference; label: string }[] = [
  { value: "wine", label: "Vino" },
  { value: "beer", label: "Pivo" },
  { value: "vodka", label: "Votka" },
  { value: "gin_tonic", label: "Gin" },
  { value: "whiskey", label: "Viski" },
  { value: "tequila", label: "Tekila" },
  { value: "cocktails", label: "Kokteli" },
  { value: "non_alcoholic", label: "Bezalkoholno" },
];
