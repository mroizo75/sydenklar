import { NextRequest, NextResponse } from 'next/server'
import { requireAdminUser } from '@/lib/admin-auth'
import { deleteUser, updateUserRole } from '@/lib/users-db'
import type { UserRole } from '@/lib/users-db'

const ALLOWED_ROLES: UserRole[] = ['admin', 'support', 'customer']

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const user = await requireAdminUser()
  if (!user.isAdmin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { userId } = await params
  const body = await req.json().catch(() => null)
  const newRole = body?.role as UserRole | undefined

  if (!newRole || !ALLOWED_ROLES.includes(newRole)) {
    return NextResponse.json({ error: 'Ugyldig rolle' }, { status: 400 })
  }

  await updateUserRole(userId, newRole)
  return NextResponse.json({ ok: true, role: newRole })
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const user = await requireAdminUser()
  if (!user.isAdmin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { userId } = await params
  await deleteUser(userId)

  return NextResponse.json({ ok: true })
}
