'use client'

import { signOut } from 'next-auth/react'

export function LogoutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: '/logg-inn' })}
      style={{
        padding: '6px 14px',
        borderRadius: '6px',
        border: '1px solid rgba(255,255,255,0.15)',
        backgroundColor: 'transparent',
        color: 'rgba(255,255,255,0.5)',
        fontSize: '13px',
        fontWeight: 500,
        cursor: 'pointer',
        transition: 'all 0.15s',
      }}
      onMouseEnter={e => {
        (e.target as HTMLButtonElement).style.color = '#fff'
        ;(e.target as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,0.35)'
      }}
      onMouseLeave={e => {
        (e.target as HTMLButtonElement).style.color = 'rgba(255,255,255,0.5)'
        ;(e.target as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,0.15)'
      }}
    >
      Logg ut
    </button>
  )
}
