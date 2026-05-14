CREATE TABLE IF NOT EXISTS flight_price_alerts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_email TEXT NOT NULL,
  origin_code TEXT NOT NULL,
  origin_label TEXT NOT NULL,
  dest_code TEXT NOT NULL,
  dest_label TEXT NOT NULL,
  dep_date DATE NOT NULL,
  ref_price INTEGER NOT NULL,
  last_notified_price INTEGER,
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE flight_price_alerts DISABLE ROW LEVEL SECURITY;
