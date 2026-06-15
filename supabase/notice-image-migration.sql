-- Add image column to notices table
alter table notices add column if not exists image text;
