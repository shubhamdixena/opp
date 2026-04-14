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

const tables = [
  'organizations',
  'categories',
  'tags',
  'opportunities',
  'opportunity_categories',
  'opportunity_tags',
  'saved_opportunities'
]

async function checkRLS() {
  console.log('=== RLS DIAGNOSTICS (anon key) ===\n')

  for (const table of tables) {
    // SELECT
    const { data: selData, error: selErr } = await supabase.from(table).select('*').limit(1)
    const selectOk = !selErr

    // INSERT (dummy row, expected to fail or succeed)
    let insertOk = null
    let insertErr = null
    if (table === 'organizations') {
      const r = await supabase.from('organizations').insert({ name: '__rls_test__', logo_emoji: '🔧' }).select().single()
      insertOk = !r.error
      insertErr = r.error?.message
      // cleanup
      if (!r.error && r.data) await supabase.from('organizations').delete().eq('id', r.data.id)
    } else if (table === 'tags') {
      const r = await supabase.from('tags').insert({ name: `__rls_test_${Date.now()}__` }).select().single()
      insertOk = !r.error
      insertErr = r.error?.message
      if (!r.error && r.data) await supabase.from('tags').delete().eq('id', r.data.id)
    } else if (table === 'categories') {
      const r = await supabase.from('categories').insert({ name: '__rls_test__', slug: `__rls-test-${Date.now()}__` }).select().single()
      insertOk = !r.error
      insertErr = r.error?.message
      if (!r.error && r.data) await supabase.from('categories').delete().eq('id', r.data.id)
    }

    const selectStatus = selectOk ? '✅ SELECT ok' : `❌ SELECT BLOCKED: ${selErr?.message}`
    const insertStatus = insertOk === null
      ? '⏭  INSERT (not tested)'
      : insertOk
        ? '✅ INSERT ok'
        : `❌ INSERT BLOCKED: ${insertErr}`

    console.log(`[${table}]`)
    console.log(`  ${selectStatus}`)
    console.log(`  ${insertStatus}`)
  }

  // Also check opportunities UPDATE
  console.log('\n[opportunities - UPDATE test]')
  const { data: rows } = await supabase.from('opportunities').select('id, title').limit(1)
  if (rows && rows.length > 0) {
    const { error: updErr } = await supabase
      .from('opportunities')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', rows[0].id)
    console.log(updErr ? `  ❌ UPDATE BLOCKED: ${updErr.message}` : '  ✅ UPDATE ok')
  } else {
    console.log('  ⏭  No rows to test update')
  }

  // Test saved_opportunities (needs auth.uid — will fail as anon, which is correct)
  console.log('\n[saved_opportunities - INSERT test (anon, should fail)]')
  const { error: savErr } = await supabase.from('saved_opportunities').insert({
    user_id: '00000000-0000-0000-0000-000000000000',
    opportunity_id: rows?.[0]?.id || '00000000-0000-0000-0000-000000000000'
  })
  console.log(savErr
    ? `  ✅ Correctly blocked for anon: ${savErr.message}`
    : '  ⚠️  Unexpected success — saved_opportunities insert should require auth!'
  )

  console.log('\n=== DONE ===')
}

checkRLS().catch(console.error)
