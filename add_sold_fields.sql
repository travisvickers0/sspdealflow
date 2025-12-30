-- Add SOLD-only fields to properties table
-- These are all optional/nullable fields, safe to add to existing records

ALTER TABLE properties 
  ADD COLUMN IF NOT EXISTS exit_date TEXT,
  ADD COLUMN IF NOT EXISTS final_sale_price INTEGER,
  ADD COLUMN IF NOT EXISTS hold_period_months INTEGER,
  ADD COLUMN IF NOT EXISTS total_project_profit INTEGER,
  ADD COLUMN IF NOT EXISTS investor_profit INTEGER,
  ADD COLUMN IF NOT EXISTS sponsor_profit INTEGER,
  ADD COLUMN IF NOT EXISTS realized_roi REAL;

-- Update status default to 'AVAILABLE' for new records
-- (Existing records keep their current status)
ALTER TABLE properties 
  ALTER COLUMN status SET DEFAULT 'AVAILABLE';

