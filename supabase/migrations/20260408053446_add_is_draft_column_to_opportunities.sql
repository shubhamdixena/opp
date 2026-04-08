/*
  # Add is_draft Column to Opportunities Table

  1. Changes
    - Add `is_draft` boolean column to opportunities table
    - Default value is false (all existing opportunities are live/published)
    - Allows admin to save opportunities as drafts before publishing
  
  2. Notes
    - This enables the draft functionality in the admin dashboard
    - Existing opportunities will automatically be set to published (is_draft = false)
*/

-- Add is_draft column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'opportunities' AND column_name = 'is_draft'
  ) THEN
    ALTER TABLE opportunities ADD COLUMN is_draft boolean DEFAULT false;
  END IF;
END $$;