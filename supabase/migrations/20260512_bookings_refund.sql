-- Legger til refusjonskolonner på bookings-tabellen
-- Kjør i Supabase SQL Editor: https://supabase.com/dashboard/project/_/sql

ALTER TABLE bookings ADD COLUMN IF NOT EXISTS stripe_refund_id   text;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS refunded_amount    numeric(12, 2);
