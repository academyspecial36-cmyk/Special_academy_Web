-- Blog Posts table
create table blog_posts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null,
  content text not null default '',
  excerpt text,
  author text,
  image text,
  status text not null default 'draft' check (status in ('draft', 'published')),
  tags jsonb default '[]'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  published_at timestamptz
);

alter table blog_posts enable row level security;

create policy "Anyone can read published posts"
  on blog_posts for select
  using (status = 'published');

create policy "Admins can manage all posts"
  on blog_posts for all
  using (auth.uid() in (
    select id from profiles where role = 'admin'
  ));

-- Add enable_blog column to settings
alter table settings add column if not exists enable_blog boolean default true;
