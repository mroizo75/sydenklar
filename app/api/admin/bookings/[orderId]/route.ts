import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { getBookingByPartnerOrderId } from '@/lib/users-db'

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS ?? '')
  .split(',')
  .map(e => e.trim().toLowerCase())
  .filter(Boolean)

async function authorize(): Promise<boolean> {
  const session = await auth()
  if (!session?.user?.email) return false
  return ADMIN_EMAILS.length === 0 || ADMIN_EMAILS.includes(session.user.email.toLowerCase())
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  if (!(await authorize())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { orderId } = await params
  const booking = await getBookingByPartnerOrderId(orderId)

  if (!booking) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  return NextResponse.json({ booking })
}
