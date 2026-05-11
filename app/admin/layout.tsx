import { requireAdminUser } from '@/lib/admin-auth'
import { LogoutButton } from './LogoutButton'
import Link from 'next/link'
import type { ReactNode } from 'react'

export const metadata = { title: 'Admin — Sydenklar' }

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const user = await requireAdminUser()

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F8F9FB', fontFamily: "'Helvetica Neue', Arial, sans-serif" }}>

      {/* Top nav */}
      <nav style={{
        backgroundColor: '#0F1923',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        padding: '0 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '56px',
        position: 'sticky',
        top: 0,
        zIndex: 50,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
          <Link href="/admin" style={{ color: '#C9A84C', fontWeight: 700, fontSize: '15px', textDecoration: 'none', letterSpacing: '0.3px' }}>
            SYDENKLAR ADMIN
          </Link>
          <div style={{ display: 'flex', gap: '4px' }}>
            <NavLink href="/admin">Bestillinger</NavLink>
            <NavLink href="/admin?status=confirmed">Bekreftet</NavLink>
            <NavLink href="/admin?status=pending">Venter</NavLink>
            <NavLink href="/admin?status=cancelled">Avbestilt</NavLink>
            <NavLink href="/admin/ny-bestilling">+ Ny bestilling</NavLink>
            {user.isAdmin && <NavLink href="/admin/brukere">Brukere</NavLink>}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{
            color: user.isAdmin ? '#C9A84C' : 'rgba(255,255,255,0.5)',
            fontSize: '11px',
            fontWeight: 600,
            letterSpacing: '0.8px',
            textTransform: 'uppercase',
            backgroundColor: user.isAdmin ? 'rgba(201,168,76,0.12)' : 'rgba(255,255,255,0.06)',
            padding: '2px 8px',
            borderRadius: '4px',
          }}>
            {user.role}
          </span>
          <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px' }}>{user.email}</span>
          <Link href="/" style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px', textDecoration: 'none' }}>
            ← Nettsted
          </Link>
          <LogoutButton />
        </div>
      </nav>

      <main style={{ maxWidth: '1400px', margin: '0 auto', padding: '32px 24px' }}>
        {children}
      </main>

    </div>
  )
}

function NavLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link href={href} style={{
      color: 'rgba(255,255,255,0.6)',
      fontSize: '13px',
      fontWeight: 500,
      textDecoration: 'none',
      padding: '6px 12px',
      borderRadius: '6px',
      transition: 'all 0.15s',
    }}>
      {children}
    </Link>
  )
}
