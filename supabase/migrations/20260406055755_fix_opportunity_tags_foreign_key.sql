/*
  # Fix opportunity_tags foreign key

  1. Changes
    - Drop and recreate opportunity_tags table with correct foreign key
    - opportunity_id should reference opportunities(id), not tags(id)

  2. Notes
    - This fixes the schema error in the initial migration
*/

-- Drop the incorrect table
DROP TABLE IF EXISTS opportunity_tags CASCADE;

-- Recreate with correct foreign keys
CREATE TABLE opportunity_tags (
  opportunity_id uuid REFERENCES opportunities(id) ON DELETE CASCADE,
  tag_id uuid REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (opportunity_id, tag_id)
);

-- Enable RLS
ALTER TABLE opportunity_tags ENABLE ROW LEVEL SECURITY;

-- RLS Policy (public read)
CREATE POLICY "Opportunity tags are viewable by everyone"
  ON opportunity_tags FOR SELECT
  TO anon, authenticated
  USING (true);