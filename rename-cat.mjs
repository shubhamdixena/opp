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

async function run() {
  const { data, error } = await supabase.from('categories').update({ name: 'Miscellaneous', slug: 'miscellaneous', emoji: '📦' }).eq('slug', 'hackathon')
  if (error) console.error('Error updating category:', error)
  else console.log('Successfully updated category')
}

run()
