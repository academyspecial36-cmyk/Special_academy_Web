-- Add JSONB config for dynamic landing content, feature flags, etc.
alter table settings add column if not exists config jsonb default '{}'::jsonb;
alter table settings add column if not exists maintenance_mode boolean default false;
