-- Fix avatars bucket RLS policy
-- Replace auth.role() = 'authenticated' with auth.uid() IS NOT NULL (more reliable)

DROP POLICY IF EXISTS "avatars images insert auth" ON storage.objects;

CREATE POLICY "avatars images insert auth" ON storage.objects
  FOR INSERT
  WITH CHECK (bucket_id = 'avatars' AND auth.uid() IS NOT NULL);
