-- =====================================================
-- Exam Subcategories Migration
-- Adds subcategory (set) support under exam categories
-- =====================================================

-- 1. Create exam_subcategories table
create table exam_subcategories (
  id uuid primary key default gen_random_uuid(),
  category_id uuid references exam_categories(id) on delete cascade not null,
  name text not null,
  description text,
  color text default 'bg-purple-100 text-purple-800',
  created_at timestamptz default now()
);

alter table exam_subcategories enable row level security;

create policy "Everyone can read exam_subcategories"
  on exam_subcategories for select using (true);

create policy "Admins can manage exam_subcategories"
  on exam_subcategories for all using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

-- 2. Add subcategory_id to questions (nullable for backward compat)
alter table questions
  add column subcategory_id uuid references exam_subcategories(id) on delete set null;

-- 3. Add subcategory_id to exam_attempts (nullable for backward compat)
alter table exam_attempts
  add column subcategory_id uuid references exam_subcategories(id) on delete set null;

-- 4. Seed subcategories for existing exam categories
INSERT INTO exam_subcategories (id, category_id, name, description, color) VALUES
  ('esc0000000-0000-0000-0000-000000000001', 'ec0000000-0000-0000-0000-000000000001', 'GK Set 1', 'General Knowledge - Set 1 covering history, geography, and science.', 'bg-emerald-100 text-emerald-800'),
  ('esc0000000-0000-0000-0000-000000000002', 'ec0000000-0000-0000-0000-000000000001', 'GK Set 2', 'General Knowledge - Set 2 covering current affairs and civics.', 'bg-emerald-100 text-emerald-800'),
  ('esc0000000-0000-0000-0000-000000000003', 'ec0000000-0000-0000-0000-000000000002', 'Math Set 1', 'Mathematics - Set 1 covering arithmetic and algebra.', 'bg-blue-100 text-blue-800'),
  ('esc0000000-0000-0000-0000-000000000004', 'ec0000000-0000-0000-0000-000000000003', 'English Set 1', 'English - Set 1 covering grammar and vocabulary.', 'bg-amber-100 text-amber-800');

-- 5. Assign existing questions to subcategories
UPDATE questions SET subcategory_id = 'esc0000000-0000-0000-0000-000000000001'
WHERE id = 'q0000000-0000-0000-0000-000000000001';

UPDATE questions SET subcategory_id = 'esc0000000-0000-0000-0000-000000000001'
WHERE id = 'q0000000-0000-0000-0000-000000000002';

UPDATE questions SET subcategory_id = 'esc0000000-0000-0000-0000-000000000002'
WHERE id = 'q0000000-0000-0000-0000-000000000003';

UPDATE questions SET subcategory_id = 'esc0000000-0000-0000-0000-000000000003'
WHERE id = 'q0000000-0000-0000-0000-000000000004';

UPDATE questions SET subcategory_id = 'esc0000000-0000-0000-0000-000000000003'
WHERE id = 'q0000000-0000-0000-0000-000000000005';

UPDATE questions SET subcategory_id = 'esc0000000-0000-0000-0000-000000000003'
WHERE id = 'q0000000-0000-0000-0000-000000000006';

UPDATE questions SET subcategory_id = 'esc0000000-0000-0000-0000-000000000004'
WHERE id = 'q0000000-0000-0000-0000-000000000007';

UPDATE questions SET subcategory_id = 'esc0000000-0000-0000-0000-000000000004'
WHERE id = 'q0000000-0000-0000-0000-000000000008';

UPDATE questions SET subcategory_id = 'esc0000000-0000-0000-0000-000000000004'
WHERE id = 'q0000000-0000-0000-0000-000000000009';
