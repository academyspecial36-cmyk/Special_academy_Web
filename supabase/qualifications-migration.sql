-- 1. Create qualifications table
create table if not exists public.qualifications (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  sort_order int default 0,
  created_at timestamptz default now()
);

-- Safely seed defaults (skip rows that already exist)
insert into public.qualifications (name, sort_order)
select name, sort_order from (values
  ('Class 8', 1), ('Class 9', 2), ('Class 10', 3), ('Class 11', 4),
  ('Class 12', 5), ('+2', 6), ('Bachelor', 7), ('Master', 8)
) as v(name, sort_order)
where not exists (select 1 from public.qualifications);

-- Enable RLS
alter table public.qualifications enable row level security;

-- Policies: public read, authenticated manage
create policy "Qualifications are publicly readable"
  on public.qualifications for select
  using (true);

create policy "Qualifications are manageable by authenticated users"
  on public.qualifications for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- 2. Drop old columns, add qualification_id FK to enrollments, migrate data
alter table public.enrollments
  add column qualification_id uuid references public.qualifications(id);

update public.enrollments e
  set qualification_id = q.id
  from public.qualifications q
  where e.current_class = q.name;

alter table public.enrollments
  drop column current_class,
  drop column previous_school;

-- 3. Backfill students.class for existing records (match by email)
update public.students s
  set class = q.name
  from public.enrollments e
  join public.qualifications q on e.qualification_id = q.id
  where e.email = s.email
    and (s.class is null or s.class = '');
