insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'offer-assets',
  'offer-assets',
  true,
  209715200,
  array['image/jpeg', 'image/png', 'image/webp', 'application/zip']
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;
