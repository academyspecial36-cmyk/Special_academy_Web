-- =====================================================
-- SPECIAL ACADEMY - Full Database Schema
-- Run this in Supabase SQL Editor
-- =====================================================

-- 0. Extensions
create extension if not exists "uuid-ossp";

-- 1. Profiles (extends auth.users)
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  role text not null check (role in ('admin', 'student')) default 'student',
  email text,
  phone text,
  avatar_url text,
  created_at timestamptz default now()
);

alter table profiles enable row level security;

create policy "Users can read own profile"
  on profiles for select using (auth.uid() = id);

create policy "Users can update own profile"
  on profiles for update using (auth.uid() = id);

-- 2. Settings
create table settings (
  id uuid primary key default gen_random_uuid(),
  academy_name text default 'Special academy',
  tagline text default '',
  description text default '',
  address text default '',
  email text default '',
  admission_email text default '',
  phone text default '',
  secondary_phone text default '',
  website text default '',
  office_hours text default '',
  holiday text default '',
  app_icon text default '',
  social_links jsonb default '{"facebook":"","instagram":"","tiktok":"","youtube":""}',
  created_at timestamptz default now()
);

alter table settings enable row level security;

create policy "Everyone can read settings"
  on settings for select using (true);

create policy "Admins can update settings"
  on settings for update using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

-- 3. Course Categories
create table course_categories (
  id uuid primary key default gen_random_uuid(),
  name text unique not null,
  created_at timestamptz default now()
);

alter table course_categories enable row level security;

create policy "Everyone can read course categories"
  on course_categories for select using (true);

create policy "Admins can manage course categories"
  on course_categories for all using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

-- 4. Notice Categories
create table notice_categories (
  id uuid primary key default gen_random_uuid(),
  value text unique not null,
  label text not null,
  color text not null,
  created_at timestamptz default now()
);

alter table notice_categories enable row level security;

create policy "Everyone can read notice categories"
  on notice_categories for select using (true);

create policy "Admins can manage notice categories"
  on notice_categories for all using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

-- 5. Courses
create table courses (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text unique not null,
  description text,
  duration text,
  qualification text,
  features jsonb default '[]',
  image text,
  category text,
  price text,
  is_popular boolean default false,
  created_at timestamptz default now()
);

alter table courses enable row level security;

create policy "Everyone can read courses"
  on courses for select using (true);

create policy "Admins can manage courses"
  on courses for all using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

-- 6. Subcategories
create table subcategories (
  id uuid primary key default gen_random_uuid(),
  course_id uuid references courses(id) on delete cascade,
  title text not null,
  thumbnail text,
  short_description text,
  status text check (status in ('paid', 'free')) default 'free',
  hidden boolean default false,
  created_at timestamptz default now()
);

alter table subcategories enable row level security;

create policy "Everyone can read subcategories"
  on subcategories for select using (true);

create policy "Admins can manage subcategories"
  on subcategories for all using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

-- 7. Items
create table items (
  id uuid primary key default gen_random_uuid(),
  subcategory_id uuid references subcategories(id) on delete cascade,
  type text check (type in ('video', 'pdf')) not null,
  title text not null,
  description text,
  url text not null,
  duration text,
  status text check (status in ('paid', 'free')) default 'free',
  hidden boolean default false,
  created_at timestamptz default now()
);

alter table items enable row level security;

create policy "Everyone can read items"
  on items for select using (true);

create policy "Admins can manage items"
  on items for all using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

-- 8. FAQs
create table faqs (
  id uuid primary key default gen_random_uuid(),
  question text not null,
  answer text not null,
  sort_order integer default 0,
  created_at timestamptz default now()
);

alter table faqs enable row level security;

create policy "Everyone can read faqs"
  on faqs for select using (true);

create policy "Admins can manage faqs"
  on faqs for all using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

-- 9. Faculty Members
create table faculty_members (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  role text,
  qualification text,
  experience text,
  image text,
  subjects jsonb default '[]',
  created_at timestamptz default now()
);

alter table faculty_members enable row level security;

create policy "Everyone can read faculty_members"
  on faculty_members for select using (true);

create policy "Admins can manage faculty_members"
  on faculty_members for all using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

-- 10. Notices
create table notices (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  content text not null,
  category text,
  is_pinned boolean default false,
  author text,
  date date default current_date,
  created_at timestamptz default now()
);

