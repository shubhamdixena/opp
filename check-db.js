import { createClient } from '@supabase/supabase-js'
import fs from 'fs'

const envContent = fs.readFileSync('.env', 'utf-8')
const env = Object.fromEntries(envContent.split('\n').filter(Boolean).map(line => line.split('=').map(p => p.trim().replace(/"/g, ''))))

const supabase = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY)

async function attemptUpdate() {
  const { data: rows } = await supabase.from('opportunities').select('id, deadline').limit(1)
  if (!rows || rows.length === 0) return console.log('No rows')

  const id = rows[0].id
  const { data, error } = await supabase.from('opportunities').update({ title: 'Test Update' }).eq('id', id).select()
  
  if (error) {
    console.error('Update failed:', error)
  } else {
    console.log('Update success!', data)
    // Revert back
    const { error: revError } = await supabase.from('opportunities').update({ title: rows[0].title }).eq('id', id)
  }
}

attemptUpdate()
