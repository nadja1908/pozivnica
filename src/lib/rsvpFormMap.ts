import { getGuestNameFrom } from "../data/guests";
import type { Guest } from "../data/guests";
import { phoneE164ToLocal, phoneLocalToE164 } from "./phone";
import type { FormState } from "../types/rsvpForm";
import type {
  AttendanceStatus,
  DrinkPreference,
  PickupLocation,
  TransportDirection,
  RsvpPayload,
  RsvpResponse,
} from "../types/rsvp";

function inferDirectionFromLegacy(row: RsvpResponse): TransportDirection {
  if (row.transportDirection) return row.transportDirection;
  if (!row.needsTransport) return "none";
  if (row.pickupLocation && row.pickupLocationReturn) return "both";
  if (row.pickupLocationReturn) return "return_only";
  if (row.pickupLocation) return "to_cottage";
  return "none";
}

export function formStateToPayload(
  form: FormState,
  guests: Guest[],
): RsvpPayload {
  const attendance = form.attendanceStatus as AttendanceStatus;
  const dir = form.transportDirection as TransportDirection | "";

  const wantsAny =
    attendance === "yes" && dir !== "" && dir !== "none";

  const transportDirection: TransportDirection | null = wantsAny
    ? (dir as TransportDirection)
    : "none";

  let pickupLocation: PickupLocation | null = null;
  let customPickupLocation: string | null = null;
  let pickupLocationReturn: PickupLocation | null = null;
  let customPickupLocationReturn: string | null = null;

  if (wantsAny) {
    if (dir === "to_cottage" || dir === "both") {
      if (form.pickupLocation) {
        pickupLocation = form.pickupLocation as PickupLocation;
        if (form.pickupLocation === "other") {
          customPickupLocation = form.customPickupLocation.trim() || null;
        }
      }
    }
    if (dir === "return_only" || dir === "both") {
      if (form.pickupLocationReturn) {
        pickupLocationReturn = form.pickupLocationReturn as PickupLocation;
        if (form.pickupLocationReturn === "other") {
          customPickupLocationReturn =
            form.customPickupLocationReturn.trim() || null;
        }
      }
    }
  }

  const drinkPreferences: DrinkPreference[] =
    attendance === "no"
      ? ["non_alcoholic"]
      : [...form.drinkPreferences];

  return {
    guestId: form.guestId,
    fullName: getGuestNameFrom(guests, form.guestId).trim(),
    phoneE164:
      attendance === "no"
        ? null
        : phoneLocalToE164(form.phoneLocal),
    attendanceStatus: attendance,
    needsTransport: wantsAny,
    transportDirection,
    pickupLocation: wantsAny ? pickupLocation : null,
    customPickupLocation: wantsAny ? customPickupLocation : null,
    pickupLocationReturn: wantsAny ? pickupLocationReturn : null,
    customPickupLocationReturn: wantsAny
      ? customPickupLocationReturn
      : null,
    drinkPreferences,
    songRequest: form.songRequest.trim() || null,
    note: null,
  };
}

export function responseToFormState(
  row: RsvpResponse,
  guestId: string,
): FormState {
  const inferred = inferDirectionFromLegacy(row);
  return {
    guestId,
    phoneLocal: phoneE164ToLocal(row.phoneE164),
    attendanceStatus: row.attendanceStatus,
    transportDirection: inferred,
    pickupLocation: row.pickupLocation ?? "",
    customPickupLocation: row.customPickupLocation ?? "",
    pickupLocationReturn: row.pickupLocationReturn ?? "",
    customPickupLocationReturn: row.customPickupLocationReturn ?? "",
    drinkPreferences:
      row.attendanceStatus === "no" ? [] : [...row.drinkPreferences],
    songRequest: row.songRequest ?? "",
  };
}
