import type { AttendanceStatus, PickupLocation, TransportDirection } from "../types/rsvp";

export interface RsvpRowDb {
  id: string;
  guest_id: string | null;
  full_name: string;
  phone: string | null;
  attendance_status: AttendanceStatus;
  needs_transport: boolean;
  transport_direction: TransportDirection | null;
  pickup_location: PickupLocation | null;
  custom_pickup_location: string | null;
  pickup_location_return: PickupLocation | null;
  custom_pickup_location_return: string | null;
  drink_preference: string;
  song_request: string | null;
  note: string | null;
  selfie_storage_path: string | null;
  created_at: string;
}

export type RsvpInsert = Omit<RsvpRowDb, "id" | "created_at"> & {
  id?: string;
  created_at?: string;
};

/** Polja za UPDATE (bez menjanja guest_id) */
export type RsvpUpdateRow = Omit<RsvpInsert, "guest_id">;

export type Database = {
  public: {
    Tables: {
      rsvp_responses: {
        Row: RsvpRowDb;
        Insert: RsvpInsert;
        Update: Partial<RsvpInsert>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
