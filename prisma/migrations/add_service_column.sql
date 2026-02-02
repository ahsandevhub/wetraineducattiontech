-- Direct fix: Ensure service column exists on payments table
ALTER TABLE payments ADD COLUMN IF NOT EXISTS service TEXT;
