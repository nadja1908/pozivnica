export type AttendanceStatus = "yes" | "maybe" | "no";

export type DrinkPreference =
  | "wine"
  | "beer"
  | "sparkling"
  | "champagne"
  | "vodka"
  | "gin_tonic"
  | "whiskey"
  | "rum"
  | "tequila"
  | "cocktails"
  | "cider"
  | "non_alcoholic"
  | "soft_drinks"
  | "surprise_me"
  | "other";

export type PickupLocation =
  | "kampus"
  | "parkovi"
  | "parking_idea_liman"
  | "telep"
  | "klisa"
  | "veternik"
  | "other";

export interface RsvpResponse {
  id: string;
  guestId: string | null;
  fullName: string;
  phoneE164: string | null;
  attendanceStatus: AttendanceStatus;
  needsTransport: boolean;
  pickupLocation: PickupLocation | null;
  customPickupLocation: string | null;
  drinkPreference: DrinkPreference;
  songRequest: string | null;
  note: string | null;
  createdAt: string;
}

export interface RsvpPayload {
  guestId: string;
  fullName: string;
  phoneE164: string;
  attendanceStatus: AttendanceStatus;
  needsTransport: boolean;
  pickupLocation: PickupLocation | null;
  customPickupLocation: string | null;
  drinkPreference: DrinkPreference;
  songRequest: string | null;
  note: string | null;
}
