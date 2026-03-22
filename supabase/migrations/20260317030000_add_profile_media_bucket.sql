-- Add dedicated storage bucket and policies for user profile photos.

insert into storage.buckets (id, name, public)
values ('profile-media', 'profile-media', true)
on conflict (id) do nothing;

drop policy if exists "Public read profile-media" on storage.objects;
create policy "Public read profile-media"
on storage.objects
for select
using (bucket_id = 'profile-media');

drop policy if exists "Users upload own profile-media" on storage.objects;
create policy "Users upload own profile-media"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'profile-media'
  and auth.uid()::text = (storage.foldername(name))[2]
);

drop policy if exists "Users update own profile-media" on storage.objects;
create policy "Users update own profile-media"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'profile-media'
  and auth.uid()::text = (storage.foldername(name))[2]
)
with check (
  bucket_id = 'profile-media'
  and auth.uid()::text = (storage.foldername(name))[2]
);

drop policy if exists "Users delete own profile-media" on storage.objects;
create policy "Users delete own profile-media"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'profile-media'
  and auth.uid()::text = (storage.foldername(name))[2]
);
