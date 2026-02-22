-- Update country column default value to 'BD'
-- This ensures the default is set to the country code instead of the full name
DO $$
BEGIN
  -- Check if the column exists before altering
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'profiles' 
      AND column_name = 'country'
  ) THEN
    -- Set the default for the country column
    ALTER TABLE public.profiles 
    ALTER COLUMN country SET DEFAULT 'BD';
  END IF;
END $$;