alter table notices enable row level security;

create policy "Everyone can read notices"
  on notices for select using (true);

create policy "Admins can manage notices"
  on notices for all using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

-- 11. Testimonials
create table testimonials (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  role text check (role in ('student', 'parent', 'cadet')),
  content text not null,
  rating integer check (rating >= 1 and rating <= 5) default 5,
  image text,
  achievement text,
  class text,
  created_at timestamptz default now()
);

alter table testimonials enable row level security;

create policy "Everyone can read testimonials"
  on testimonials for select using (true);

create policy "Admins can manage testimonials"
  on testimonials for all using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

-- 12. Gallery Images
create table gallery_images (
  id uuid primary key default gen_random_uuid(),
  src text not null,
  alt text,
  category text,
  created_at timestamptz default now()
);

alter table gallery_images enable row level security;

create policy "Everyone can read gallery_images"
  on gallery_images for select using (true);

create policy "Admins can manage gallery_images"
  on gallery_images for all using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

-- 13. Enrollments
create table enrollments (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text not null,
  phone text,
  current_class text,
  interested_course text,
  guardian_name text,
  guardian_contact text,
  address text,
  previous_school text,
  message text,
  status text default 'pending',
  created_at timestamptz default now()
);

alter table enrollments enable row level security;

create policy "Anyone can create enrollments"
  on enrollments for insert with check (true);

create policy "Admins can read enrollments"
  on enrollments for select using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

create policy "Admins can manage enrollments"
  on enrollments for all using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

-- 14. Exam Categories
create table exam_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  color text default 'bg-blue-100 text-blue-800',
  created_at timestamptz default now()
);

alter table exam_categories enable row level security;

create policy "Everyone can read exam_categories"
  on exam_categories for select using (true);

create policy "Admins can manage exam_categories"
  on exam_categories for all using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

-- 15. Questions
create table questions (
  id uuid primary key default gen_random_uuid(),
  category_id uuid references exam_categories(id) on delete cascade,
  type text check (type in ('mcq', 'subjective')) not null,
  question text not null,
  options jsonb default '[]',
  answer text not null,
  explanation text,
  created_at timestamptz default now()
);

alter table questions enable row level security;

create policy "Everyone can read questions"
  on questions for select using (true);

create policy "Admins can manage questions"
  on questions for all using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

-- 16. Exam Attempts
create table exam_attempts (
  id uuid primary key default gen_random_uuid(),
  category_id uuid references exam_categories(id) on delete cascade,
  student_id uuid references profiles(id),
  student_name text not null,
  score integer default 0,
  total integer default 0,
  completed_at timestamptz default now()
);

alter table exam_attempts enable row level security;

