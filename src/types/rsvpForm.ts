import type {
  AttendanceStatus,
  DrinkPreference,
  PickupLocation,
} from "./rsvp";

export interface FormState {
  guestId: string;
  /** Cifre posle +381, bez vodeće nule (npr. 641234567). */
  phoneLocal: string;
  attendanceStatus: AttendanceStatus | "";
  needsTransport: "" | "yes" | "no";
  pickupLocation: PickupLocation | "";
  customPickupLocation: string;
  drinkPreference: DrinkPreference | "";
  songRequest: string;
  note: string;
}

export interface FieldErrors {
  guestId?: string;
  phoneLocal?: string;
  attendanceStatus?: string;
  needsTransport?: string;
  pickupLocation?: string;
  customPickupLocation?: string;
  drinkPreference?: string;
}

export const emptyFormState = (): FormState => ({
  guestId: "",
  phoneLocal: "",
  attendanceStatus: "",
  needsTransport: "",
  pickupLocation: "",
  customPickupLocation: "",
  drinkPreference: "",
  songRequest: "",
  note: "",
});
