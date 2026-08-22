CREATE TABLE analytics_events (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id text NOT NULL,
  event_type text NOT NULL,
  page_path text,
  referrer text,
  metadata jsonb DEFAULT '{}',
  user_agent text,
  device_type text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_analytics_events_type ON analytics_events(event_type);
CREATE INDEX idx_analytics_events_session ON analytics_events(session_id);
CREATE INDEX idx_analytics_events_created ON analytics_events(created_at);
CREATE INDEX idx_analytics_events_type_created ON analytics_events(event_type, created_at);

-- RPC: daglige tellinger per event_type
CREATE OR REPLACE FUNCTION analytics_daily_counts(start_date timestamptz, end_date timestamptz)
RETURNS TABLE(day date, event_type text, count bigint) AS $$
  SELECT
    date_trunc('day', created_at)::date AS day,
    event_type,
    count(*) AS count
  FROM analytics_events
  WHERE created_at >= start_date AND created_at <= end_date
  GROUP BY day, event_type
  ORDER BY day;
$$ LANGUAGE sql STABLE;

-- RPC: siste event per session (for drop-off analyse)
CREATE OR REPLACE FUNCTION analytics_dropoff_sessions(start_date timestamptz, end_date timestamptz)
RETURNS TABLE(last_event text, session_count bigint) AS $$
  WITH last_events AS (
    SELECT DISTINCT ON (session_id)
      session_id,
      event_type
    FROM analytics_events
    WHERE created_at >= start_date AND created_at <= end_date
      AND event_type != 'bounce'
    ORDER BY session_id, created_at DESC
  )
  SELECT event_type AS last_event, count(*) AS session_count
  FROM last_events
  GROUP BY event_type
  ORDER BY session_count DESC;
$$ LANGUAGE sql STABLE;
