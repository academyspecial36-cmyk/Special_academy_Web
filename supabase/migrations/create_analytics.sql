-- Analytics: sessions and event tracking

create extension if not exists pgcrypto;

create table if not exists analytics_sessions (
  id uuid primary key default gen_random_uuid(),
  visitor_id uuid not null,
  user_id uuid references auth.users(id) on delete set null,
  started_at timestamptz default now(),
  last_seen_at timestamptz default now()
);

create table if not exists analytics_events (
  id uuid primary key default gen_random_uuid(),
  event_id text unique not null,
  event_type text not null,
  session_id uuid references analytics_sessions(id) on delete set null,
  visitor_id uuid not null,
  user_id uuid references auth.users(id) on delete set null,
  path text,
  exam_id uuid,
  attempt_id uuid,
  import_id uuid,
  metadata jsonb default '{}'::jsonb,
  occurred_at timestamptz default now()
);

create index if not exists analytics_events_type_idx on analytics_events(event_type);
create index if not exists analytics_events_date_idx on analytics_events(occurred_at desc);
create index if not exists analytics_events_path_idx on analytics_events(path);
create index if not exists analytics_events_exam_idx on analytics_events(exam_id);

alter table analytics_sessions enable row level security;
alter table analytics_events enable row level security;
