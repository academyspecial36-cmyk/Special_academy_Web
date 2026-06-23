-- Admin Row-Level Security Policies
-- Run this in the Supabase SQL Editor after the existing migration.sql

-- ============================================
-- Helper: check if the current user is an admin
-- ============================================
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid()
      and role = 'admin'
  );
$$;

-- ============================================
-- Profiles: admins can read/update all rows
-- ============================================
drop policy if exists "Admins can read all profiles" on profiles;
create policy "Admins can read all profiles"
  on profiles for select
  using (public.is_admin() or auth.uid() = id);

drop policy if exists "Admins can update all profiles" on profiles;
create policy "Admins can update all profiles"
  on profiles for update
  using (public.is_admin() or auth.uid() = id);

drop policy if exists "Admins can insert profiles" on profiles;
create policy "Admins can insert profiles"
  on profiles for insert
  with check (public.is_admin());

drop policy if exists "Admins can delete profiles" on profiles;
create policy "Admins can delete profiles"
  on profiles for delete
  using (public.is_admin());

-- ============================================
-- Settings: admins full access, students read-only
-- ============================================
drop policy if exists "Admins can manage settings" on settings;
create policy "Admins can manage settings"
  on settings for all
  using (public.is_admin());

drop policy if exists "Everyone can read settings" on settings;
create policy "Everyone can read settings"
  on settings for select
  using (true);

-- ============================================
-- Exam Categories: admins full access, students read-only
-- ============================================
drop policy if exists "Admins can manage exam categories" on exam_categories;
create policy "Admins can manage exam categories"
  on exam_categories for all
  using (public.is_admin());

drop policy if exists "Everyone can read exam categories" on exam_categories;
create policy "Everyone can read exam categories"
  on exam_categories for select
  using (true);

-- ============================================
-- Exam Subcategories: admins full access, students read-only
-- ============================================
drop policy if exists "Admins can manage exam subcategories" on exam_subcategories;
create policy "Admins can manage exam subcategories"
  on exam_subcategories for all
  using (public.is_admin());

drop policy if exists "Everyone can read exam subcategories" on exam_subcategories;
create policy "Everyone can read exam subcategories"
  on exam_subcategories for select
  using (true);

-- ============================================
-- Questions: admins full access, students read-only
-- ============================================
drop policy if exists "Admins can manage questions" on questions;
create policy "Admins can manage questions"
  on questions for all
  using (public.is_admin());

drop policy if exists "Everyone can read questions" on questions;
create policy "Everyone can read questions"
  on questions for select
  using (true);

-- ============================================
-- Exam Attempts: admins can read all, students read own
-- ============================================
drop policy if exists "Admins can read all attempts" on exam_attempts;
create policy "Admins can read all attempts"
  on exam_attempts for select
  using (public.is_admin() or auth.uid() = student_id);

drop policy if exists "Students can insert own attempts" on exam_attempts;
create policy "Students can insert own attempts"
  on exam_attempts for insert
  with check (auth.uid() = student_id);

-- ============================================
-- Media: admins full access, users can read own
-- ============================================
drop policy if exists "Admins can manage media" on media;
create policy "Admins can manage media"
  on media for all
  using (public.is_admin());

drop policy if exists "Users can read own media" on media;
create policy "Users can read own media"
  on media for select
  using (auth.uid() = uploaded_by);

-- ============================================
-- Enrollments: admins full access, students read own
-- ============================================
drop policy if exists "Admins can manage enrollments" on enrollments;
create policy "Admins can manage enrollments"
  on enrollments for all
  using (public.is_admin());

drop policy if exists "Students can read own enrollment" on enrollments;
create policy "Students can read own enrollment"
  on enrollments for select
  using (auth.uid() = user_id);

-- ============================================
-- Contact Submissions: admins full access, anyone can insert
-- ============================================
drop policy if exists "Admins can manage contact submissions" on contact_submissions;
create policy "Admins can manage contact submissions"
  on contact_submissions for all
  using (public.is_admin());

drop policy if exists "Anyone can submit contact form" on contact_submissions;
create policy "Anyone can submit contact form"
  on contact_submissions for insert
  with check (true);

-- ============================================
-- Courses / Categories / Faculty / Notices / etc.
-- All public read, admin write
-- ============================================
do $$
declare
  tbl text;
  tables text[] := array[
    'courses', 'course_categories', 'notice_categories',
    'notices', 'faculty_members', 'testimonials',
    'gallery_images', 'faqs', 'subcategories', 'items',
    'qualifications', 'communications_log'
  ];
begin
  foreach tbl in array tables loop
    execute format(
      'drop policy if exists "Admins can manage %1$s" on %1$s;
       create policy "Admins can manage %1$s" on %1$s for all using (public.is_admin());
       drop policy if exists "Everyone can read %1$s" on %1$s;
       create policy "Everyone can read %1$s" on %1$s for select using (true);',
      tbl
    );
  end loop;
end;
$$;
