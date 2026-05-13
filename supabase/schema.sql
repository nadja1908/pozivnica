-- ═══════════════════════════════════════════════════════════════════════════
-- Maturska pozivnica — šema za Supabase (jedan red po gostu: guest_id)
-- U Supabase: SQL Editor → New query → zalepi ceo fajl → Run
-- ═══════════════════════════════════════════════════════════════════════════

create table if not exists public.rsvp_responses (
  id uuid primary key default gen_random_uuid(),
  guest_id text not null,
  full_name text not null,
  phone text,
  attendance_status text not null,
  needs_transport boolean not null default false,
  transport_direction text,
  pickup_location text,
  custom_pickup_location text,
  pickup_location_return text,
  custom_pickup_location_return text,
  drink_preference text not null,
  song_request text,
  note text,
  created_at timestamptz not null default now(),
  constraint rsvp_responses_guest_id_key unique (guest_id)
);

-- Za već postojeću tabelu iz starije verije (nullable guest_id + partial index),
-- prvo pokreni supabase/migration_guest_id.sql, pa po potrebi:
--   update public.rsvp_responses set guest_id = trim(guest_id) where guest_id is not null;
-- zatim ručno popuni guest_id za stare redove pre alter column set not null.

alter table public.rsvp_responses enable row level security;

drop policy if exists "Allow anon insert rsvp" on public.rsvp_responses;
create policy "Allow anon insert rsvp"
  on public.rsvp_responses for insert
  to anon
  with check (true);

drop policy if exists "Allow anon select rsvp" on public.rsvp_responses;
create policy "Allow anon select rsvp"
  on public.rsvp_responses for select
  to anon
  using (true);

drop policy if exists "Allow anon update rsvp" on public.rsvp_responses;
create policy "Allow anon update rsvp"
  on public.rsvp_responses for update
  to anon
  using (true)
  with check (true);
