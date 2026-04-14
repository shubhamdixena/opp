import { createClient } from '@supabase/supabase-js'
import fs from 'fs'

const envContent = fs.readFileSync('.env', 'utf-8')
const env = Object.fromEntries(
  envContent.split('\n').filter(Boolean).map(line => {
    const idx = line.indexOf('=')
    return [line.slice(0, idx).trim(), line.slice(idx + 1).trim().replace(/^"|"$/g, '')]
  })
)

const supabase = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY)

async function deepCheck() {
  console.log('=== DEEP RLS CHECK ===\n')

  // 1. Get a real org id for the opportunity insert test
  const { data: orgs } = await supabase.from('organizations').select('id').limit(1)
  const orgId = orgs?.[0]?.id

  // 2. Test opportunity INSERT
  console.log('[opportunities INSERT]')
  if (!orgId) {
    console.log('  ⏭  No org found to test with')
  } else {
    const testSlug = `__rls-test-${Date.now()}__`
    const { data: newOpp, error: oppErr } = await supabase
      .from('opportunities')
      .insert({
        title: '__RLS Test__',
        slug: testSlug,
        organization_id: orgId,
        description: 'test',
        deadline: '2099-01-01',
        location: 'Test',
        region: 'Global',
        funding_type: 'fully_funded',
        application_url: 'https://example.com',
      })
      .select()
      .single()

    if (oppErr) {
      console.log(`  ❌ INSERT BLOCKED: ${oppErr.message}`)
    } else {
      console.log(`  ✅ INSERT ok — id: ${newOpp.id}`)

      // 3. Test opportunity_categories INSERT
      console.log('\n[opportunity_categories INSERT]')
      const { data: cats } = await supabase.from('categories').select('id').limit(1)
      const catId = cats?.[0]?.id
      if (catId) {
        const { error: catJoinErr } = await supabase
          .from('opportunity_categories')
          .insert({ opportunity_id: newOpp.id, category_id: catId })
        console.log(catJoinErr ? `  ❌ INSERT BLOCKED: ${catJoinErr.message}` : '  ✅ INSERT ok')
        if (!catJoinErr) {
          await supabase.from('opportunity_categories').delete().eq('opportunity_id', newOpp.id)
        }
      } else {
        console.log('  ⏭  No category to test with')
      }

      // 4. Test opportunity_tags INSERT
      console.log('\n[opportunity_tags INSERT]')
      const { data: tags } = await supabase.from('tags').select('id').limit(1)
      const tagId = tags?.[0]?.id
      if (tagId) {
        const { error: tagJoinErr } = await supabase
          .from('opportunity_tags')
          .insert({ opportunity_id: newOpp.id, tag_id: tagId })
        console.log(tagJoinErr ? `  ❌ INSERT BLOCKED: ${tagJoinErr.message}` : '  ✅ INSERT ok')
        if (!tagJoinErr) {
          await supabase.from('opportunity_tags').delete().eq('opportunity_id', newOpp.id)
        }
      } else {
        console.log('  ⏭  No tag to test with')
      }

      // Cleanup
      await supabase.from('opportunities').delete().eq('id', newOpp.id)
      console.log('\n  🧹 Cleanup done')
    }
  }

  // 5. Check INSERT for tags specifically
  console.log('\n[tags INSERT]')
  const { data: newTag, error: tagErr } = await supabase
    .from('tags')
    .insert({ name: `__rls_tag_test_${Date.now()}__` })
    .select().single()
  if (tagErr) {
    console.log(`  ❌ INSERT BLOCKED: ${tagErr.message}`)
  } else {
    console.log('  ✅ INSERT ok')
    await supabase.from('tags').delete().eq('id', newTag.id)
  }

  // 6. Check INSERT for categories
  console.log('\n[categories INSERT]')
  const { data: newCat, error: catErr } = await supabase
    .from('categories')
    .insert({ name: '__rls_cat_test__', slug: `__rls-cat-${Date.now()}__` })
    .select().single()
  if (catErr) {
    console.log(`  ❌ INSERT BLOCKED: ${catErr.message}`)
  } else {
    console.log('  ✅ INSERT ok')
    await supabase.from('categories').delete().eq('id', newCat.id)
  }

  // 7. Check organizations INSERT
  console.log('\n[organizations INSERT]')
  const { data: newOrg, error: orgErr } = await supabase
    .from('organizations')
    .insert({ name: '__rls_org_test__', logo_emoji: '🔧' })
    .select().single()
  if (orgErr) {
    console.log(`  ❌ INSERT BLOCKED: ${orgErr.message}`)
  } else {
    console.log('  ✅ INSERT ok')
    await supabase.from('organizations').delete().eq('id', newOrg.id)
  }

  console.log('\n=== DONE ===')
}

deepCheck().catch(console.error)
