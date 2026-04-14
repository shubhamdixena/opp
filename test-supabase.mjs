import { createClient } from '@supabase/supabase-js'
import fs from 'fs'

// Read .env
const envContent = fs.readFileSync('.env', 'utf-8')
const env = Object.fromEntries(
  envContent.split('\n').filter(Boolean).map(line => {
    const idx = line.indexOf('=')
    return [line.slice(0, idx).trim(), line.slice(idx + 1).trim().replace(/^"|"$/g, '')]
  })
)

const supabase = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY)

let pass = 0, fail = 0
const results = []

function log(label, ok, detail = '') {
  const icon = ok ? '✅' : '❌'
  const line = `  ${icon} ${label}${detail ? ` — ${detail}` : ''}`
  console.log(line)
  results.push({ label, ok })
  ok ? pass++ : fail++
}

async function run() {
  console.log('━'.repeat(55))
  console.log('  SUPABASE FULL DIAGNOSTIC')
  console.log(`  URL : ${env.VITE_SUPABASE_URL}`)
  console.log(`  KEY : ${env.VITE_SUPABASE_ANON_KEY.slice(0, 30)}...`)
  console.log('━'.repeat(55))

  // ─── 1. CONNECTION ───────────────────────────────────────
  console.log('\n📡  CONNECTION')
  const { data: connTest, error: connErr } = await supabase.from('categories').select('id').limit(1)
  log('Connect to Supabase', !connErr, connErr?.message)

  // ─── 2. SCHEMA / TABLES EXIST ────────────────────────────
  console.log('\n🗂️   TABLES — SELECT')
  const tables = ['organizations', 'categories', 'tags', 'opportunities', 'opportunity_categories', 'opportunity_tags', 'saved_opportunities']
  for (const t of tables) {
    const { error } = await supabase.from(t).select('*').limit(1)
    log(`SELECT ${t}`, !error, error?.message)
  }

  // ─── 3. INSERT / UPDATE / DELETE (admin flow) ────────────
  console.log('\n✏️   CRUD — organizations')
  const { data: org, error: orgInsErr } = await supabase
    .from('organizations')
    .insert({ name: '__test_org__', logo_emoji: '🧪', country: 'Test' })
    .select().single()
  log('INSERT organization', !orgInsErr, orgInsErr?.message)

  let orgId = org?.id
  if (orgId) {
    const { error: updErr } = await supabase.from('organizations').update({ name: '__test_org_updated__' }).eq('id', orgId)
    log('UPDATE organization', !updErr, updErr?.message)

    const { error: delErr } = await supabase.from('organizations').delete().eq('id', orgId)
    log('DELETE organization', !delErr, delErr?.message)
  }

  console.log('\n✏️   CRUD — categories')
  const slug = `__test-cat-${Date.now()}__`
  const { data: cat, error: catInsErr } = await supabase
    .from('categories')
    .insert({ name: '__test_cat__', slug, emoji: '🧪' })
    .select().single()
  log('INSERT category', !catInsErr, catInsErr?.message)
  if (cat) {
    const { error: catDelErr } = await supabase.from('categories').delete().eq('id', cat.id)
    log('DELETE category', !catDelErr, catDelErr?.message)
  }

  console.log('\n✏️   CRUD — tags')
  const { data: tag, error: tagInsErr } = await supabase
    .from('tags')
    .insert({ name: `__test_tag_${Date.now()}__` })
    .select().single()
  log('INSERT tag', !tagInsErr, tagInsErr?.message)
  if (tag) {
    const { error: tagDelErr } = await supabase.from('tags').delete().eq('id', tag.id)
    log('DELETE tag', !tagDelErr, tagDelErr?.message)
  }

  console.log('\n✏️   CRUD — opportunities (full flow)')
  // Need a real org first
  const { data: org2 } = await supabase
    .from('organizations')
    .insert({ name: '__test_org2__', logo_emoji: '🧪' })
    .select().single()

  if (org2) {
    const { data: opp, error: oppInsErr } = await supabase
      .from('opportunities')
      .insert({
        title: '__Test Opportunity__',
        slug: `__test-opp-${Date.now()}__`,
        organization_id: org2.id,
        description: 'Test description for RLS check',
        deadline: '2099-12-31',
        location: 'Global',
        region: 'Global',
        funding_type: 'fully_funded',
        application_url: 'https://example.com',
        is_featured: false,
        is_new: true,
      })
      .select().single()
    log('INSERT opportunity', !oppInsErr, oppInsErr?.message)

    if (opp) {
      const { error: oppUpdErr } = await supabase.from('opportunities').update({ title: '__Test Opportunity Updated__' }).eq('id', opp.id)
      log('UPDATE opportunity', !oppUpdErr, oppUpdErr?.message)

      // Test junction tables
      console.log('\n✏️   CRUD — junction tables')
      const { data: realCat } = await supabase.from('categories').select('id').limit(1).single()
      const { data: realTag } = await supabase.from('tags').select('id').limit(1).single()

      if (realCat) {
        const { error: catJoinErr } = await supabase.from('opportunity_categories').insert({ opportunity_id: opp.id, category_id: realCat.id })
        log('INSERT opportunity_categories', !catJoinErr, catJoinErr?.message)
        if (!catJoinErr) await supabase.from('opportunity_categories').delete().eq('opportunity_id', opp.id)
      }

      if (realTag) {
        const { error: tagJoinErr } = await supabase.from('opportunity_tags').insert({ opportunity_id: opp.id, tag_id: realTag.id })
        log('INSERT opportunity_tags', !tagJoinErr, tagJoinErr?.message)
        if (!tagJoinErr) await supabase.from('opportunity_tags').delete().eq('opportunity_id', opp.id)
      }

      await supabase.from('opportunities').delete().eq('id', opp.id)
    }
    await supabase.from('organizations').delete().eq('id', org2.id)
  }

  // ─── 4. RELATIONAL QUERIES ───────────────────────────────
  console.log('\n🔗  RELATIONAL QUERIES')
  const { data: oppWithRelations, error: relErr } = await supabase
    .from('opportunities')
    .select(`
      id, title, deadline,
      organization:organizations(id, name),
      opportunity_categories(category:categories(id, name)),
      opportunity_tags(tag:tags(id, name))
    `)
    .limit(3)
  log('JOIN opportunities → organizations + categories + tags', !relErr, relErr?.message || `${oppWithRelations?.length ?? 0} rows`)

  // ─── 5. RPC FUNCTION ─────────────────────────────────────
  console.log('\n⚙️   RPC FUNCTIONS')
  const { data: userCount, error: rpcErr } = await supabase.rpc('get_user_count')
  log('RPC get_user_count()', !rpcErr, rpcErr?.message || `count = ${userCount}`)

  // ─── 6. RLS SECURITY — saved_opportunities (must block anon) ──
  console.log('\n🔒  RLS SECURITY')
  const { error: savedAnonErr } = await supabase.from('saved_opportunities').insert({
    user_id: '00000000-0000-0000-0000-000000000000',
    opportunity_id: '00000000-0000-0000-0000-000000000000'
  })
  log('saved_opportunities blocked for anon (expected)', !!savedAnonErr, savedAnonErr ? 'correctly blocked' : '⚠️ should be blocked!')

  // ─── 7. AUTH ─────────────────────────────────────────────
  console.log('\n🔐  AUTH')
  const { data: session } = await supabase.auth.getSession()
  log('Auth session check (anon = null)', session?.session === null, session?.session === null ? 'no active session (anon)' : 'has session')

  const { error: signInErr } = await supabase.auth.signInWithPassword({ email: 'nonexistent@test.com', password: 'wrongpassword' })
  log('Auth signIn rejects bad credentials', !!signInErr, signInErr?.message?.slice(0, 60))

  // ─── SUMMARY ─────────────────────────────────────────────
  console.log('\n' + '━'.repeat(55))
  console.log(`  RESULTS: ${pass} passed, ${fail} failed`)
  if (fail === 0) {
    console.log('  🎉 All checks passed! Supabase is fully operational.')
  } else {
    console.log('  ⚠️  Some checks failed. See ❌ above for details.')
    results.filter(r => !r.ok).forEach(r => console.log(`     → ${r.label}`))
  }
  console.log('━'.repeat(55))
}

run().catch(console.error)
