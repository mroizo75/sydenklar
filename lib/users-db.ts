import { supabase } from './supabase'

export interface UserRecord {
  id: string
  email: string
  passwordHash?: string | null
  firstName?: string | null
  lastName?: string | null
  phone?: string | null
  createdAt: string
}

export interface BookingRecord {
  id: string
  partnerOrderId: string
  userId?: string | null
  guestEmail: string
  guestFirstName: string
  guestLastName: string
  guestPhone?: string | null
  hotelId?: string | null
  hotelName?: string | null
  roomName?: string | null
  checkIn?: string | null
  checkOut?: string | null
  adults?: number | null
  children?: number | null
  rooms?: number | null
  amount?: number | null
  currency?: string | null
  stripePaymentId?: string | null
  ratehawkOrderId?: number | null
  status: string
  cancellationInfo?: string | null
  createdAt: string
}

// --- Users ---

export async function createUser(params: {
  id?: string
  email: string
  passwordHash?: string
  firstName?: string
  lastName?: string
  phone?: string
}): Promise<UserRecord | null> {
  const { data, error } = await supabase
    .from('users')
    .insert({
      id: params.id,
      email: params.email.toLowerCase().trim(),
      password_hash: params.passwordHash ?? null,
      first_name: params.firstName ?? null,
      last_name: params.lastName ?? null,
      phone: params.phone ?? null,
    })
    .select()
    .single()

  if (error) return null
  return mapUserRow(data)
}

export async function getUserByEmail(email: string): Promise<UserRecord | null> {
  const { data, error } = await supabase
    .from('users')
    .select()
    .eq('email', email.toLowerCase().trim())
    .maybeSingle()

  if (error || !data) return null
  return mapUserRow(data)
}

export async function getUserById(id: string): Promise<UserRecord | null> {
  const { data, error } = await supabase
    .from('users')
    .select()
    .eq('id', id)
    .maybeSingle()

  if (error || !data) return null
  return mapUserRow(data)
}

function mapUserRow(row: Record<string, unknown>): UserRecord {
  return {
    id: row.id as string,
    email: row.email as string,
    passwordHash: (row.password_hash as string | null) ?? null,
    firstName: (row.first_name as string | null) ?? null,
    lastName: (row.last_name as string | null) ?? null,
    phone: (row.phone as string | null) ?? null,
    createdAt: row.created_at as string,
  }
}

// --- Bookings ---

export async function createBooking(
  params: Omit<BookingRecord, 'createdAt'>,
): Promise<BookingRecord | null> {
  const { data, error } = await supabase
    .from('bookings')
    .insert({
      id: params.id,
      partner_order_id: params.partnerOrderId,
      user_id: params.userId ?? null,
      guest_email: params.guestEmail,
      guest_first_name: params.guestFirstName,
      guest_last_name: params.guestLastName,
      guest_phone: params.guestPhone ?? null,
      hotel_id: params.hotelId ?? null,
      hotel_name: params.hotelName ?? null,
      room_name: params.roomName ?? null,
      check_in: params.checkIn ?? null,
      check_out: params.checkOut ?? null,
      adults: params.adults ?? null,
      children: params.children ?? null,
      rooms: params.rooms ?? null,
      amount: params.amount ?? null,
      currency: params.currency ?? null,
      stripe_payment_id: params.stripePaymentId ?? null,
      ratehawk_order_id: params.ratehawkOrderId ?? null,
      status: params.status,
      cancellation_info: params.cancellationInfo ?? null,
    })
    .select()
    .single()

  if (error) return null
  return mapBookingRow(data)
}

export async function updateBookingStatus(
  partnerOrderId: string,
  status: string,
  ratehawkOrderId?: number,
  stripePaymentId?: string,
): Promise<void> {
  const update: Record<string, unknown> = { status }
  if (ratehawkOrderId !== undefined) update.ratehawk_order_id = ratehawkOrderId
  if (stripePaymentId !== undefined) update.stripe_payment_id = stripePaymentId

  await supabase
    .from('bookings')
    .update(update)
    .eq('partner_order_id', partnerOrderId)
}

export async function getBookingByPartnerOrderId(
  partnerOrderId: string,
): Promise<BookingRecord | null> {
  const { data, error } = await supabase
    .from('bookings')
    .select()
    .eq('partner_order_id', partnerOrderId)
    .maybeSingle()

  if (error || !data) return null
  return mapBookingRow(data)
}

export async function getBookingsByUserId(userId: string): Promise<BookingRecord[]> {
  const { data, error } = await supabase
    .from('bookings')
    .select()
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error || !data) return []
  return data.map(mapBookingRow)
}

export async function getBookingsByEmail(email: string): Promise<BookingRecord[]> {
  const { data, error } = await supabase
    .from('bookings')
    .select()
    .eq('guest_email', email.toLowerCase())
    .order('created_at', { ascending: false })

  if (error || !data) return []
  return data.map(mapBookingRow)
}

export async function linkBookingsByEmail(email: string, userId: string): Promise<void> {
  await supabase
    .from('bookings')
    .update({ user_id: userId })
    .eq('guest_email', email.toLowerCase().trim())
    .is('user_id', null)
}

export async function linkBookingToUser(partnerOrderId: string, userId: string): Promise<void> {
  await supabase
    .from('bookings')
    .update({ user_id: userId })
    .eq('partner_order_id', partnerOrderId)
    .is('user_id', null)
}

function mapBookingRow(row: Record<string, unknown>): BookingRecord {
  return {
    id: row.id as string,
    partnerOrderId: row.partner_order_id as string,
    userId: (row.user_id as string | null) ?? null,
    guestEmail: row.guest_email as string,
    guestFirstName: row.guest_first_name as string,
    guestLastName: row.guest_last_name as string,
    guestPhone: (row.guest_phone as string | null) ?? null,
    hotelId: (row.hotel_id as string | null) ?? null,
    hotelName: (row.hotel_name as string | null) ?? null,
    roomName: (row.room_name as string | null) ?? null,
    checkIn: (row.check_in as string | null) ?? null,
    checkOut: (row.check_out as string | null) ?? null,
    adults: (row.adults as number | null) ?? null,
    children: (row.children as number | null) ?? null,
    rooms: (row.rooms as number | null) ?? null,
    amount: (row.amount as number | null) ?? null,
    currency: (row.currency as string | null) ?? null,
    stripePaymentId: (row.stripe_payment_id as string | null) ?? null,
    ratehawkOrderId: (row.ratehawk_order_id as number | null) ?? null,
    status: row.status as string,
    cancellationInfo: (row.cancellation_info as string | null) ?? null,
    createdAt: row.created_at as string,
  }
}
