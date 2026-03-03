-- Enforce strict canonical BD mobile phone format for CRM leads
-- Required format: 8801[3-9][0-9]{8} (example: 8801704428814)

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'crm_leads_phone_strict_chk'
      AND conrelid = 'public.crm_leads'::regclass
  ) THEN
    ALTER TABLE public.crm_leads
      ADD CONSTRAINT crm_leads_phone_strict_chk
      CHECK (phone ~ '^8801[3-9][0-9]{8}$') NOT VALID;
  END IF;
END $$;

ALTER TABLE public.crm_leads
  VALIDATE CONSTRAINT crm_leads_phone_strict_chk;
