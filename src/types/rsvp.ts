export type AttendanceStatus = "yes" | "maybe" | "no";

export type DrinkPreference =
  | "wine"
  | "beer"
  | "vodka"
  | "gin_tonic"
  | "whiskey"
  | "tequila"
  | "cocktails"
  | "non_alcoholic";

/** Aktivne stanice u formi; ostalo samo za stare zapise u bazi. */
export type PickupLocation =
  | "gsp_futogski_put"
  | "novo_naselje"
  | "kampus"
  | "parkovi"
  | "parking_idea_liman"
  | "telep"
  | "klisa"
  | "veternik"
  | "other";

/** Organizovan prevoz: smer; zone biraju se u sledećem koraku. */
export type TransportDirection = "none" | "to_cottage" | "return_only" | "both";

export interface RsvpResponse {
  id: string;
  guestId: string | null;
  fullName: string;
  phoneE164: string | null;
  attendanceStatus: AttendanceStatus;
  needsTransport: boolean;
  transportDirection: TransportDirection | null;
  pickupLocation: PickupLocation | null;
  customPickupLocation: string | null;
  pickupLocationReturn: PickupLocation | null;
  customPickupLocationReturn: string | null;
  drinkPreferences: DrinkPreference[];
  songRequest: string | null;
  note: string | null;
  /** Puna javna URL adresa slike ili stara relativna putanja u `rsvp-selfies`. */
  selfieStoragePath: string | null;
  createdAt: string;
}

export interface RsvpPayload {
  guestId: string;
  fullName: string;
  phoneE164: string | null;
  attendanceStatus: AttendanceStatus;
  needsTransport: boolean;
  transportDirection: TransportDirection | null;
  pickupLocation: PickupLocation | null;
  customPickupLocation: string | null;
  pickupLocationReturn: PickupLocation | null;
  customPickupLocationReturn: string | null;
  drinkPreferences: DrinkPreference[];
  songRequest: string | null;
  note: string | null;
  /** Ista vrednost kao u bazi: pun URL posle uploada, ili null. */
  selfieStoragePath: string | null;
}
