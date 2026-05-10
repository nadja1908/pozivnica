import type { RsvpInsert, RsvpRowDb } from "../lib/database.types";
import { getSupabase } from "../lib/supabase";
import { formatSupabaseError } from "../lib/supabaseErrors";
import type { RsvpPayload, RsvpResponse } from "../types/rsvp";

function rowToResponse(row: RsvpRowDb): RsvpResponse {
  return {
    id: row.id,
    guestId: row.guest_id,
    fullName: row.full_name,
    phoneE164: row.phone ?? null,
    attendanceStatus: row.attendance_status,
    needsTransport: row.needs_transport,
    pickupLocation: row.pickup_location,
    customPickupLocation: row.custom_pickup_location,
    drinkPreference: row.drink_preference,
    songRequest: row.song_request,
    note: row.note,
    createdAt: row.created_at,
  };
}

function payloadToRow(payload: RsvpPayload): RsvpInsert {
  return {
    guest_id: payload.guestId,
    full_name: payload.fullName.trim(),
    phone: payload.phoneE164,
    attendance_status: payload.attendanceStatus,
    needs_transport: payload.needsTransport,
    pickup_location: payload.pickupLocation,
    custom_pickup_location: payload.customPickupLocation?.trim() || null,
    drink_preference: payload.drinkPreference,
    song_request: payload.songRequest?.trim() || null,
    note: payload.note?.trim() || null,
  };
}

export async function fetchRsvpResponses(): Promise<RsvpResponse[]> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("rsvp_responses")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw new Error(formatSupabaseError(error));
  return (data as RsvpRowDb[]).map(rowToResponse);
}

export async function fetchRsvpByGuestId(
  guestId: string,
): Promise<RsvpResponse | null> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("rsvp_responses")
    .select("*")
    .eq("guest_id", guestId)
    .maybeSingle();

  if (error) throw new Error(formatSupabaseError(error));
  if (!data) return null;
  return rowToResponse(data as RsvpRowDb);
}

/** Nov unos ili izmena postojećeg za istog gosta (jedan zahtev, bez trke dva taba) */
export async function upsertRsvp(payload: RsvpPayload): Promise<RsvpResponse> {
  const supabase = getSupabase();
  const fullRow = payloadToRow(payload);
  const { data, error } = await supabase
    .from("rsvp_responses")
    .upsert([fullRow], { onConflict: "guest_id" })
    .select()
    .single();

  if (error) throw new Error(formatSupabaseError(error));
  return rowToResponse(data as RsvpRowDb);
}

/** @deprecated koristi upsertRsvp */
export async function submitRsvp(payload: RsvpPayload): Promise<RsvpResponse> {
  return upsertRsvp(payload);
}
