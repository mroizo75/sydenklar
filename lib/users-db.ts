/**
 * SQLite tables for users and bookings.
 * Uses the same hotel-static.db database file via better-sqlite3.
 */

import Database from 'better-sqlite3'
import path from 'path'
import fs from 'fs'

const DB_PATH = path.join(process.cwd(), 'data', 'hotel-static.db')

let _db: Database.Database | null = null

function getDb(): Database.Database {
  if (_db) return _db

  const dir = path.dirname(DB_PATH)
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })

  _db = new Database(DB_PATH)
  _db.pragma('journal_mode = WAL')
  _db.pragma('synchronous = NORMAL')

  _db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id           TEXT PRIMARY KEY,
      email        TEXT UNIQUE NOT NULL,
      password_hash TEXT,
      first_name   TEXT,
      last_name    TEXT,
      phone        TEXT,
      created_at   INTEGER NOT NULL DEFAULT (unixepoch())
    );

    CREATE TABLE IF NOT EXISTS bookings (
      id                TEXT PRIMARY KEY,
      partner_order_id  TEXT UNIQUE NOT NULL,
      user_id           TEXT,
      guest_email       TEXT NOT NULL,
      guest_first_name  TEXT NOT NULL,
      guest_last_name   TEXT NOT NULL,
      guest_phone       TEXT,
      hotel_id          TEXT,
      hotel_name        TEXT,
      room_name         TEXT,
      check_in          TEXT,
      check_out         TEXT,
      adults            INTEGER,
      children          INTEGER DEFAULT 0,
      rooms             INTEGER DEFAULT 1,
      amount            REAL,
      currency          TEXT,
      stripe_payment_id TEXT,
      ratehawk_order_id INTEGER,
      status            TEXT DEFAULT 'pending',
      cancellation_info TEXT,
      created_at        INTEGER NOT NULL DEFAULT (unixepoch())
    );

    CREATE INDEX IF NOT EXISTS idx_bookings_user_id   ON bookings(user_id);
    CREATE INDEX IF NOT EXISTS idx_bookings_email     ON bookings(guest_email);
    CREATE INDEX IF NOT EXISTS idx_bookings_partner   ON bookings(partner_order_id);
  `)

  return _db
}

// --- Users ---

export interface UserRecord {
  id: string
  email: string
  passwordHash?: string | null
  firstName?: string | null
  lastName?: string | null
  phone?: string | null
  createdAt: number
}

export function createUser(params: {
  id: string
  email: string
  passwordHash?: string
  firstName?: string
  lastName?: string
  phone?: string
}): UserRecord | null {
  try {
    getDb().prepare(`
      INSERT INTO users (id, email, password_hash, first_name, last_name, phone)
      VALUES (@id, @email, @passwordHash, @firstName, @lastName, @phone)
    `).run({
      id: params.id,
      email: params.email.toLowerCase().trim(),
      passwordHash: params.passwordHash ?? null,
      firstName: params.firstName ?? null,
      lastName: params.lastName ?? null,
      phone: params.phone ?? null,
    })
    return getUserById(params.id)
  } catch {
    return null
  }
}

export function getUserByEmail(email: string): UserRecord | null {
  try {
    const row = getDb().prepare('SELECT * FROM users WHERE email = ?').get(email.toLowerCase().trim()) as any
    return row ? mapUserRow(row) : null
  } catch {
    return null
  }
}

export function getUserById(id: string): UserRecord | null {
  try {
    const row = getDb().prepare('SELECT * FROM users WHERE id = ?').get(id) as any
    return row ? mapUserRow(row) : null
  } catch {
    return null
  }
}

function mapUserRow(row: any): UserRecord {
  return {
    id: row.id,
    email: row.email,
    passwordHash: row.password_hash ?? null,
    firstName: row.first_name ?? null,
    lastName: row.last_name ?? null,
    phone: row.phone ?? null,
    createdAt: row.created_at,
  }
}

// --- Bookings ---

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
  createdAt: number
}

export function createBooking(params: Omit<BookingRecord, 'createdAt'>): BookingRecord | null {
  try {
    getDb().prepare(`
      INSERT INTO bookings (
        id, partner_order_id, user_id, guest_email, guest_first_name, guest_last_name,
        guest_phone, hotel_id, hotel_name, room_name, check_in, check_out,
        adults, children, rooms, amount, currency, stripe_payment_id,
        ratehawk_order_id, status, cancellation_info
      ) VALUES (
        @id, @partnerOrderId, @userId, @guestEmail, @guestFirstName, @guestLastName,
        @guestPhone, @hotelId, @hotelName, @roomName, @checkIn, @checkOut,
        @adults, @children, @rooms, @amount, @currency, @stripePaymentId,
        @ratehawkOrderId, @status, @cancellationInfo
      )
    `).run({
      id: params.id,
      partnerOrderId: params.partnerOrderId,
      userId: params.userId ?? null,
      guestEmail: params.guestEmail,
      guestFirstName: params.guestFirstName,
      guestLastName: params.guestLastName,
      guestPhone: params.guestPhone ?? null,
      hotelId: params.hotelId ?? null,
      hotelName: params.hotelName ?? null,
      roomName: params.roomName ?? null,
      checkIn: params.checkIn ?? null,
      checkOut: params.checkOut ?? null,
      adults: params.adults ?? null,
      children: params.children ?? null,
      rooms: params.rooms ?? null,
      amount: params.amount ?? null,
      currency: params.currency ?? null,
      stripePaymentId: params.stripePaymentId ?? null,
      ratehawkOrderId: params.ratehawkOrderId ?? null,
      status: params.status,
      cancellationInfo: params.cancellationInfo ?? null,
    })
    return getBookingByPartnerOrderId(params.partnerOrderId)
  } catch {
    return null
  }
}

export function updateBookingStatus(
  partnerOrderId: string,
  status: string,
  ratehawkOrderId?: number,
  stripePaymentId?: string,
): void {
  try {
    getDb().prepare(`
      UPDATE bookings SET
        status = @status,
        ratehawk_order_id = COALESCE(@ratehawkOrderId, ratehawk_order_id),
        stripe_payment_id = COALESCE(@stripePaymentId, stripe_payment_id)
      WHERE partner_order_id = @partnerOrderId
    `).run({
      partnerOrderId,
      status,
      ratehawkOrderId: ratehawkOrderId ?? null,
      stripePaymentId: stripePaymentId ?? null,
    })
  } catch { /* ignore */ }
}

export function getBookingByPartnerOrderId(partnerOrderId: string): BookingRecord | null {
  try {
    const row = getDb().prepare('SELECT * FROM bookings WHERE partner_order_id = ?').get(partnerOrderId) as any
    return row ? mapBookingRow(row) : null
  } catch {
    return null
  }
}

export function getBookingsByUserId(userId: string): BookingRecord[] {
  try {
    const rows = getDb().prepare(
      'SELECT * FROM bookings WHERE user_id = ? ORDER BY created_at DESC'
    ).all(userId) as any[]
    return rows.map(mapBookingRow)
  } catch {
    return []
  }
}

export function getBookingsByEmail(email: string): BookingRecord[] {
  try {
    const rows = getDb().prepare(
      'SELECT * FROM bookings WHERE guest_email = ? ORDER BY created_at DESC'
    ).all(email.toLowerCase()) as any[]
    return rows.map(mapBookingRow)
  } catch {
    return []
  }
}

function mapBookingRow(row: any): BookingRecord {
  return {
    id: row.id,
    partnerOrderId: row.partner_order_id,
    userId: row.user_id ?? null,
    guestEmail: row.guest_email,
    guestFirstName: row.guest_first_name,
    guestLastName: row.guest_last_name,
    guestPhone: row.guest_phone ?? null,
    hotelId: row.hotel_id ?? null,
    hotelName: row.hotel_name ?? null,
    roomName: row.room_name ?? null,
    checkIn: row.check_in ?? null,
    checkOut: row.check_out ?? null,
    adults: row.adults ?? null,
    children: row.children ?? null,
    rooms: row.rooms ?? null,
    amount: row.amount ?? null,
    currency: row.currency ?? null,
    stripePaymentId: row.stripe_payment_id ?? null,
    ratehawkOrderId: row.ratehawk_order_id ?? null,
    status: row.status,
    cancellationInfo: row.cancellation_info ?? null,
    createdAt: row.created_at,
  }
}
