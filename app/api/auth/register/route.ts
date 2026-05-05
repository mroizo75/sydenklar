import { NextRequest, NextResponse } from 'next/server'
import { createUser, getUserByEmail, linkBookingsByEmail } from '@/lib/users-db'
import { randomUUID } from 'crypto'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password, firstName, lastName, phone } = body

    if (!email || !password) {
      return NextResponse.json({ error: 'E-post og passord er påkrevd' }, { status: 400 })
    }

    const emailTrimmed = String(email).toLowerCase().trim()
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailTrimmed)) {
      return NextResponse.json({ error: 'Ugyldig e-postadresse' }, { status: 400 })
    }

    if (String(password).length < 8) {
      return NextResponse.json({ error: 'Passord må være minst 8 tegn' }, { status: 400 })
    }

    const existing = await getUserByEmail(emailTrimmed)
    if (existing) {
      return NextResponse.json({ error: 'En konto med denne e-posten finnes allerede' }, { status: 409 })
    }

    const bcrypt = await import('bcryptjs')
    const passwordHash = await bcrypt.hash(String(password), 12)

    const user = await createUser({
      id: randomUUID(),
      email: emailTrimmed,
      passwordHash,
      firstName: firstName ? String(firstName).trim() : undefined,
      lastName: lastName ? String(lastName).trim() : undefined,
      phone: phone ? String(phone).trim() : undefined,
    })

    if (!user) {
      return NextResponse.json({ error: 'Kunne ikke opprette konto. Prøv igjen.' }, { status: 500 })
    }

    // Koble eksisterende bookinger (gjort som gjest) til den nye kontoen
    await linkBookingsByEmail(emailTrimmed, user.id)

    return NextResponse.json({ success: true, userId: user.id })
  } catch (error: unknown) {
    const err = error as { message?: string }
    return NextResponse.json({ error: err.message || 'Registrering feilet' }, { status: 500 })
  }
}
