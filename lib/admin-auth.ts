import { auth } from '@/lib/auth'
import { getUserByEmail } from '@/lib/users-db'
import type { UserRole } from '@/lib/users-db'
import { redirect } from 'next/navigation'

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS ?? '')
  .split(',')
  .map(e => e.trim().toLowerCase())
  .filter(Boolean)

export interface AdminUser {
  email: string
  role: UserRole
  isAdmin: boolean
}

/**
 * Henter session + rolle for innlogget bruker.
 * Redirecter til login hvis ikke innlogget.
 * Returnerer null hvis bruker ikke har admin/support-tilgang.
 */
export async function requireAdminUser(): Promise<AdminUser> {
  const session = await auth()

  if (!session?.user?.email) {
    redirect('/logg-inn?redirect=/admin')
  }

  const email = session.user.email.toLowerCase()

  const dbUser = await getUserByEmail(email)

  // Bruker finnes i DB med en rolle — bruk den
  if (dbUser) {
    const role = dbUser.role ?? 'support'
    return { email, role, isAdmin: role === 'admin' }
  }

  // Fallback: gammel ADMIN_EMAILS-sjekk (for bakoverkompatibilitet)
  if (ADMIN_EMAILS.length > 0 && ADMIN_EMAILS.includes(email)) {
    return { email, role: 'admin', isAdmin: true }
  }

  redirect('/')
}
