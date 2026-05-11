'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface AdminUser {
  id: string
  email: string
  firstName: string | null
  lastName: string | null
  role: 'admin' | 'support'
  createdAt: string
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('nb-NO', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

export default function AdminBrukerePage() {
  const router = useRouter()
  const [users, setUsers] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({ email: '', password: '', firstName: '', lastName: '', role: 'support' as 'admin' | 'support' })
  const [formError, setFormError] = useState('')

  async function loadUsers() {
    setLoading(true)
    const res = await fetch('/api/admin/users')
    if (res.status === 403) {
      router.replace('/admin')
      return
    }
    if (!res.ok) { setError('Klarte ikke hente brukere'); setLoading(false); return }
    const data = await res.json()
    setUsers(data.users)
    setLoading(false)
  }

  useEffect(() => { loadUsers() }, [])

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setFormError('')
    if (!form.email || !form.password) { setFormError('E-post og passord er påkrevd'); return }
    setSubmitting(true)
    const res = await fetch('/api/admin/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    const data = await res.json()
    setSubmitting(false)
    if (!res.ok) { setFormError(data.error ?? 'Noe gikk galt'); return }
    setForm({ email: '', password: '', firstName: '', lastName: '', role: 'support' })
    setShowForm(false)
    loadUsers()
  }

  async function handleDelete(id: string, email: string) {
    if (!confirm(`Slett brukeren ${email}?`)) return
    await fetch(`/api/admin/users/${id}`, { method: 'DELETE' })
    setUsers(prev => prev.filter(u => u.id !== id))
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 700, color: '#0F1923' }}>Brukere</h1>
          <p style={{ margin: '4px 0 0', color: '#6B7280', fontSize: '14px' }}>
            Administrer admin- og support-brukere. Support-brukere ser ikke inntektstall.
          </p>
        </div>
        <button
          onClick={() => setShowForm(v => !v)}
          style={{
            padding: '10px 20px',
            borderRadius: '8px',
            backgroundColor: '#0F1923',
            color: '#fff',
            fontSize: '14px',
            fontWeight: 600,
            border: 'none',
            cursor: 'pointer',
          }}
        >
          {showForm ? 'Avbryt' : '+ Ny bruker'}
        </button>
      </div>

      {/* Ny-bruker-skjema */}
      {showForm && (
        <form onSubmit={handleCreate} style={{
          backgroundColor: '#fff',
          border: '1px solid #E5E7EB',
          borderRadius: '12px',
          padding: '24px',
          marginBottom: '28px',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
          gap: '16px',
          alignItems: 'end',
        }}>
          <Field label="E-post *" type="email" placeholder="navn@eksempel.no" value={form.email} onChange={v => setForm(f => ({ ...f, email: v }))} />
          <Field label="Passord *" type="password" placeholder="Minst 8 tegn" value={form.password} onChange={v => setForm(f => ({ ...f, password: v }))} />
          <Field label="Fornavn" type="text" placeholder="Ola" value={form.firstName} onChange={v => setForm(f => ({ ...f, firstName: v }))} />
          <Field label="Etternavn" type="text" placeholder="Nordmann" value={form.lastName} onChange={v => setForm(f => ({ ...f, lastName: v }))} />
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#374151', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.4px' }}>Rolle</label>
            <select
              value={form.role}
              onChange={e => setForm(f => ({ ...f, role: e.target.value as 'admin' | 'support' }))}
              style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #E5E7EB', fontSize: '14px', backgroundColor: '#fff' }}
            >
              <option value="support">Support — hjelper kunder</option>
              <option value="admin">Admin — full tilgang</option>
            </select>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {formError && <p style={{ margin: 0, fontSize: '12px', color: '#B91C1C' }}>{formError}</p>}
            <button
              type="submit"
              disabled={submitting}
              style={{
                padding: '10px 20px',
                borderRadius: '8px',
                backgroundColor: '#E5623E',
                color: '#fff',
                fontSize: '14px',
                fontWeight: 600,
                border: 'none',
                cursor: submitting ? 'default' : 'pointer',
                opacity: submitting ? 0.7 : 1,
              }}
            >
              {submitting ? 'Oppretter…' : 'Opprett bruker'}
            </button>
          </div>
        </form>
      )}

      {/* Rolleinformasjon */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '28px' }}>
        <RoleCard
          title="Admin"
          badge="#C9A84C"
          items={['Full tilgang til alt', 'Ser inntekt og omsetning', 'Kan opprette/slette brukere', 'Kan avbestille bookinger']}
        />
        <RoleCard
          title="Support"
          badge="#6B7280"
          items={['Ser alle bestillinger', 'Kan søke og filtrere', 'Kan sende bekreftelsesepost på nytt', 'Ser IKKE inntekt']}
        />
      </div>

      {/* Brukertabell */}
      {loading && <p style={{ color: '#9CA3AF', fontSize: '14px' }}>Laster…</p>}
      {error && <p style={{ color: '#B91C1C', fontSize: '14px' }}>{error}</p>}
      {!loading && !error && (
        <div style={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #E5E7EB', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
            <thead>
              <tr style={{ backgroundColor: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}>
                {['Bruker', 'E-post', 'Rolle', 'Opprettet', ''].map(h => (
                  <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: '#374151' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ padding: '48px 16px', textAlign: 'center', color: '#9CA3AF' }}>
                    Ingen brukere registrert ennå
                  </td>
                </tr>
              )}
              {users.map((u, i) => (
                <tr key={u.id} style={{ borderBottom: i < users.length - 1 ? '1px solid #F3F4F6' : 'none' }}>
                  <td style={{ padding: '14px 16px' }}>
                    <p style={{ margin: 0, fontWeight: 500, color: '#111827' }}>
                      {u.firstName || u.lastName ? `${u.firstName ?? ''} ${u.lastName ?? ''}`.trim() : '—'}
                    </p>
                  </td>
                  <td style={{ padding: '14px 16px', color: '#374151' }}>{u.email}</td>
                  <td style={{ padding: '14px 16px' }}>
                    <span style={{
                      display: 'inline-block',
                      padding: '3px 10px',
                      borderRadius: '20px',
                      fontSize: '12px',
                      fontWeight: 600,
                      backgroundColor: u.role === 'admin' ? 'rgba(201,168,76,0.12)' : '#F3F4F6',
                      color: u.role === 'admin' ? '#92750A' : '#374151',
                    }}>
                      {u.role}
                    </span>
                  </td>
                  <td style={{ padding: '14px 16px', color: '#9CA3AF', fontSize: '13px' }}>
                    {fmtDate(u.createdAt)}
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <button
                      onClick={() => handleDelete(u.id, u.email)}
                      style={{
                        padding: '6px 12px',
                        borderRadius: '6px',
                        border: '1px solid #FCA5A5',
                        backgroundColor: 'transparent',
                        color: '#B91C1C',
                        fontSize: '12px',
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      Slett
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

function Field({ label, type, placeholder, value, onChange }: {
  label: string; type: string; placeholder: string; value: string; onChange: (v: string) => void
}) {
  return (
    <div>
      <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#374151', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
        {label}
      </label>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={e => onChange(e.target.value)}
        style={{ width: '100%', boxSizing: 'border-box', padding: '10px 12px', borderRadius: '8px', border: '1px solid #E5E7EB', fontSize: '14px' }}
      />
    </div>
  )
}

function RoleCard({ title, badge, items }: { title: string; badge: string; items: string[] }) {
  return (
    <div style={{ backgroundColor: '#fff', border: '1px solid #E5E7EB', borderRadius: '10px', padding: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
        <span style={{ display: 'inline-block', padding: '3px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 700, backgroundColor: badge === '#C9A84C' ? 'rgba(201,168,76,0.12)' : '#F3F4F6', color: badge === '#C9A84C' ? '#92750A' : '#374151' }}>
          {title}
        </span>
      </div>
      <ul style={{ margin: 0, paddingLeft: '20px', color: '#6B7280', fontSize: '13px', lineHeight: '1.8' }}>
        {items.map(item => <li key={item}>{item}</li>)}
      </ul>
    </div>
  )
}
