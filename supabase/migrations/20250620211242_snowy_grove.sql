/*
  # Create loan events table for tracking loan account activities

  1. New Tables
    - `loan_events`
      - `id` (uuid, primary key)
      - `debt_account_id` (uuid, foreign key to debt_accounts)
      - `user_id` (uuid, foreign key to auth.users)
      - `event_type` (text, enum: extra_payment, payment_skip, loan_withdrawal, interest_rate_change)
      - `event_data` (jsonb, stores event-specific data)
      - `event_date` (date, when the event occurred)
      - `created_at` (timestamptz, when the event was recorded)
      - `notes` (text, optional additional notes)

  2. Security
    - Enable RLS on `loan_events` table
    - Add policies for authenticated users to manage events for their own accounts only
    - Create indexes for performance optimization

  3. Event Data Structure
    - Extra Payment: { amount: number, applied_to_principal: boolean }
    - Payment Skip: { scheduled_payment_amount: number, reason?: string, skip_count: number }
    - Loan Withdrawal: { amount: number, new_balance: number }
    - Interest Rate Change: { old_rate: number, new_rate: number, reason?: string }

  4. Constraints
    - Ensure event_type is one of the allowed values
    - Ensure event_date is not in the future
    - Ensure debt_account_id references an active account owned by the user
*/

