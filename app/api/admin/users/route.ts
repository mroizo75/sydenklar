import { NextRequest, NextResponse } from 'next/server'
import { requireAdminUser } from '@/lib/admin-auth'
import { getAllUsers, upsertUser } from '@/lib/users-db'
import bcrypt from 'bcryptjs'

export async function GET() {
  const user = await requireAdminUser()
  if (!user.isAdmin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const users = await getAllUsers()
  return NextResponse.json({ users: users.map(u => ({
    id: u.id,
    email: u.email,
    firstName: u.firstName,
    lastName: u.lastName,
    role: u.role,
    createdAt: u.createdAt,
  })) })
}

export async function POST(req: NextRequest) {
  const user = await requireAdminUser()
  if (!user.isAdmin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await req.json().catch(() => null)
  if (!body?.email || !body?.password) {
    return NextResponse.json({ error: 'E-post og passord er påkrevd' }, { status: 400 })
  }

  const email = String(body.email).toLowerCase().trim()
  const passwordHash = await bcrypt.hash(String(body.password), 12)
  const role = body.role === 'admin' ? 'admin' : 'support'

  const created = await upsertUser({
    email,
    passwordHash,
    firstName: body.firstName ?? undefined,
    lastName: body.lastName ?? undefined,
    role,
  })

  if (!created) {
    return NextResponse.json({ error: 'Klarte ikke opprette bruker' }, { status: 500 })
  }

  return NextResponse.json({ user: { id: created.id, email: created.email, role: created.role } }, { status: 201 })
}
