-- ============================================================
-- DEFINITIVE RLS FIX
-- Drops ALL existing policies and rebuilds from scratch.
-- App uses anon key with localStorage-based admin auth,
-- so INSERT/UPDATE/DELETE must be allowed for anon role.
-- saved_opportunities stays auth-only (correct behaviour).
-- ============================================================

-- ============================================================
-- ORGANIZATIONS
-- ============================================================
DROP POLICY IF EXISTS "Organizations are viewable by everyone"     ON organizations;
DROP POLICY IF EXISTS "Allow public read organizations"            ON organizations;
DROP POLICY IF EXISTS "Allow admin insert organizations"           ON organizations;
DROP POLICY IF EXISTS "Allow admin update organizations"           ON organizations;
DROP POLICY IF EXISTS "Allow admin delete organizations"           ON organizations;
DROP POLICY IF EXISTS "orgs_select"                                ON organizations;
DROP POLICY IF EXISTS "orgs_insert"                                ON organizations;
DROP POLICY IF EXISTS "orgs_update"                                ON organizations;
DROP POLICY IF EXISTS "orgs_delete"                                ON organizations;

ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "orgs_select" ON organizations FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "orgs_insert" ON organizations FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "orgs_update" ON organizations FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "orgs_delete" ON organizations FOR DELETE TO anon, authenticated USING (true);

-- ============================================================
-- OPPORTUNITIES
-- ============================================================
DROP POLICY IF EXISTS "Opportunities are viewable by everyone"     ON opportunities;
DROP POLICY IF EXISTS "Allow public read opportunities"            ON opportunities;
DROP POLICY IF EXISTS "Allow admin insert opportunities"           ON opportunities;
DROP POLICY IF EXISTS "Allow admin update opportunities"           ON opportunities;
DROP POLICY IF EXISTS "Allow admin delete opportunities"           ON opportunities;
DROP POLICY IF EXISTS "opps_select"                                ON opportunities;
DROP POLICY IF EXISTS "opps_insert"                                ON opportunities;
DROP POLICY IF EXISTS "opps_update"                                ON opportunities;
DROP POLICY IF EXISTS "opps_delete"                                ON opportunities;

ALTER TABLE opportunities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "opps_select" ON opportunities FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "opps_insert" ON opportunities FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "opps_update" ON opportunities FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "opps_delete" ON opportunities FOR DELETE TO anon, authenticated USING (true);

-- ============================================================
-- CATEGORIES
-- ============================================================
DROP POLICY IF EXISTS "Categories are viewable by everyone"        ON categories;
DROP POLICY IF EXISTS "Allow public read categories"               ON categories;
DROP POLICY IF EXISTS "Allow admin insert categories"              ON categories;
DROP POLICY IF EXISTS "Allow admin update categories"              ON categories;
DROP POLICY IF EXISTS "Allow admin delete categories"              ON categories;
DROP POLICY IF EXISTS "cats_select"                                ON categories;
DROP POLICY IF EXISTS "cats_insert"                                ON categories;
DROP POLICY IF EXISTS "cats_update"                                ON categories;
DROP POLICY IF EXISTS "cats_delete"                                ON categories;

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "cats_select" ON categories FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "cats_insert" ON categories FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "cats_update" ON categories FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "cats_delete" ON categories FOR DELETE TO anon, authenticated USING (true);

-- ============================================================
-- TAGS
-- ============================================================
DROP POLICY IF EXISTS "Tags are viewable by everyone"              ON tags;
DROP POLICY IF EXISTS "Allow public read tags"                     ON tags;
DROP POLICY IF EXISTS "Allow admin insert tags"                    ON tags;
DROP POLICY IF EXISTS "Allow admin update tags"                    ON tags;
DROP POLICY IF EXISTS "Allow admin delete tags"                    ON tags;
DROP POLICY IF EXISTS "tags_select"                                ON tags;
DROP POLICY IF EXISTS "tags_insert"                                ON tags;
DROP POLICY IF EXISTS "tags_update"                                ON tags;
DROP POLICY IF EXISTS "tags_delete"                                ON tags;

ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tags_select" ON tags FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "tags_insert" ON tags FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "tags_update" ON tags FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "tags_delete" ON tags FOR DELETE TO anon, authenticated USING (true);

-- ============================================================
-- OPPORTUNITY_CATEGORIES
-- ============================================================
DROP POLICY IF EXISTS "Opportunity categories are viewable by everyone" ON opportunity_categories;
DROP POLICY IF EXISTS "Allow all on opportunity_categories"             ON opportunity_categories;
DROP POLICY IF EXISTS "opp_cats_all"                                    ON opportunity_categories;

ALTER TABLE opportunity_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "opp_cats_all" ON opportunity_categories FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- ============================================================
-- OPPORTUNITY_TAGS
-- ============================================================
DROP POLICY IF EXISTS "Opportunity tags are viewable by everyone"  ON opportunity_tags;
DROP POLICY IF EXISTS "Allow all on opportunity_tags"              ON opportunity_tags;
DROP POLICY IF EXISTS "opp_tags_all"                               ON opportunity_tags;

ALTER TABLE opportunity_tags ENABLE ROW LEVEL SECURITY;
CREATE POLICY "opp_tags_all" ON opportunity_tags FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- ============================================================
-- SAVED_OPPORTUNITIES  (intentionally auth-only — correct)
-- ============================================================
DROP POLICY IF EXISTS "Users can view own saved opportunities"     ON saved_opportunities;
DROP POLICY IF EXISTS "Users can insert own saved opportunities"   ON saved_opportunities;
DROP POLICY IF EXISTS "Users can delete own saved opportunities"   ON saved_opportunities;
DROP POLICY IF EXISTS "saved_select"                               ON saved_opportunities;
DROP POLICY IF EXISTS "saved_insert"                               ON saved_opportunities;
DROP POLICY IF EXISTS "saved_delete"                               ON saved_opportunities;

ALTER TABLE saved_opportunities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "saved_select" ON saved_opportunities FOR SELECT    TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "saved_insert" ON saved_opportunities FOR INSERT    TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "saved_delete" ON saved_opportunities FOR DELETE    TO authenticated USING (auth.uid() = user_id);
