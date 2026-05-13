import type {
  AttendanceStatus,
  DrinkPreference,
  PickupLocation,
  TransportDirection,
} from "./rsvp";

export interface FormState {
  guestId: string;
  /** Cifre posle +381, bez vodeće nule (npr. 641234567). */
  phoneLocal: string;
  attendanceStatus: AttendanceStatus | "";
  transportDirection: TransportDirection | "";
  pickupLocation: PickupLocation | "";
  customPickupLocation: string;
  pickupLocationReturn: PickupLocation | "";
  customPickupLocationReturn: string;
  drinkPreferences: DrinkPreference[];
  songRequest: string;
}

export interface FieldErrors {
  guestId?: string;
  phoneLocal?: string;
  attendanceStatus?: string;
  transportDirection?: string;
  pickupLocation?: string;
  customPickupLocation?: string;
  pickupLocationReturn?: string;
  customPickupLocationReturn?: string;
  drinkPreferences?: string;
}

export const emptyFormState = (): FormState => ({
  guestId: "",
  phoneLocal: "",
  attendanceStatus: "",
  transportDirection: "",
  pickupLocation: "",
  customPickupLocation: "",
  pickupLocationReturn: "",
  customPickupLocationReturn: "",
  drinkPreferences: [],
  songRequest: "",
});
