-- =====================================================
-- UPDATE — Run after migration.sql
-- Adds: students table, seed data for all tables,
--        fixes exam_answers policy typo
-- =====================================================

-- ─── Fix: exam_answers policy had 'with select' (invalid) ───
drop policy if exists "Students can create answers" on exam_answers;

create policy "Students can create answers"
  on exam_answers for insert with check (
    exists (
      select 1 from exam_attempts
      where exam_attempts.id = attempt_id
      and exam_attempts.student_id = auth.uid()
    )
  );

-- ─── Students table ───
create table if not exists students (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text,
  phone text,
  class text,
  enrolled_courses jsonb default '[]',
  join_date date default current_date,
  status text default 'active' check (status in ('active', 'inactive')),
  created_at timestamptz default now()
);

alter table students enable row level security;

create policy "Admins can read students"
  on students for select using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

create policy "Admins can manage students"
  on students for all using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

-- ─── Seed: Testimonials ───
insert into testimonials (name, role, content, rating, image, achievement, class) values
  ('Aarav Thapa', 'student', 'Special academy transformed my life. The disciplined environment and expert guidance helped me secure a seat at Sainik Awasiya Mahavidyalaya. The mock tests were incredibly helpful.', 5, 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80', 'Secured 3rd rank in SAMA 2080', 'Class 10'),
  ('Maya Sharma', 'parent', 'I was looking for a place that would not only prepare my child academically but also build character. Special academy exceeded our expectations. My son''s confidence has grown tremendously.', 5, 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&q=80', null, null),
  ('Sujan KC', 'cadet', 'Currently serving as a cadet at Birendra Sainik Awasiya Mahavidyalaya. The training I received at Special academy was the foundation of my success.', 5, 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&q=80', 'Currently at BSAM', 'Class 10'),
  ('Priya Khanal', 'student', 'The scholarship preparation program was outstanding. I received a full scholarship to one of the top colleges. The faculty here genuinely cares about each student.', 4, 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&q=80', 'Full Scholarship Winner', 'Class 12'),
  ('Rajesh Hamal', 'parent', 'The academy focuses equally on physical fitness, academics, and moral values. A perfect place for holistic development. My daughter has become more disciplined and focused.', 5, 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&q=80', null, null),
  ('Anita Gurung', 'student', 'I joined the leadership program and it was an eye-opening experience. The workshops and practical exercises taught me skills I use every day. Highly recommend!', 5, 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=80', 'Leadership Award 2080', 'Class 11')
on conflict (id) do nothing;

-- ─── Seed: Enrollments ───
insert into enrollments (full_name, email, phone, current_class, interested_course, guardian_name, guardian_contact, address, previous_school, message, status) values
  ('Ramesh Adhikari', 'ramesh@example.com', '9841234567', 'Class 10', 'Cadet College Preparation', 'Hari Adhikari', '9847654321', 'Kathmandu', 'Valley Public School', 'Interested in the cadet program for my son.', 'pending'),
  ('Sita Poudel', 'sita@example.com', '9861234567', 'Class 12', 'Scholarship Exam Preparation', 'Gopal Poudel', '9867654321', 'Pokhara', 'Gandaki Boarding School', 'Looking for scholarship guidance.', 'pending'),
  ('Binod Shah', 'binod@example.com', '9851234567', 'Class 9', 'Foundation Course', 'Mina Shah', '9857654321', 'Lalitpur', 'Everest English School', 'Want to build a strong foundation.', 'pending')
on conflict (id) do nothing;

-- ─── Seed: Students ───
insert into students (name, email, phone, class, enrolled_courses, join_date, status) values
  ('Arafat Hossain', 'arafat@example.com', '01711111111', 'Class 12', '["Cadet Entrance Preparation", "Scholarship Preparation"]', '2025-09-01', 'active'),
  ('Tasnim Rahman', 'tasnim@example.com', '01722222222', 'Class 10', '["Cadet Entrance Preparation"]', '2025-09-01', 'active'),
  ('Sadia Islam', 'sadia@example.com', '01733333333', 'Class 11', '["Leadership Development", "Spoken English"]', '2025-09-15', 'active'),
  ('Rafiq Ahmed', 'rafiq@example.com', '01744444444', 'Class 12', '["Scholarship Preparation", "Foundation Classes"]', '2025-08-15', 'active'),
  ('Nusrat Jahan', 'nusrat@example.com', '01755555555', 'Class 10', '["Cadet Entrance Preparation"]', '2025-10-01', 'inactive')
on conflict (id) do nothing;

-- ─── Seed: Exam Attempts ───
insert into exam_attempts (category_id, student_name, score, total, completed_at) values
  ((select id from exam_categories where name = 'General Knowledge'), 'Arafat Hossain', 8, 10, now() - interval '2 days'),
  ((select id from exam_categories where name = 'Mathematics'), 'Arafat Hossain', 7, 10, now() - interval '1 day'),
  ((select id from exam_categories where name = 'General Knowledge'), 'Tasnim Rahman', 9, 10, now() - interval '3 days'),
  ((select id from exam_categories where name = 'English'), 'Sadia Islam', 6, 10, now() - interval '5 days')
on conflict (id) do nothing;

-- ─── Seed: Exam Answers ───
insert into exam_answers (attempt_id, question_id, answer, correct)
select
  (select ea.id from exam_attempts ea where ea.student_name = 'Arafat Hossain' order by ea.completed_at desc limit 1 offset 0),
  (select q.id from questions q where q.category_id = (select ec.id from exam_categories ec where ec.name = 'General Knowledge') limit 1 offset 0),
  'Kathmandu', true
where exists (select 1 from exam_attempts where student_name = 'Arafat Hossain');

insert into exam_answers (attempt_id, question_id, answer, correct)
select
  (select ea.id from exam_attempts ea where ea.student_name = 'Arafat Hossain' order by ea.completed_at desc limit 1 offset 0),
  (select q.id from questions q where q.category_id = (select ec.id from exam_categories ec where ec.name = 'General Knowledge') limit 1 offset 1),
  'Mars', true
where exists (select 1 from exam_attempts where student_name = 'Arafat Hossain');

-- ─── Seed: Progress ───
insert into progress (student_id, item_id, completed_at)
select
  (select id from profiles where role = 'student' limit 1),
  (select id from items limit 1 offset 0),
  now() - interval '1 day'
where exists (select 1 from profiles where role = 'student');

insert into progress (student_id, item_id, completed_at)
select
  (select id from profiles where role = 'student' limit 1),
  (select id from items limit 1 offset 1),
  now() - interval '2 days'
where exists (select 1 from profiles where role = 'student');
