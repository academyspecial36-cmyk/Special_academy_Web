-- =====================================================
-- Run this in Supabase SQL Editor
-- =====================================================

-- 1. Update items type check constraint to allow 'image'
alter table items drop constraint if exists items_type_check;
alter table items add constraint items_type_check check (type in ('video', 'pdf', 'image'));

-- 2. Add images column for multiple photo URLs
alter table items add column if not exists images jsonb default '[]'::jsonb;

-- 3. Ensure storage bucket exists (run in Supabase Dashboard → Storage)
-- Bucket name: my-bucket (from NEXT_PUBLIC_BUCKET_NAME)
-- Make bucket public by running:
--   UPDATE storage.buckets SET public = true WHERE name = 'my-bucket';

-- 4. Storage RLS policies for the bucket
-- Allow authenticated users to upload files
create policy "Authenticated users can upload files"
on storage.objects for insert
to authenticated
with check (bucket_id = 'my-bucket');

-- Allow public read access to files
create policy "Public can read files"
on storage.objects for select
to public
using (bucket_id = 'my-bucket');
