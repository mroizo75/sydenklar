-- Forespørsler om skreddersydd opphold (hotell og bakketjenester som egne bestillinger).
-- Kjør i Supabase SQL Editor.

CREATE TABLE IF NOT EXISTS trip_inquiries (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  status            text NOT NULL DEFAULT 'ny',
  name              text NOT NULL,
  email             text NOT NULL,
  phone             text,
  destination       text NOT NULL,
  hotel_name        text,
  check_in          date,
  check_out         date,
  flexible_dates    boolean NOT NULL DEFAULT false,
  adults            integer NOT NULL DEFAULT 2,
  children          integer NOT NULL DEFAULT 0,
  child_ages        text,
  rooms             integer NOT NULL DEFAULT 1,
  budget_nok        integer,
  services          jsonb NOT NULL DEFAULT '{}',
  flight_help       boolean NOT NULL DEFAULT false,
  departure_airport text,
  notes             text,
  offer             jsonb,
  offer_sent_at     timestamptz,
  created_at        timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_trip_inquiries_created ON trip_inquiries(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_trip_inquiries_status ON trip_inquiries(status);

ALTER TABLE trip_inquiries ENABLE ROW LEVEL SECURITY;
