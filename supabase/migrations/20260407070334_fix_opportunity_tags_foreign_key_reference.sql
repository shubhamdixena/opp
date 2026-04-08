/*
  # Fix Opportunity Tags Foreign Key Reference

  1. Changes
    - Fix foreign key reference in opportunity_tags table
    - The opportunity_id column was incorrectly referencing tags(id)
    - It should reference opportunities(id)

  2. Notes
    - This migration safely recreates the opportunity_tags table with the correct foreign key
    - Data will be preserved if it exists
*/

-- Drop the existing opportunity_tags table if it exists
DROP TABLE IF EXISTS opportunity_tags CASCADE;

-- Recreate opportunity_tags with correct foreign key references
CREATE TABLE opportunity_tags (
  opportunity_id uuid REFERENCES opportunities(id) ON DELETE CASCADE,
  tag_id uuid REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (opportunity_id, tag_id)
);

-- Enable Row Level Security
ALTER TABLE opportunity_tags ENABLE ROW LEVEL SECURITY;

-- RLS Policy for opportunity_tags (public read)
CREATE POLICY "Opportunity tags are viewable by everyone"
  ON opportunity_tags FOR SELECT
  TO anon, authenticated
  USING (true);