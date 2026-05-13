-- Selfie za RSVP: kolona + Storage bucket (pokreni u Supabase SQL Editoru)
-- ═══════════════════════════════════════════════════════════════════════════

alter table public.rsvp_responses
  add column if not exists selfie_storage_path text;

comment on column public.rsvp_responses.selfie_storage_path is
  'Javna https adresa slike (ili stara relativna putanja u bucket-u rsvp-selfies). Fajl je u Storage-u, ne u ovoj ćeliji kao binarni sadržaj.';

-- Bucket (javno čitanje da admin stranica može <img src="..."> bez signed URL)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'rsvp-selfies',
  'rsvp-selfies',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp']::text[]
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- Politike za storage.objects (idempotentno)
drop policy if exists "rsvp_selfies_public_read" on storage.objects;
create policy "rsvp_selfies_public_read"
  on storage.objects for select
  using (bucket_id = 'rsvp-selfies');

drop policy if exists "rsvp_selfies_anon_insert" on storage.objects;
create policy "rsvp_selfies_anon_insert"
  on storage.objects for insert
  to anon
  with check (bucket_id = 'rsvp-selfies');
