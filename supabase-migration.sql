-- 在 Supabase Dashboard > SQL Editor 執行此檔案

-- 1. 機票追蹤（跨裝置，用 email 識別）
create table if not exists flight_tracks (
  id                 text primary key,
  email              text not null,
  origin_code        text,
  origin_label       text,
  dest_code          text,
  dest_label         text,
  dest_flag          text,
  dep_date           text,
  ret_date           text,
  price_ref          text,
  skyscanner_url     text,
  google_flights_url text,
  saved_at           timestamptz default now(),
  last_checked       timestamptz default now(),
  last_notified      timestamptz
);
create index if not exists flight_tracks_email_idx on flight_tracks(email);

-- 2. 現在最夯快取（Gemini 每週更新）
create table if not exists trending_cache (
  country_code text primary key,
  data         jsonb not null,
  updated_at   timestamptz default now()
);

-- 3. 追星行程快取（Gemini 每月更新）
create table if not exists idol_cache (
  id         text primary key default 'main',
  data       jsonb not null,
  updated_at timestamptz default now()
);

-- 4. API Rate Limiting 記錄表
create table if not exists api_rate_log (
  id         bigserial primary key,
  ip         text not null,
  endpoint   text not null,
  called_at  timestamptz default now()
);
create index if not exists api_rate_log_ip_ep_idx on api_rate_log(ip, endpoint, called_at);

-- 自動清理 2 小時以上的舊紀錄（避免資料表膨脹）
create or replace function cleanup_rate_log() returns trigger language plpgsql as $$
begin
  delete from api_rate_log where called_at < now() - interval '2 hours';
  return new;
end;
$$;
create or replace trigger trg_cleanup_rate_log
  after insert on api_rate_log
  for each statement execute function cleanup_rate_log();

-- RLS：全部暫時開放（之後可依需求收緊）
alter table flight_tracks  disable row level security;
alter table trending_cache disable row level security;
alter table idol_cache     disable row level security;
alter table api_rate_log   disable row level security;
