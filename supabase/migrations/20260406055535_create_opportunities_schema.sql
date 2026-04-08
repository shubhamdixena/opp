/*
  # Meridian Opportunities Platform Schema

  1. New Tables
    - `organizations`
      - `id` (uuid, primary key)
      - `name` (text) - Organization name
      - `description` (text) - Organization description
      - `country` (text) - Country location
      - `logo_emoji` (text) - Emoji for logo
      - `created_at` (timestamptz)
    
    - `categories`
      - `id` (uuid, primary key)
      - `name` (text) - Category name (Fellowship, Scholarship, etc.)
      - `emoji` (text) - Category emoji icon
      - `description` (text) - Category description
      - `slug` (text, unique) - URL-friendly slug
      - `created_at` (timestamptz)
    
    - `tags`
      - `id` (uuid, primary key)
      - `name` (text, unique) - Tag name (Leadership, Health, etc.)
      - `color` (text) - Color scheme identifier
      - `created_at` (timestamptz)
    
    - `opportunities`
      - `id` (uuid, primary key)
      - `title` (text) - Opportunity title
      - `slug` (text, unique) - URL-friendly slug
      - `organization_id` (uuid, foreign key)
      - `description` (text) - Short description
      - `full_description` (text) - Full program details
      - `eligibility` (jsonb) - Eligibility criteria
      - `benefits` (jsonb) - Program benefits
      - `timeline` (jsonb) - Application timeline
      - `deadline` (date) - Application deadline
      - `program_start` (date) - Program start date
      - `duration` (text) - Program duration
      - `location` (text) - Program location
      - `region` (text) - Geographic region
      - `funding_type` (text) - fully_funded, partially_funded, self_funded
      - `career_stage` (text) - Target career stage
      - `application_url` (text) - Official application link
      - `is_featured` (boolean) - Featured on homepage
      - `is_new` (boolean) - Recently added
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `opportunity_categories` (junction table)
      - `opportunity_id` (uuid, foreign key)
      - `category_id` (uuid, foreign key)
      - Primary key: (opportunity_id, category_id)
    
    - `opportunity_tags` (junction table)
      - `opportunity_id` (uuid, foreign key)
      - `tag_id` (uuid, foreign key)
      - Primary key: (opportunity_id, tag_id)
    
    - `saved_opportunities`
      - `id` (uuid, primary key)
      - `user_id` (uuid) - References auth.users
      - `opportunity_id` (uuid, foreign key)
      - `created_at` (timestamptz)
      - Unique: (user_id, opportunity_id)

  2. Security
    - Enable RLS on all tables
    - Public read access for organizations, categories, tags, opportunities
    - Authenticated-only write access for saved_opportunities
    - Users can only manage their own saved opportunities
*/

-- Create organizations table
CREATE TABLE IF NOT EXISTS organizations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  country text,
  logo_emoji text DEFAULT '🏢',
  created_at timestamptz DEFAULT now()
);

-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  emoji text DEFAULT '📁',
  description text,
  slug text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create tags table
CREATE TABLE IF NOT EXISTS tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  color text DEFAULT 'neutral',
  created_at timestamptz DEFAULT now()
);

-- Create opportunities table
CREATE TABLE IF NOT EXISTS opportunities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text UNIQUE NOT NULL,
  organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE,
  description text NOT NULL,
  full_description text,
  eligibility jsonb DEFAULT '[]'::jsonb,
  benefits jsonb DEFAULT '[]'::jsonb,
  timeline jsonb DEFAULT '[]'::jsonb,
  deadline date NOT NULL,
  program_start date,
  duration text,
  location text NOT NULL,
  region text NOT NULL,
  funding_type text NOT NULL CHECK (funding_type IN ('fully_funded', 'partially_funded', 'self_funded')),
  career_stage text,
  application_url text NOT NULL,
  is_featured boolean DEFAULT false,
  is_new boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create opportunity_categories junction table
CREATE TABLE IF NOT EXISTS opportunity_categories (
  opportunity_id uuid REFERENCES opportunities(id) ON DELETE CASCADE,
  category_id uuid REFERENCES categories(id) ON DELETE CASCADE,
  PRIMARY KEY (opportunity_id, category_id)
);

-- Create opportunity_tags junction table
CREATE TABLE IF NOT EXISTS opportunity_tags (
  opportunity_id uuid REFERENCES tags(id) ON DELETE CASCADE,
  tag_id uuid REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (opportunity_id, tag_id)
);

-- Create saved_opportunities table
CREATE TABLE IF NOT EXISTS saved_opportunities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  opportunity_id uuid REFERENCES opportunities(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, opportunity_id)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_opportunities_deadline ON opportunities(deadline);
CREATE INDEX IF NOT EXISTS idx_opportunities_featured ON opportunities(is_featured);
CREATE INDEX IF NOT EXISTS idx_opportunities_region ON opportunities(region);
CREATE INDEX IF NOT EXISTS idx_opportunities_funding ON opportunities(funding_type);
CREATE INDEX IF NOT EXISTS idx_saved_user ON saved_opportunities(user_id);

-- Enable Row Level Security
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE opportunity_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE opportunity_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_opportunities ENABLE ROW LEVEL SECURITY;

-- RLS Policies for organizations (public read)
CREATE POLICY "Organizations are viewable by everyone"
  ON organizations FOR SELECT
  TO anon, authenticated
  USING (true);

-- RLS Policies for categories (public read)
CREATE POLICY "Categories are viewable by everyone"
  ON categories FOR SELECT
  TO anon, authenticated
  USING (true);

-- RLS Policies for tags (public read)
CREATE POLICY "Tags are viewable by everyone"
  ON tags FOR SELECT
  TO anon, authenticated
  USING (true);

-- RLS Policies for opportunities (public read)
CREATE POLICY "Opportunities are viewable by everyone"
  ON opportunities FOR SELECT
  TO anon, authenticated
  USING (true);

-- RLS Policies for opportunity_categories (public read)
CREATE POLICY "Opportunity categories are viewable by everyone"
  ON opportunity_categories FOR SELECT
  TO anon, authenticated
  USING (true);

-- RLS Policies for opportunity_tags (public read)
CREATE POLICY "Opportunity tags are viewable by everyone"
  ON opportunity_tags FOR SELECT
  TO anon, authenticated
  USING (true);

-- RLS Policies for saved_opportunities
CREATE POLICY "Users can view own saved opportunities"
  ON saved_opportunities FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own saved opportunities"
  ON saved_opportunities FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own saved opportunities"
  ON saved_opportunities FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);