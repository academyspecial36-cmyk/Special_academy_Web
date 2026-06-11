-- Contact Submissions table
-- Stores inquiries from the landing page contact form

create table contact_submissions (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  phone text default '',
  subject text default '',
  message text not null,
  is_read boolean default false,
  created_at timestamptz default now()
);

alter table contact_submissions enable row level security;

-- Anyone can insert (public form)
create policy "Anyone can submit contact form"
  on contact_submissions for insert
  with check (true);

-- Only admins can read/update
create policy "Admins can read submissions"
  on contact_submissions for select
  using (auth.uid() in (
    select id from profiles where role = 'admin'
  ));

create policy "Admins can update submissions"
  on contact_submissions for update
  using (auth.uid() in (
    select id from profiles where role = 'admin'
  ));

create policy "Admins can delete submissions"
  on contact_submissions for delete
  using (auth.uid() in (
    select id from profiles where role = 'admin'
  ));

-- Add contact form settings to config defaults can be added from settings page
-- Enable the contact section by default (sections.contact = true handled by seed-settings.sql)
