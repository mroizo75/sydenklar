-- Newsletter subscribers table
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/_/sql

CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email              text UNIQUE NOT NULL,
  first_name         text,
  unsubscribe_token  text UNIQUE NOT NULL DEFAULT gen_random_uuid()::text,
  subscribed_at      timestamptz NOT NULL DEFAULT now(),
  unsubscribed_at    timestamptz,
  source             text DEFAULT 'website'
);

CREATE INDEX IF NOT EXISTS idx_subscribers_email ON newsletter_subscribers(email);
CREATE INDEX IF NOT EXISTS idx_subscribers_token  ON newsletter_subscribers(unsubscribe_token);

-- RLS: block all anon access, service_role bypasses RLS automatically
ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;
