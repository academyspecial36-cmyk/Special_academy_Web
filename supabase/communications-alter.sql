-- Add category and config columns to existing communication_templates table
-- These were defined in communications-migration.sql but the table already existed

alter table communication_templates
  add column if not exists category text default 'custom',
  add column if not exists config jsonb default '{}';
