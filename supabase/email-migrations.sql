-- =====================================================
-- EMAIL FLOW MIGRATION
-- Adds columns to enrollments for the verification &
-- email-based enrollment flow.
-- =====================================================

-- Drop existing status check if any
alter table enrollments drop constraint if exists enrollments_status_check;

-- Add new columns
alter table enrollments add column if not exists auth_user_id uuid references auth.users;
alter table enrollments add column if not exists verification_code text;
alter table enrollments add column if not exists verification_sent_at timestamptz;
alter table enrollments add column if not exists verified_at timestamptz;
alter table enrollments add column if not exists rejection_message text;
alter table enrollments add column if not exists phone text;
alter table enrollments add column if not exists address text;

-- Add index for faster lookups by verification code
create index if not exists idx_enrollments_verification_code on enrollments(verification_code);

-- Add index for auth_user_id lookups
create index if not exists idx_enrollments_auth_user_id on enrollments(auth_user_id);
