/*
  # Create debt accounts table with user authentication

  1. New Tables
    - `debt_accounts`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `name` (text)
      - `type` (text)
      - `current_balance` (numeric)
      - `original_amount` (numeric)
      - `monthly_payment` (numeric)
      - `interest_rate` (numeric)
      - `payoff_date` (date)
      - `created_at` (timestamptz)
      - `minimum_payment` (numeric)
      - `extra_payment` (numeric)
      - `is_active` (boolean)

  2. Security
    - Enable RLS on `debt_accounts` table
    - Add policies for authenticated users to manage their own accounts only
    - Create index on user_id for performance
*/

-- Create the debt_accounts table
CREATE TABLE IF NOT EXISTS public.debt_accounts (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name text NOT NULL,
    type text NOT NULL CHECK (type IN ('mortgage', 'auto', 'credit_card', 'personal', 'student', 'business')),
    current_balance numeric NOT NULL CHECK (current_balance >= 0),
    original_amount numeric NOT NULL CHECK (original_amount > 0),
    monthly_payment numeric NOT NULL CHECK (monthly_payment > 0),
    interest_rate numeric NOT NULL CHECK (interest_rate >= 0 AND interest_rate <= 100),
    payoff_date date NOT NULL,
    created_at timestamptz DEFAULT now() NOT NULL,
    minimum_payment numeric NOT NULL CHECK (minimum_payment > 0),
    extra_payment numeric DEFAULT 0 CHECK (extra_payment >= 0),
    is_active boolean DEFAULT true NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.debt_accounts ENABLE ROW LEVEL SECURITY;

-- Policy for users to view only their own debt accounts
CREATE POLICY "Users can view their own debt accounts"
ON public.debt_accounts
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Policy for users to create their own debt accounts
CREATE POLICY "Users can create their own debt accounts"
ON public.debt_accounts
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Policy for users to update their own debt accounts
CREATE POLICY "Users can update their own debt accounts"
ON public.debt_accounts
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

-- Policy for users to delete their own debt accounts
CREATE POLICY "Users can delete their own debt accounts"
ON public.debt_accounts
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Create index on user_id for better performance
CREATE INDEX IF NOT EXISTS debt_accounts_user_id_idx ON public.debt_accounts (user_id);

-- Create index on created_at for sorting
CREATE INDEX IF NOT EXISTS debt_accounts_created_at_idx ON public.debt_accounts (created_at DESC);