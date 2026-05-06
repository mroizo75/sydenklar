import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.sydenklar.no'

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token')?.trim()

  if (!token) {
    return NextResponse.redirect(`${BASE_URL}/nyhetsbrev/avmeldt?status=feil`)
  }

  const { data, error } = await supabase
    .from('newsletter_subscribers')
    .update({ unsubscribed_at: new Date().toISOString() })
    .eq('unsubscribe_token', token)
    .is('unsubscribed_at', null)
    .select('id')
    .maybeSingle()

  if (error || !data) {
    return NextResponse.redirect(`${BASE_URL}/nyhetsbrev/avmeldt?status=allerede`)
  }

  return NextResponse.redirect(`${BASE_URL}/nyhetsbrev/avmeldt?status=ok`)
}
