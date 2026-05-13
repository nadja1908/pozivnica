-- Smer prevoza + zona za povratak (postojeće baze). Nova instalacija: vidi schema.sql
alter table public.rsvp_responses
  add column if not exists transport_direction text;

alter table public.rsvp_responses
  add column if not exists pickup_location_return text;

alter table public.rsvp_responses
  add column if not exists custom_pickup_location_return text;
