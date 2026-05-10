-- Pokreni u Supabase SQL Editoru AKO već imaš staru tabelu bez guest_id.

alter table public.rsvp_responses
  add column if not exists guest_id text;

create unique index if not exists rsvp_responses_guest_id_unique
  on public.rsvp_responses (guest_id)
  where guest_id is not null;

drop policy if exists "Allow anon update rsvp" on public.rsvp_responses;
create policy "Allow anon update rsvp"
  on public.rsvp_responses for update
  to anon
  using (true)
  with check (true);
