-- Add unique constraints for public tables to support ON CONFLICT
-- This is needed for idempotent seeding

-- Add unique constraint on certifications.credential_id
ALTER TABLE public.certifications
ADD CONSTRAINT certifications_credential_id_unique UNIQUE (credential_id);
