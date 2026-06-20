-- Enable pg_cron extension (requires superuser, run in Supabase SQL editor)
-- CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Enable pg_net extension for HTTP requests
-- CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- Schedule weekly auto-backup: runs every Sunday at 3:00 AM
-- Replace YOUR_PROJECT_REF and YOUR_ANON_KEY with your actual values
-- The endpoint calls the Next.js API route which checks if auto-backup is enabled and due.

-- SELECT cron.schedule(
--   'weekly-auto-backup',         -- job name
--   '0 3 * * 0',                  -- every Sunday at 3:00 AM
--   $$
--     SELECT extensions.http_post(
--       url := 'https://YOUR_PROJECT_REF.supabase.co/functions/v1/cron-backup',
--       headers := '{"Content-Type": "application/json"}'::jsonb,
--       body := '{}'::jsonb
--     );
--   $$
-- );

-- Alternative: Direct HTTP call via pg_net (simpler, no Edge Function needed)
-- SELECT cron.schedule(
--   'weekly-auto-backup-http',
--   '0 3 * * 0',
--   $$
--     SELECT net.http_get(
--       url := 'https://YOUR_APP_DOMAIN/api/cron/backup'
--     );
--   $$
-- );

-- View scheduled jobs:
-- SELECT * FROM cron.job;

-- View job run details:
-- SELECT * FROM cron.job_run_details ORDER BY start_time DESC LIMIT 10;

-- Remove job if needed:
-- SELECT cron.unschedule('weekly-auto-backup');
-- SELECT cron.unschedule('weekly-auto-backup-http');
