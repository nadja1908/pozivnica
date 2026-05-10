import { getGuestNameFrom } from "../data/guests";
import type { Guest } from "../data/guests";
import { phoneE164ToLocal, phoneLocalToE164 } from "./phone";
import type { FormState } from "../types/rsvpForm";
import type {
  AttendanceStatus,
  DrinkPreference,
  PickupLocation,
  RsvpPayload,
  RsvpResponse,
} from "../types/rsvp";

export function formStateToPayload(
  form: FormState,
  guests: Guest[],
): RsvpPayload {
  const attendance = form.attendanceStatus as AttendanceStatus;
  const wantsTransport =
    attendance === "yes" && form.needsTransport === "yes";

  let pickupLocation: PickupLocation | null = null;
  let customPickupLocation: string | null = null;
  if (wantsTransport && form.pickupLocation) {
    pickupLocation = form.pickupLocation as PickupLocation;
    if (form.pickupLocation === "other") {
      customPickupLocation = form.customPickupLocation.trim() || null;
    }
  }

  const drinkPreference =
    attendance === "no"
      ? ((form.drinkPreference || "non_alcoholic") as DrinkPreference)
      : (form.drinkPreference as DrinkPreference);

  return {
    guestId: form.guestId,
    fullName: getGuestNameFrom(guests, form.guestId).trim(),
    phoneE164: phoneLocalToE164(form.phoneLocal),
    attendanceStatus: attendance,
    needsTransport: wantsTransport,
    pickupLocation,
    customPickupLocation: wantsTransport ? customPickupLocation : null,
    drinkPreference,
    songRequest: form.songRequest.trim() || null,
    note: form.note.trim() || null,
  };
}

export function responseToFormState(
  row: RsvpResponse,
  guestId: string,
): FormState {
  const wantsTransport = row.needsTransport;
  return {
    guestId,
    phoneLocal: phoneE164ToLocal(row.phoneE164),
    attendanceStatus: row.attendanceStatus,
    needsTransport: wantsTransport ? "yes" : "no",
    pickupLocation: row.pickupLocation ?? "",
    customPickupLocation: row.customPickupLocation ?? "",
    drinkPreference: row.drinkPreference as FormState["drinkPreference"],
    songRequest: row.songRequest ?? "",
    note: row.note ?? "",
  };
}