create policy "Students can read own attempts"
  on exam_attempts for select using (
    auth.uid() = student_id or
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

create policy "Students can create attempts"
  on exam_attempts for insert with check (auth.uid() = student_id);

-- 17. Exam Answers
create table exam_answers (
  id uuid primary key default gen_random_uuid(),
  attempt_id uuid references exam_attempts(id) on delete cascade,
  question_id uuid references questions(id),
  answer text,
  correct boolean default false
);

alter table exam_answers enable row level security;

create policy "Students can read own answers"
  on exam_answers for select using (
    exists (
      select 1 from exam_attempts
      where exam_attempts.id = attempt_id
      and (exam_attempts.student_id = auth.uid() or
        exists (select 1 from profiles where id = auth.uid() and role = 'admin'))
    )
  );

create policy "Students can create answers"
  on exam_answers for insert with select (
    exists (
      select 1 from exam_attempts
      where exam_attempts.id = attempt_id
      and exam_attempts.student_id = auth.uid()
    )
  );

-- 18. Progress (completed items)
create table progress (
  id uuid primary key default gen_random_uuid(),
  student_id uuid references profiles(id) on delete cascade,
  item_id uuid references items(id) on delete cascade,
  completed_at timestamptz default now(),
  unique(student_id, item_id)
);

alter table progress enable row level security;

create policy "Students can read own progress"
  on progress for select using (auth.uid() = student_id);

create policy "Students can manage own progress"
  on progress for all using (auth.uid() = student_id);

-- 19. Storage buckets (run in Supabase dashboard Storage section)
-- Create buckets: 'images', 'pdfs'
-- Set public access for 'images' bucket
-- Set restricted access for 'pdfs' bucket

-- 20. Admin user setup — run THIS BLOCK AFTER setting up auth
-- Step 1: Create user via Supabase Dashboard → Authentication → Users → Add User
--         Email: admin@cadetacademy.edu, Password: (choose a strong one)
-- Step 2: Find the new user's ID from auth.users, then run:
--
--   update profiles
--   set role = 'admin'
--   where id = '<uuid-from-auth-users>';
--
-- If you don't know the ID, use this to find it:
--   select id, email from auth.users where email = 'admin@cadetacademy.edu';

-- =====================================================
-- SEED DATA
-- =====================================================

-- Settings
insert into settings (academy_name, tagline, description, address, email, admission_email, phone, secondary_phone, website, office_hours, holiday, app_icon, social_links)
values (
  'Special academy',
  'Preparing Future Leaders Through Discipline & Excellence',
  'Nepal''s premier cadet preparation academy since 2010.',
  'M8RP+363 New baneshwor, Devkota Sadak, Kathmandu 44600',
  'info@cadetacademy.edu',
  'admission@cadetacademy.edu',
  '986-0302036',
  '986-0302036',
  'https://cadetacademy.edu',
  'Sun–Thu: 9:00 AM – 5:00 PM',
  'Friday & Public Holidays',
  '/icon-image.png',
  '{"facebook":"https://facebook.com/specialacademy","instagram":"https://instagram.com/specialacademy","tiktok":"https://tiktok.com/@specialacademy","youtube":"https://youtube.com/@specialacademy"}'
);

-- Course Categories
insert into course_categories (name) values
  ('Cadet Preparation'), ('Scholarship'), ('Foundation'), ('Leadership'), ('Language'), ('Physical');

-- Notice Categories
insert into notice_categories (value, label, color) values
  ('admission', 'Admission', 'bg-emerald-100 text-emerald-800'),
  ('exam', 'Exam', 'bg-amber-100 text-amber-800'),
  ('holiday', 'Holiday', 'bg-sky-100 text-sky-800'),
  ('event', 'Event', 'bg-violet-100 text-violet-800'),
  ('announcement', 'Announcement', 'bg-slate-100 text-slate-800');

-- Courses (using UUIDs from mock data mapping)
-- We use fixed IDs to match the mock data references
INSERT INTO courses (id, title, slug, description, duration, qualification, features, image, category, price, is_popular)
VALUES
  ('c0000000-0000-0000-0000-000000000001', 'Cadet College Preparation', 'cadet-college-preparation', 'Comprehensive preparation program for cadet college entrance exams including mathematics, English, GK, and IQ tests.', '6 Months', 'Class 8-12', '["Expert faculty with military background","Weekly mock tests","Physical fitness training","Personality development sessions","Study materials included","Previous year papers"]', 'https://images.unsplash.com/photo-1526470608268-f674ce90ebd4?w=400&q=80', 'Cadet Preparation', 'Rs. 25,000', true),
  ('c0000000-0000-0000-0000-000000000002', 'Scholarship Exam Preparation', 'scholarship-exam-preparation', 'Intensive coaching for scholarship examinations with advanced curriculum and personalized attention.', '4 Months', 'Class 8-12', '["Advanced curriculum","Personalized mentoring","Scholarship application guidance","Interview preparation","Previous year papers","Weekly assessments"]', 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=400&q=80', 'Scholarship', 'Rs. 20,000', true),
  ('c0000000-0000-0000-0000-000000000003', 'Foundation Course', 'foundation-course', 'Build a strong academic foundation with our comprehensive foundation course covering core subjects.', '12 Months', 'Class 8-9', '["Strong fundamentals","Regular assessments","Doubt clearing sessions","Progress tracking","Study materials","Parent-teacher meetings"]', 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=400&q=80', 'Foundation', 'Rs. 18,000', false);

-- Subcategories
INSERT INTO subcategories (id, course_id, title, thumbnail, short_description, status, hidden)
VALUES
  ('s1000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'General Knowledge', 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=200&q=80', 'Comprehensive GK covering history, geography, science and current affairs.', 'free', false),
  ('s1000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000001', 'English Language', 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=200&q=80', 'Grammar, vocabulary, comprehension and essay writing skills.', 'free', false),
  ('s1000000-0000-0000-0000-000000000003', 'c0000000-0000-0000-0000-000000000001', 'Mathematics', 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=200&q=80', 'Arithmetic, algebra, geometry and data interpretation.', 'paid', false),
  ('s1000000-0000-0000-0000-000000000004', 'c0000000-0000-0000-0000-000000000001', 'Intelligence (IQ)', 'https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=200&q=80', 'Logical reasoning, pattern recognition and mental ability.', 'free', false),
  ('s1000000-0000-0000-0000-000000000005', 'c0000000-0000-0000-0000-000000000002', 'Advanced Mathematics', 'https://images.unsplash.com/photo-1509228627152-72ae9ae6848d?w=200&q=80', 'Advanced topics for scholarship exams.', 'free', false),
  ('s1000000-0000-0000-0000-000000000006', 'c0000000-0000-0000-0000-000000000002', 'English Literature', 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=200&q=80', 'Literary analysis and advanced comprehension.', 'free', false),
  ('s1000000-0000-0000-0000-000000000007', 'c0000000-0000-0000-0000-000000000003', 'Science Fundamentals', 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=200&q=80', 'Physics, chemistry and biology fundamentals.', 'free', false);

-- Items
INSERT INTO items (id, subcategory_id, type, title, description, url, duration, status, hidden)
VALUES
  ('i1000000-0000-0000-0000-000000000001', 's1000000-0000-0000-0000-000000000001', 'video', 'GK - Introduction to World Geography', 'Overview of continents and oceans.', 'https://www.youtube.com/embed/dQw4w9WgXcQ', '12:30', 'free', false),
  ('i1000000-0000-0000-0000-000000000002', 's1000000-0000-0000-0000-000000000001', 'pdf', 'GK Study Notes - Chapter 1', 'Complete study notes with diagrams.', 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', NULL, 'paid', false),
  ('i1000000-0000-0000-0000-000000000003', 's1000000-0000-0000-0000-000000000001', 'video', 'Current Affairs - Monthly Review', 'Important current events summarized.', 'https://www.youtube.com/embed/dQw4w9WgXcQ', '18:45', 'free', false),
  ('i1000000-0000-0000-0000-000000000004', 's1000000-0000-0000-0000-000000000002', 'video', 'English Grammar - Tenses', 'Complete guide to English tenses.', 'https://www.youtube.com/embed/dQw4w9WgXcQ', '15:20', 'free', false),
  ('i1000000-0000-0000-0000-000000000005', 's1000000-0000-0000-0000-000000000002', 'pdf', 'Vocabulary Builder - 500 Words', 'Essential vocabulary for cadet exams.', 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', NULL, 'free', false),
  ('i1000000-0000-0000-0000-000000000006', 's1000000-0000-0000-0000-000000000003', 'video', 'Algebra Basics', 'Linear equations and quadratic formulas.', 'https://www.youtube.com/embed/dQw4w9WgXcQ', '22:10', 'paid', false),
  ('i1000000-0000-0000-0000-000000000007', 's1000000-0000-0000-0000-000000000003', 'pdf', 'Math Formula Sheet', 'All important formulas in one place.', 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', NULL, 'paid', false),
  ('i1000000-0000-0000-0000-000000000008', 's1000000-0000-0000-0000-000000000004', 'video', 'IQ Test Strategies', 'Tips and tricks for IQ tests.', 'https://www.youtube.com/embed/dQw4w9WgXcQ', '10:15', 'free', false),
  ('i1000000-0000-0000-0000-000000000009', 's1000000-0000-0000-0000-000000000005', 'video', 'Number Systems', 'Understanding number theory.', 'https://www.youtube.com/embed/dQw4w9WgXcQ', '14:30', 'free', false),
  ('i1000000-0000-0000-0000-000000000010', 's1000000-0000-0000-0000-000000000005', 'pdf', 'Practice Problems Set 1', '100 practice problems with solutions.', 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', NULL, 'paid', false),
  ('i1000000-0000-0000-0000-000000000011', 's1000000-0000-0000-0000-000000000006', 'video', 'Poetry Analysis', 'How to analyze poems effectively.', 'https://www.youtube.com/embed/dQw4w9WgXcQ', '20:00', 'free', false),
  ('i1000000-0000-0000-0000-000000000012', 's1000000-0000-0000-0000-000000000007', 'video', 'Introduction to Physics', 'Basic concepts of motion and force.', 'https://www.youtube.com/embed/dQw4w9WgXcQ', '16:40', 'free', false),
  ('i1000000-0000-0000-0000-000000000013', 's1000000-0000-0000-0000-000000000007', 'pdf', 'Science Lab Manual', 'Lab experiments and procedures.', 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', NULL, 'free', false);

-- FAQs
INSERT INTO faqs (question, answer, sort_order) VALUES
  ('What is the admission process?', 'The admission process involves submitting an application form, appearing for an entrance test, and attending a personal interview. Selected candidates are notified within a week.', 1),
  ('What are the eligibility criteria?', 'Students from Class 8 to 12 are eligible to apply. They should have a minimum of 60% in their previous academic year and a strong desire to pursue a career in the armed forces.', 2),
  ('How long is the course duration?', 'Our flagship cadet preparation program runs for 6 months. However, we also offer 4-month and 12-month programs based on student requirements and exam schedules.', 3),
  ('What is the fee structure?', 'Our fee structure varies by program. The cadet college preparation course is Rs. 25,000, scholarship preparation is Rs. 20,000, and the foundation course is Rs. 18,000. Installment options are available.', 4),
  ('Do you provide hostel facilities?', 'Yes, we provide hostel facilities for out-of-town students. Our hostel is equipped with all modern amenities and is supervised by experienced wardens.', 5),
  ('What makes Special academy different?', 'We have expert faculty with military backgrounds, a proven track record of success, comprehensive study materials, regular mock tests, and personalized attention to each student.', 6);

-- Faculty Members
INSERT INTO faculty_members (name, role, qualification, experience, image, subjects) VALUES
  ('Col. (Retd.) Rajesh Khadka', 'Chief Mentor', 'MBA, MA in Strategic Studies', '25+ years in military education', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80', '["Leadership","Military Strategy","Personality Development"]'),
  ('Dr. Sunita Sharma', 'Senior Faculty - Mathematics', 'Ph.D. in Mathematics', '15+ years teaching experience', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=80', '["Algebra","Geometry","Calculus","Statistics"]'),
  ('Mr. Krishna Prasai', 'Faculty - English', 'MA in English Literature', '12+ years teaching experience', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&q=80', '["Grammar","Literature","Comprehension","Essay Writing"]'),
  ('Capt. (Retd.) Anil Gurung', 'Physical Training Instructor', 'B.P. Ed, Diploma in Sports Science', '20+ years in military training', 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=200&q=80', '["Physical Training","Drill","Adventure Sports","Swimming"]'),
  ('Mrs. Sita Basnet', 'Faculty - General Knowledge', 'MA in History, B.Ed.', '10+ years teaching experience', 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&q=80', '["History","Geography","Current Affairs","Civics"]');

-- Notices
INSERT INTO notices (title, content, category, is_pinned, author, date) VALUES
  ('Admission Open for 2026 Batch', 'We are pleased to announce that admissions for the 2026 batch are now open. Interested students can collect application forms from the academy office or download from our website. The last date for application submission is March 15, 2026.', 'admission', true, 'Admin', '2026-01-01'),
  ('Mock Test Schedule - January 2026', 'The mock test schedule for January has been released. Tests will be held every Saturday starting January 11. Please check the notice board for your roll number and venue.', 'exam', false, 'Exam Dept.', '2026-01-05'),
  ('Winter Break Announcement', 'The academy will remain closed for winter break from January 25 to February 2. Regular classes will resume on February 3, 2026.', 'holiday', false, 'Admin', '2026-01-10'),
  ('Parent-Teacher Meeting', 'The biannual parent-teacher meeting has been scheduled for January 20, 2026 at 10:00 AM in the academy auditorium. All parents are requested to attend.', 'event', false, 'Admin', '2026-01-08'),
  ('Leadership Workshop Registration', 'A 2-day leadership workshop will be conducted by Col. Khadka from January 28-29. Interested students can register at the admin office. Limited seats available.', 'event', false, 'Training Dept.', '2026-01-12'),
  ('Scholarship Test Results', 'The results for the scholarship aptitude test conducted on December 28 have been published. Selected candidates will be contacted individually for the next round.', 'exam', false, 'Exam Dept.', '2026-01-03');

-- Gallery Images
INSERT INTO gallery_images (src, alt, category) VALUES
  ('https://images.unsplash.com/photo-1526470608268-f674ce90ebd4?w=400&q=80', 'Cadet in uniform', 'Training'),
  ('https://images.unsplash.com/photo-1523050854058-8df90110c7f1?w=400&q=80', 'Students in classroom', 'Academic'),
  ('https://images.unsplash.com/photo-1577896851231-70acf3a0ccb1?w=400&q=80', 'Physical training session', 'Sports'),
  ('https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400&q=80', 'Leadership workshop', 'Events'),
  ('https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=400&q=80', 'Computer lab', 'Facilities'),
  ('https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=400&q=80', 'Group discussion', 'Academic');

-- Exam Categories
INSERT INTO exam_categories (id, name, description, color) VALUES
  ('ec0000000-0000-0000-0000-000000000001', 'General Knowledge', 'Test your knowledge of history, geography, science and current affairs.', 'bg-emerald-100 text-emerald-800'),
  ('ec0000000-0000-0000-0000-000000000002', 'Mathematics', 'Arithmetic, algebra, geometry and data interpretation.', 'bg-blue-100 text-blue-800'),
  ('ec0000000-0000-0000-0000-000000000003', 'English', 'Grammar, vocabulary, comprehension and writing skills.', 'bg-amber-100 text-amber-800');

-- Questions
INSERT INTO questions (id, category_id, type, question, options, answer, explanation) VALUES
  ('q0000000-0000-0000-0000-000000000001', 'ec0000000-0000-0000-0000-000000000001', 'mcq', 'What is the capital of Nepal?', '["Kathmandu","Pokhara","Lalitpur","Bhaktapur"]', 'Kathmandu', 'Kathmandu is the capital and largest city of Nepal.'),
  ('q0000000-0000-0000-0000-000000000002', 'ec0000000-0000-0000-0000-000000000001', 'mcq', 'Which planet is known as the Red Planet?', '["Venus","Mars","Jupiter","Saturn"]', 'Mars', 'Mars appears reddish due to iron oxide on its surface.'),
  ('q0000000-0000-0000-0000-000000000003', 'ec0000000-0000-0000-0000-000000000001', 'subjective', 'Explain the importance of discipline in a cadet''s life.', '[]', 'Discipline is crucial for cadets as it builds character, instills punctuality, and develops leadership qualities necessary for military service.', 'Discipline forms the foundation of cadet training.'),
  ('q0000000-0000-0000-0000-000000000004', 'ec0000000-0000-0000-0000-000000000002', 'mcq', 'What is 15% of 200?', '["25","30","35","40"]', '30', '15% of 200 = (15/100) × 200 = 30.'),
  ('q0000000-0000-0000-0000-000000000005', 'ec0000000-0000-0000-0000-000000000002', 'mcq', 'What is the square root of 144?', '["10","11","12","13"]', '12', '12 × 12 = 144.'),
  ('q0000000-0000-0000-0000-000000000006', 'ec0000000-0000-0000-0000-000000000002', 'subjective', 'Solve: 5x + 3 = 18. Find x.', '[]', 'x = 3', '5x + 3 = 18 → 5x = 15 → x = 3.'),
  ('q0000000-0000-0000-0000-000000000007', 'ec0000000-0000-0000-0000-000000000003', 'mcq', 'What is the synonym of ''Brave''?', '["Cowardly","Courageous","Timid","Weak"]', 'Courageous', 'Brave and courageous are synonyms.'),
  ('q0000000-0000-0000-0000-000000000008', 'ec0000000-0000-0000-0000-000000000003', 'mcq', 'Which of the following is a noun?', '["Run","Beautiful","Happiness","Quickly"]', 'Happiness', 'Happiness is a noun representing a state of being.'),
  ('q0000000-0000-0000-0000-000000000009', 'ec0000000-0000-0000-0000-000000000003', 'subjective', 'Write a short paragraph about your aspirations to join the cadet academy.', '[]', 'Model answer: I aspire to join the cadet academy to develop leadership skills, build character, and serve my nation with honor and discipline.', 'Answers should reflect genuine motivation and understanding of cadet life.');
