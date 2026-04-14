-- Fix RLS policies across all tables used by admin panel
-- Admin uses anon key (localStorage-based auth, not Supabase auth)

-- =========================================
-- ORGANIZATIONS
-- =========================================
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='organizations' AND policyname='Allow public read organizations') THEN
    CREATE POLICY "Allow public read organizations" ON organizations FOR SELECT TO anon, authenticated USING (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='organizations' AND policyname='Allow admin insert organizations') THEN
    CREATE POLICY "Allow admin insert organizations" ON organizations FOR INSERT TO anon, authenticated WITH CHECK (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='organizations' AND policyname='Allow admin update organizations') THEN
    CREATE POLICY "Allow admin update organizations" ON organizations FOR UPDATE TO anon, authenticated USING (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='organizations' AND policyname='Allow admin delete organizations') THEN
    CREATE POLICY "Allow admin delete organizations" ON organizations FOR DELETE TO anon, authenticated USING (true);
  END IF;
END $$;

-- =========================================
-- OPPORTUNITIES
-- =========================================
ALTER TABLE opportunities ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='opportunities' AND policyname='Allow public read opportunities') THEN
    CREATE POLICY "Allow public read opportunities" ON opportunities FOR SELECT TO anon, authenticated USING (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='opportunities' AND policyname='Allow admin insert opportunities') THEN
    CREATE POLICY "Allow admin insert opportunities" ON opportunities FOR INSERT TO anon, authenticated WITH CHECK (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='opportunities' AND policyname='Allow admin update opportunities') THEN
    CREATE POLICY "Allow admin update opportunities" ON opportunities FOR UPDATE TO anon, authenticated USING (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='opportunities' AND policyname='Allow admin delete opportunities') THEN
    CREATE POLICY "Allow admin delete opportunities" ON opportunities FOR DELETE TO anon, authenticated USING (true);
  END IF;
END $$;

-- =========================================
-- OPPORTUNITY_CATEGORIES
-- =========================================
ALTER TABLE opportunity_categories ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='opportunity_categories' AND policyname='Allow all on opportunity_categories') THEN
    CREATE POLICY "Allow all on opportunity_categories" ON opportunity_categories FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
  END IF;
END $$;

-- =========================================
-- OPPORTUNITY_TAGS
-- =========================================
ALTER TABLE opportunity_tags ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='opportunity_tags' AND policyname='Allow all on opportunity_tags') THEN
    CREATE POLICY "Allow all on opportunity_tags" ON opportunity_tags FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
  END IF;
END $$;

-- =========================================
-- TAGS
-- =========================================
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='tags' AND policyname='Allow public read tags') THEN
    CREATE POLICY "Allow public read tags" ON tags FOR SELECT TO anon, authenticated USING (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='tags' AND policyname='Allow admin insert tags') THEN
    CREATE POLICY "Allow admin insert tags" ON tags FOR INSERT TO anon, authenticated WITH CHECK (true);
  END IF;
END $$;

-- =========================================
-- CATEGORIES
-- =========================================
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='categories' AND policyname='Allow public read categories') THEN
    CREATE POLICY "Allow public read categories" ON categories FOR SELECT TO anon, authenticated USING (true);
  END IF;
END $$;
