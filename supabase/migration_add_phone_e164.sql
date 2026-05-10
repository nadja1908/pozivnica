-- Dodaj kolonu za telefon (postojeće baze). Nova instalacija: vidi schema.sql
alter table public.rsvp_responses
  add column if not exists phone_e164 text;
