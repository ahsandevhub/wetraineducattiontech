-- Create avatars bucket for profile pictures
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for avatars bucket (public read + authenticated write)
DO $$
BEGIN
  BEGIN
    EXECUTE 'create policy "avatars images read" on storage.objects for select using (bucket_id = ''avatars'')';
  EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN
    EXECUTE 'create policy "avatars images insert auth" on storage.objects for insert with check (bucket_id = ''avatars'' and auth.role() = ''authenticated'')';
  EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN
    EXECUTE 'create policy "avatars images update own" on storage.objects for update using (bucket_id = ''avatars'' and auth.uid() = owner) with check (bucket_id = ''avatars'' and auth.uid() = owner)';
  EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN
    EXECUTE 'create policy "avatars images delete own" on storage.objects for delete using (bucket_id = ''avatars'' and auth.uid() = owner)';
  EXCEPTION WHEN duplicate_object THEN NULL; END;
END $$;