-- Create enum type for event types
DO $$ BEGIN
    CREATE TYPE loan_event_type AS ENUM (
        'extra_payment',
        'payment_skip', 
        'loan_withdrawal',
        'interest_rate_change'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create the loan_events table
CREATE TABLE IF NOT EXISTS public.loan_events (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    debt_account_id uuid NOT NULL REFERENCES public.debt_accounts(id) ON DELETE CASCADE,
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    event_type loan_event_type NOT NULL,
    event_data jsonb NOT NULL,
    event_date date NOT NULL,
    created_at timestamptz DEFAULT now() NOT NULL,
    notes text,
    
    -- Constraints
    CONSTRAINT loan_events_event_date_not_future CHECK (event_date <= CURRENT_DATE),
    CONSTRAINT loan_events_event_data_not_empty CHECK (jsonb_typeof(event_data) = 'object' AND event_data != '{}'::jsonb)
);

-- Enable Row Level Security
ALTER TABLE public.loan_events ENABLE ROW LEVEL SECURITY;

-- RLS Policies for loan_events

-- Policy for users to view events for their own debt accounts
CREATE POLICY "Users can view events for their own debt accounts"
ON public.loan_events
FOR SELECT
TO authenticated
USING (
    auth.uid() = user_id 
    AND EXISTS (
        SELECT 1 FROM public.debt_accounts 
        WHERE id = debt_account_id 
        AND user_id = auth.uid()
        AND is_active = true
    )
);

-- Policy for users to create events for their own debt accounts
CREATE POLICY "Users can create events for their own debt accounts"
ON public.loan_events
FOR INSERT
TO authenticated
WITH CHECK (
    auth.uid() = user_id 
    AND EXISTS (
        SELECT 1 FROM public.debt_accounts 
        WHERE id = debt_account_id 
        AND user_id = auth.uid()
        AND is_active = true
    )
);

-- Policy for users to update events for their own debt accounts (limited updates)
CREATE POLICY "Users can update events for their own debt accounts"
ON public.loan_events
FOR UPDATE
TO authenticated
USING (
    auth.uid() = user_id 
    AND EXISTS (
        SELECT 1 FROM public.debt_accounts 
        WHERE id = debt_account_id 
        AND user_id = auth.uid()
        AND is_active = true
    )
)
WITH CHECK (
    auth.uid() = user_id 
    AND EXISTS (
        SELECT 1 FROM public.debt_accounts 
        WHERE id = debt_account_id 
        AND user_id = auth.uid()
        AND is_active = true
    )
    -- Prevent modification of core event data to maintain audit trail
    AND OLD.event_type = NEW.event_type
    AND OLD.event_date = NEW.event_date
    AND OLD.debt_account_id = NEW.debt_account_id
    AND OLD.created_at = NEW.created_at
);

-- Policy for users to delete events for their own debt accounts (soft delete recommended)
CREATE POLICY "Users can delete events for their own debt accounts"
ON public.loan_events
FOR DELETE
TO authenticated
USING (
    auth.uid() = user_id 
    AND EXISTS (
        SELECT 1 FROM public.debt_accounts 
        WHERE id = debt_account_id 
        AND user_id = auth.uid()
        AND is_active = true
    )
);

-- Performance Indexes

-- Index on debt_account_id for efficient event lookups per account
CREATE INDEX IF NOT EXISTS loan_events_debt_account_id_idx 
ON public.loan_events (debt_account_id);

-- Index on user_id for efficient user-specific queries
CREATE INDEX IF NOT EXISTS loan_events_user_id_idx 
ON public.loan_events (user_id);

-- Composite index on debt_account_id and event_date for chronological queries
CREATE INDEX IF NOT EXISTS loan_events_account_date_idx 
ON public.loan_events (debt_account_id, event_date DESC);

-- Index on event_type for filtering by event type
CREATE INDEX IF NOT EXISTS loan_events_type_idx 
ON public.loan_events (event_type);

-- Index on created_at for audit trail queries
CREATE INDEX IF NOT EXISTS loan_events_created_at_idx 
ON public.loan_events (created_at DESC);

-- Composite index for efficient RLS policy checks
CREATE INDEX IF NOT EXISTS loan_events_user_account_idx 
ON public.loan_events (user_id, debt_account_id);

-- JSONB indexes for efficient event_data queries
CREATE INDEX IF NOT EXISTS loan_events_event_data_gin_idx 
ON public.loan_events USING GIN (event_data);

-- Function to validate event data structure based on event type
CREATE OR REPLACE FUNCTION validate_loan_event_data()
RETURNS TRIGGER AS $$
BEGIN
    -- Validate event_data structure based on event_type
    CASE NEW.event_type
        WHEN 'extra_payment' THEN
            -- Required: amount (number), applied_to_principal (boolean)
            IF NOT (
                NEW.event_data ? 'amount' AND
                NEW.event_data ? 'applied_to_principal' AND
                jsonb_typeof(NEW.event_data->'amount') = 'number' AND
                jsonb_typeof(NEW.event_data->'applied_to_principal') = 'boolean' AND
                (NEW.event_data->>'amount')::numeric > 0
            ) THEN
                RAISE EXCEPTION 'Invalid event_data for extra_payment: requires amount (positive number) and applied_to_principal (boolean)';
            END IF;
            
        WHEN 'payment_skip' THEN
            -- Required: scheduled_payment_amount (number), skip_count (number)
            -- Optional: reason (string)
            IF NOT (
                NEW.event_data ? 'scheduled_payment_amount' AND
                NEW.event_data ? 'skip_count' AND
                jsonb_typeof(NEW.event_data->'scheduled_payment_amount') = 'number' AND
                jsonb_typeof(NEW.event_data->'skip_count') = 'number' AND
                (NEW.event_data->>'scheduled_payment_amount')::numeric > 0 AND
                (NEW.event_data->>'skip_count')::integer > 0
            ) THEN
                RAISE EXCEPTION 'Invalid event_data for payment_skip: requires scheduled_payment_amount (positive number) and skip_count (positive integer)';
            END IF;
            
        WHEN 'loan_withdrawal' THEN
            -- Required: amount (number), new_balance (number)
            IF NOT (
                NEW.event_data ? 'amount' AND
                NEW.event_data ? 'new_balance' AND
                jsonb_typeof(NEW.event_data->'amount') = 'number' AND
                jsonb_typeof(NEW.event_data->'new_balance') = 'number' AND
                (NEW.event_data->>'amount')::numeric > 0 AND
                (NEW.event_data->>'new_balance')::numeric >= 0
            ) THEN
                RAISE EXCEPTION 'Invalid event_data for loan_withdrawal: requires amount (positive number) and new_balance (non-negative number)';
            END IF;
            
        WHEN 'interest_rate_change' THEN
            -- Required: old_rate (number), new_rate (number)
            -- Optional: reason (string)
            IF NOT (
                NEW.event_data ? 'old_rate' AND
                NEW.event_data ? 'new_rate' AND
                jsonb_typeof(NEW.event_data->'old_rate') = 'number' AND
                jsonb_typeof(NEW.event_data->'new_rate') = 'number' AND
                (NEW.event_data->>'old_rate')::numeric >= 0 AND
                (NEW.event_data->>'new_rate')::numeric >= 0 AND
                (NEW.event_data->>'old_rate')::numeric <= 100 AND
                (NEW.event_data->>'new_rate')::numeric <= 100
            ) THEN
                RAISE EXCEPTION 'Invalid event_data for interest_rate_change: requires old_rate and new_rate (0-100)';
            END IF;
    END CASE;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to validate event data
CREATE TRIGGER validate_loan_event_data_trigger
    BEFORE INSERT OR UPDATE ON public.loan_events
    FOR EACH ROW
    EXECUTE FUNCTION validate_loan_event_data();

-- Function to automatically update debt account after event creation
CREATE OR REPLACE FUNCTION update_debt_account_after_event()
RETURNS TRIGGER AS $$
DECLARE
    account_record RECORD;
    new_balance numeric;
    new_rate numeric;
BEGIN
    -- Get current account information
    SELECT * INTO account_record 
    FROM public.debt_accounts 
    WHERE id = NEW.debt_account_id;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Debt account not found: %', NEW.debt_account_id;
    END IF;
    
    -- Process event based on type
    CASE NEW.event_type
        WHEN 'extra_payment' THEN
            -- Reduce current balance by payment amount (applied to principal)
            new_balance := GREATEST(0, account_record.current_balance - (NEW.event_data->>'amount')::numeric);
            
            UPDATE public.debt_accounts 
            SET 
                current_balance = new_balance,
                -- Recalculate payoff date based on new balance
                payoff_date = CASE 
                    WHEN new_balance <= 0 THEN CURRENT_DATE
                    ELSE payoff_date -- Keep existing for now, will be recalculated by application
                END
            WHERE id = NEW.debt_account_id;
            
        WHEN 'payment_skip' THEN
            -- For payment skip, we might need to add interest or adjust timeline
            -- This is complex and might be better handled by application logic
            -- For now, we'll just record the event without automatic balance changes
            NULL;
            
        WHEN 'loan_withdrawal' THEN
            -- Update balance to the new balance specified in event data
            UPDATE public.debt_accounts 
            SET current_balance = (NEW.event_data->>'new_balance')::numeric
            WHERE id = NEW.debt_account_id;
            
        WHEN 'interest_rate_change' THEN
            -- Update the interest rate
            new_rate := (NEW.event_data->>'new_rate')::numeric;
            
            UPDATE public.debt_accounts 
            SET interest_rate = new_rate
            WHERE id = NEW.debt_account_id;
    END CASE;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update debt account after event creation
CREATE TRIGGER update_debt_account_after_event_trigger
    AFTER INSERT ON public.loan_events
    FOR EACH ROW
    EXECUTE FUNCTION update_debt_account_after_event();

-- Add helpful comments
COMMENT ON TABLE public.loan_events IS 'Stores immutable events for loan account activities including payments, skips, withdrawals, and rate changes';
COMMENT ON COLUMN public.loan_events.event_data IS 'JSONB field storing event-specific data validated by trigger function';
COMMENT ON COLUMN public.loan_events.event_date IS 'Date when the actual event occurred (not when it was recorded)';
COMMENT ON COLUMN public.loan_events.created_at IS 'Timestamp when the event was recorded in the system';