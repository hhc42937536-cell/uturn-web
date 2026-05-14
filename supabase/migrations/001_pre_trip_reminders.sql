CREATE TABLE IF NOT EXISTS pre_trip_reminders (
  id          UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  user_email  TEXT        NOT NULL,
  destination TEXT        NOT NULL,
  dep_date    DATE        NOT NULL,
  sent_at     TIMESTAMPTZ,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- cron 用 anon key 查詢，暫時關閉 RLS
ALTER TABLE pre_trip_reminders DISABLE ROW LEVEL SECURITY;
