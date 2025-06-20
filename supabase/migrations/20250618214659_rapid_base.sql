-- Update the debt_accounts table to match the new schema
-- This migration updates the existing table to use the new field names

-- Add new columns if they don't exist
DO $$
BEGIN
  -- Add loan_amount column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'debt_accounts' AND column_name = 'loan_amount'
  ) THEN
    ALTER TABLE public.debt_accounts ADD COLUMN loan_amount numeric;
  END IF;

  -- Add start_date column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'debt_accounts' AND column_name = 'start_date'
  ) THEN
    ALTER TABLE public.debt_accounts ADD COLUMN start_date date;
  END IF;
END $$;

-- Update existing data to use loan_amount from original_amount if loan_amount is null
UPDATE public.debt_accounts 
SET loan_amount = original_amount 
WHERE loan_amount IS NULL AND original_amount IS NOT NULL;

-- Set start_date to created_at date if start_date is null
UPDATE public.debt_accounts 
SET start_date = created_at::date 
WHERE start_date IS NULL;

-- Add constraints to new columns
ALTER TABLE public.debt_accounts 
ALTER COLUMN loan_amount SET NOT NULL,
ADD CONSTRAINT debt_accounts_loan_amount_check CHECK (loan_amount > 0);

ALTER TABLE public.debt_accounts 
ALTER COLUMN start_date SET NOT NULL;

-- Update the original_amount column name to current_balance if needed
-- (This is handled by the application logic now)

-- Add index on start_date for better performance
CREATE INDEX IF NOT EXISTS debt_accounts_start_date_idx ON public.debt_accounts (start_date);