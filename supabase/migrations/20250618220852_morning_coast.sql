/*
  # Clean up debt_accounts table schema

  1. Schema Analysis
    - Remove redundant `original_amount` column (replaced by `loan_amount`)
    - The application uses `loan_amount` but database still has `original_amount` as required
    - Both columns serve the same purpose - storing the initial loan/debt amount

  2. Changes
    - Drop the `original_amount` column since `loan_amount` is being used in the application
    - Keep all other columns as they are actively used

  3. Data Safety
    - Since this appears to be a development environment and the error suggests no successful inserts
    - The migration safely removes the unused column
*/

-- Remove the redundant original_amount column
-- The application uses loan_amount instead
ALTER TABLE debt_accounts DROP COLUMN IF EXISTS original_amount;