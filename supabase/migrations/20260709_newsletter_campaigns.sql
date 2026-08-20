-- Newsletter events (OL, VM, Pride, etc.)
CREATE TABLE IF NOT EXISTS newsletter_events (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name            text NOT NULL,
  slug            text UNIQUE NOT NULL,
  start_date      date NOT NULL,
  end_date        date NOT NULL,
  hero_image_url  text,
  theme_color     text NOT NULL DEFAULT '#E5623E',
  tagline         text,
  active          boolean NOT NULL DEFAULT false,
  created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_newsletter_events_active ON newsletter_events(active);
CREATE INDEX IF NOT EXISTS idx_newsletter_events_slug  ON newsletter_events(slug);

ALTER TABLE newsletter_events ENABLE ROW LEVEL SECURITY;

-- Newsletter campaigns (one per send)
CREATE TABLE IF NOT EXISTS newsletter_campaigns (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type             text NOT NULL CHECK (type IN ('weekly', 'event')) DEFAULT 'weekly',
  name             text NOT NULL,
  subject          text NOT NULL,
  status           text NOT NULL CHECK (status IN ('draft', 'scheduled', 'sent', 'cancelled')) DEFAULT 'draft',
  sections         jsonb NOT NULL DEFAULT '[]',
  theme            jsonb,
  event_id         uuid REFERENCES newsletter_events(id) ON DELETE SET NULL,
  scheduled_at     timestamptz,
  sent_at          timestamptz,
  recipient_count  int,
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_newsletter_campaigns_status       ON newsletter_campaigns(status);
CREATE INDEX IF NOT EXISTS idx_newsletter_campaigns_scheduled_at ON newsletter_campaigns(scheduled_at) WHERE status = 'scheduled';
CREATE INDEX IF NOT EXISTS idx_newsletter_campaigns_event_id     ON newsletter_campaigns(event_id);

ALTER TABLE newsletter_campaigns ENABLE ROW LEVEL SECURITY;

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_newsletter_campaigns_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_newsletter_campaigns_updated_at
  BEFORE UPDATE ON newsletter_campaigns
  FOR EACH ROW EXECUTE FUNCTION update_newsletter_campaigns_updated_at();
