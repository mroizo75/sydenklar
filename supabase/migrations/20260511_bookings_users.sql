-- Bookings and users tables for Sydenklar
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/_/sql

-- Users
CREATE TABLE IF NOT EXISTS users (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email         text UNIQUE NOT NULL,
  password_hash text,
  first_name    text,
  last_name     text,
  phone         text,
  role          text NOT NULL DEFAULT 'support',  -- 'admin' | 'support'
  created_at    timestamptz NOT NULL DEFAULT now()
);

-- Hvis tabellen allerede eksisterer, legg til role-kolonnen:
ALTER TABLE users ADD COLUMN IF NOT EXISTS role text NOT NULL DEFAULT 'support';

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Bookings
CREATE TABLE IF NOT EXISTS bookings (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_order_id    text UNIQUE NOT NULL,
  user_id             uuid REFERENCES users(id) ON DELETE SET NULL,
  guest_email         text NOT NULL,
  guest_first_name    text NOT NULL,
  guest_last_name     text NOT NULL,
  guest_phone         text,
  hotel_id            text,
  hotel_name          text,
  room_name           text,
  check_in            date,
  check_out           date,
  adults              integer,
  children            integer DEFAULT 0,
  rooms               integer DEFAULT 1,
  amount              numeric(12, 2),
  currency            text DEFAULT 'NOK',
  stripe_payment_id   text,
  ratehawk_order_id   bigint,
  status              text NOT NULL DEFAULT 'pending',
  cancellation_info   text,
  created_at          timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_bookings_partner_order_id ON bookings(partner_order_id);
CREATE INDEX IF NOT EXISTS idx_bookings_guest_email      ON bookings(guest_email);
CREATE INDEX IF NOT EXISTS idx_bookings_user_id          ON bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status           ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_created_at       ON bookings(created_at DESC);

-- RLS: block anon, service_role bypasses automatically
ALTER TABLE users    ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Kolonner for admin-bestilling på vegne av kunde
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS hotel_address      text;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS cancellation_policy text;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS prebook_data       jsonb;
