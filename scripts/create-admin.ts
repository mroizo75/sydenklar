/**
 * Oppretter admin-bruker i Supabase.
 *
 * Bruk:
 *   npx tsx scripts/create-admin.ts post@sydenklar.no DittPassord123
 */

import path from 'path'
import dotenv from 'dotenv'
dotenv.config({ path: path.join(process.cwd(), '.env.local') })

import bcrypt from 'bcryptjs'
import { createClient } from '@supabase/supabase-js'

const email    = process.argv[2]
const password = process.argv[3]

if (!email || !password) {
  console.error('Bruk: npx tsx scripts/create-admin.ts <epost> <passord>')
  process.exit(1)
}

if (password.length < 8) {
  console.error('Passordet må være minst 8 tegn')
  process.exit(1)
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
)

async function run() {
  const hash = await bcrypt.hash(password, 10)

  const { error } = await supabase
    .from('users')
    .upsert(
      {
        email: email.toLowerCase().trim(),
        password_hash: hash,
        first_name: 'Admin',
        last_name: 'Sydenklar',
        role: 'admin',
      },
      { onConflict: 'email' }
    )

  if (error) {
    console.error('❌ Feil:', error.message)
    process.exit(1)
  }

  console.log(`\n✅ Admin-bruker opprettet / oppdatert`)
  console.log(`   E-post  : ${email}`)
  console.log(`   Passord : (skjult)`)
  console.log(`\n👉 Logg inn på: https://www.sydenklar.no/logg-inn`)
  console.log(`   Admin-panel: https://www.sydenklar.no/admin\n`)
}

run()
