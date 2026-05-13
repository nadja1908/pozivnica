import type {
  AttendanceStatus,
  DrinkPreference,
  PickupLocation,
} from "../types/rsvp";

export const PICKUP_LOCATIONS: { value: PickupLocation; label: string }[] = [
  { value: "kampus", label: "Kampus" },
  { value: "parkovi", label: "ParkNovi" },
  {
    value: "parking_idea_liman",
    label: "Parking kod Idee na Limanu",
  },
  { value: "telep", label: "Telep" },
  { value: "klisa", label: "Klisa" },
  { value: "veternik", label: "Veternik" },
  { value: "other", label: "Drugo (napiši tačno)" },
];

export const ATTENDANCE_OPTIONS: { value: AttendanceStatus; label: string }[] =
  [
    { value: "yes", label: "Da, dolazim" },
    { value: "no", label: "Nažalost ne mogu" },
  ];

export const DRINK_OPTIONS: { value: DrinkPreference; label: string }[] = [
  { value: "wine", label: "Vino" },
  { value: "beer", label: "Pivo" },
  { value: "sparkling", label: "Penusavo vino" },
  { value: "champagne", label: "Šampanjac" },
  { value: "vodka", label: "Votka / miksovima sa votkom" },
  { value: "gin_tonic", label: "Gin tonic" },
  { value: "whiskey", label: "Viski / burbon" },
  { value: "rum", label: "Rum" },
  { value: "tequila", label: "Tekila / margarita" },
  { value: "cocktails", label: "Kokteli (mešano)" },
  { value: "cider", label: "Cider" },
  { value: "non_alcoholic", label: "Bezalkoholno" },
  { value: "soft_drinks", label: "Sokovi i gazirano" },
  { value: "surprise_me", label: "Iznenadi me" },
  { value: "other", label: "Drugo" },
];
