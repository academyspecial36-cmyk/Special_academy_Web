-- =====================================================
-- COMPREHENSIVE SEED DATA — Run once after migration
-- Clears and re-inserts all seed data safely
-- =====================================================

-- Settings (single row)
delete from settings;
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
delete from course_categories;
insert into course_categories (name) values
  ('Cadet Preparation'), ('Scholarship'), ('Foundation'), ('Leadership'), ('Language'), ('Physical');

-- Notice Categories
delete from notice_categories;
insert into notice_categories (value, label, color) values
  ('admission', 'Admission', 'bg-emerald-100 text-emerald-800'),
  ('exam', 'Exam', 'bg-amber-100 text-amber-800'),
  ('holiday', 'Holiday', 'bg-sky-100 text-sky-800'),
  ('event', 'Event', 'bg-violet-100 text-violet-800'),
  ('announcement', 'Announcement', 'bg-slate-100 text-slate-800');

-- Courses
delete from courses;
insert into courses (id, title, slug, description, duration, class_level, features, image, category, price, is_popular) values
  ('c0000000-0000-0000-0000-000000000001', 'Cadet College Preparation', 'cadet-college-preparation', 'Comprehensive preparation program for cadet college entrance exams including mathematics, English, GK, and IQ tests.', '6 Months', 'Class 8-12', '["Expert faculty with military background","Weekly mock tests","Physical fitness training","Personality development sessions","Study materials included","Previous year papers"]', 'https://images.unsplash.com/photo-1526470608268-f674ce90ebd4?w=400&q=80', 'Cadet Preparation', 'Rs. 25,000', true),
  ('c0000000-0000-0000-0000-000000000002', 'Scholarship Exam Preparation', 'scholarship-exam-preparation', 'Intensive coaching for scholarship examinations with advanced curriculum and personalized attention.', '4 Months', 'Class 8-12', '["Advanced curriculum","Personalized mentoring","Scholarship application guidance","Interview preparation","Previous year papers","Weekly assessments"]', 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=400&q=80', 'Scholarship', 'Rs. 20,000', true),
  ('c0000000-0000-0000-0000-000000000003', 'Foundation Course', 'foundation-course', 'Build a strong academic foundation with our comprehensive foundation course covering core subjects.', '12 Months', 'Class 8-9', '["Strong fundamentals","Regular assessments","Doubt clearing sessions","Progress tracking","Study materials","Parent-teacher meetings"]', 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=400&q=80', 'Foundation', 'Rs. 18,000', false);

-- Subcategories
delete from subcategories;
insert into subcategories (id, course_id, title, thumbnail, short_description, status, hidden) values
  ('a1000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'General Knowledge', 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=200&q=80', 'Comprehensive GK covering history, geography, science and current affairs.', 'free', false),
  ('a1000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000001', 'English Language', 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=200&q=80', 'Grammar, vocabulary, comprehension and essay writing skills.', 'free', false),
  ('a1000000-0000-0000-0000-000000000003', 'c0000000-0000-0000-0000-000000000001', 'Mathematics', 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=200&q=80', 'Arithmetic, algebra, geometry and data interpretation.', 'paid', false),
  ('a1000000-0000-0000-0000-000000000004', 'c0000000-0000-0000-0000-000000000001', 'Intelligence (IQ)', 'https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=200&q=80', 'Logical reasoning, pattern recognition and mental ability.', 'free', false),
  ('a1000000-0000-0000-0000-000000000005', 'c0000000-0000-0000-0000-000000000002', 'Advanced Mathematics', 'https://images.unsplash.com/photo-1509228627152-72ae9ae6848d?w=200&q=80', 'Advanced topics for scholarship exams.', 'free', false),
  ('a1000000-0000-0000-0000-000000000006', 'c0000000-0000-0000-0000-000000000002', 'English Literature', 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=200&q=80', 'Literary analysis and advanced comprehension.', 'free', false),
  ('a1000000-0000-0000-0000-000000000007', 'c0000000-0000-0000-0000-000000000003', 'Science Fundamentals', 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=200&q=80', 'Physics, chemistry and biology fundamentals.', 'free', false);

-- Items
delete from items;
insert into items (id, subcategory_id, type, title, description, url, duration, status, hidden) values
  ('b1000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', 'video', 'GK - Introduction to World Geography', 'Overview of continents and oceans.', 'https://www.youtube.com/embed/dQw4w9WgXcQ', '12:30', 'free', false),
  ('b1000000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000001', 'pdf', 'GK Study Notes - Chapter 1', 'Complete study notes with diagrams.', 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', null, 'paid', false),
  ('b1000000-0000-0000-0000-000000000003', 'a1000000-0000-0000-0000-000000000001', 'video', 'Current Affairs - Monthly Review', 'Important current events summarized.', 'https://www.youtube.com/embed/dQw4w9WgXcQ', '18:45', 'free', false),
  ('b1000000-0000-0000-0000-000000000004', 'a1000000-0000-0000-0000-000000000002', 'video', 'English Grammar - Tenses', 'Complete guide to English tenses.', 'https://www.youtube.com/embed/dQw4w9WgXcQ', '15:20', 'free', false),
  ('b1000000-0000-0000-0000-000000000005', 'a1000000-0000-0000-0000-000000000002', 'pdf', 'Vocabulary Builder - 500 Words', 'Essential vocabulary for cadet exams.', 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', null, 'free', false),
  ('b1000000-0000-0000-0000-000000000006', 'a1000000-0000-0000-0000-000000000003', 'video', 'Algebra Basics', 'Linear equations and quadratic formulas.', 'https://www.youtube.com/embed/dQw4w9WgXcQ', '22:10', 'paid', false),
  ('b1000000-0000-0000-0000-000000000007', 'a1000000-0000-0000-0000-000000000003', 'pdf', 'Math Formula Sheet', 'All important formulas in one place.', 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', null, 'paid', false),
  ('b1000000-0000-0000-0000-000000000008', 'a1000000-0000-0000-0000-000000000004', 'video', 'IQ Test Strategies', 'Tips and tricks for IQ tests.', 'https://www.youtube.com/embed/dQw4w9WgXcQ', '10:15', 'free', false),
  ('b1000000-0000-0000-0000-000000000009', 'a1000000-0000-0000-0000-000000000005', 'video', 'Number Systems', 'Understanding number theory.', 'https://www.youtube.com/embed/dQw4w9WgXcQ', '14:30', 'free', false),
  ('b1000000-0000-0000-0000-000000000010', 'a1000000-0000-0000-0000-000000000005', 'pdf', 'Practice Problems Set 1', '100 practice problems with solutions.', 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', null, 'paid', false),
  ('b1000000-0000-0000-0000-000000000011', 'a1000000-0000-0000-0000-000000000006', 'video', 'Poetry Analysis', 'How to analyze poems effectively.', 'https://www.youtube.com/embed/dQw4w9WgXcQ', '20:00', 'free', false),
  ('b1000000-0000-0000-0000-000000000012', 'a1000000-0000-0000-0000-000000000007', 'video', 'Introduction to Physics', 'Basic concepts of motion and force.', 'https://www.youtube.com/embed/dQw4w9WgXcQ', '16:40', 'free', false),
  ('b1000000-0000-0000-0000-000000000013', 'a1000000-0000-0000-0000-000000000007', 'pdf', 'Science Lab Manual', 'Lab experiments and procedures.', 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', null, 'free', false);

-- FAQs
delete from faqs;
insert into faqs (question, answer, sort_order) values
  ('What is the admission process?', 'The admission process involves submitting an application form, appearing for an entrance test, and attending a personal interview. Selected candidates are notified within a week.', 1),
  ('What are the eligibility criteria?', 'Students from Class 8 to 12 are eligible to apply. They should have a minimum of 60% in their previous academic year and a strong desire to pursue a career in the armed forces.', 2),
  ('How long is the course duration?', 'Our flagship cadet preparation program runs for 6 months. However, we also offer 4-month and 12-month programs based on student requirements and exam schedules.', 3),
  ('What is the fee structure?', 'Our fee structure varies by program. The cadet college preparation course is Rs. 25,000, scholarship preparation is Rs. 20,000, and the foundation course is Rs. 18,000. Installment options are available.', 4),
  ('Do you provide hostel facilities?', 'Yes, we provide hostel facilities for out-of-town students. Our hostel is equipped with all modern amenities and is supervised by experienced wardens.', 5),
  ('What makes Special academy different?', 'We have expert faculty with military backgrounds, a proven track record of success, comprehensive study materials, regular mock tests, and personalized attention to each student.', 6);

-- Faculty Members
delete from faculty_members;
insert into faculty_members (name, role, qualification, experience, image, subjects) values
  ('Col. (Retd.) Rajesh Khadka', 'Chief Mentor', 'MBA, MA in Strategic Studies', '25+ years in military education', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80', '["Leadership","Military Strategy","Personality Development"]'),
  ('Dr. Sunita Sharma', 'Senior Faculty - Mathematics', 'Ph.D. in Mathematics', '15+ years teaching experience', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=80', '["Algebra","Geometry","Calculus","Statistics"]'),
  ('Mr. Krishna Prasai', 'Faculty - English', 'MA in English Literature', '12+ years teaching experience', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&q=80', '["Grammar","Literature","Comprehension","Essay Writing"]'),
  ('Capt. (Retd.) Anil Gurung', 'Physical Training Instructor', 'B.P. Ed, Diploma in Sports Science', '20+ years in military training', 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=200&q=80', '["Physical Training","Drill","Adventure Sports","Swimming"]'),
  ('Mrs. Sita Basnet', 'Faculty - General Knowledge', 'MA in History, B.Ed.', '10+ years teaching experience', 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&q=80', '["History","Geography","Current Affairs","Civics"]');

-- Notices
delete from notices;
insert into notices (title, content, category, is_pinned, author, date) values
  ('Admission Open for 2026 Batch', 'We are pleased to announce that admissions for the 2026 batch are now open. Interested students can collect application forms from the academy office or download from our website. The last date for application submission is March 15, 2026.', 'admission', true, 'Admin', '2026-01-01'),
  ('Mock Test Schedule - January 2026', 'The mock test schedule for January has been released. Tests will be held every Saturday starting January 11. Please check the notice board for your roll number and venue.', 'exam', false, 'Exam Dept.', '2026-01-05'),
  ('Winter Break Announcement', 'The academy will remain closed for winter break from January 25 to February 2. Regular classes will resume on February 3, 2026.', 'holiday', false, 'Admin', '2026-01-10'),
  ('Parent-Teacher Meeting', 'The biannual parent-teacher meeting has been scheduled for January 20, 2026 at 10:00 AM in the academy auditorium. All parents are requested to attend.', 'event', false, 'Admin', '2026-01-08'),
  ('Leadership Workshop Registration', 'A 2-day leadership workshop will be conducted by Col. Khadka from January 28-29. Interested students can register at the admin office. Limited seats available.', 'event', false, 'Training Dept.', '2026-01-12'),
  ('Scholarship Test Results', 'The results for the scholarship aptitude test conducted on December 28 have been published. Selected candidates will be contacted individually for the next round.', 'exam', false, 'Exam Dept.', '2026-01-03');

-- Gallery Images
delete from gallery_images;
insert into gallery_images (src, alt, category) values
  ('https://images.unsplash.com/photo-1526470608268-f674ce90ebd4?w=400&q=80', 'Cadet in uniform', 'Training'),
  ('https://images.unsplash.com/photo-1523050854058-8df90110c7f1?w=400&q=80', 'Students in classroom', 'Academic'),
  ('https://images.unsplash.com/photo-1577896851231-70acf3a0ccb1?w=400&q=80', 'Physical training session', 'Sports'),
  ('https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400&q=80', 'Leadership workshop', 'Events'),
  ('https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=400&q=80', 'Computer lab', 'Facilities'),
  ('https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=400&q=80', 'Group discussion', 'Academic');

-- Testimonials
delete from testimonials;
insert into testimonials (name, role, content, rating, image, achievement, class) values
  ('Aarav Thapa', 'student', 'Special academy transformed my life. The disciplined environment and expert guidance helped me secure a seat at Sainik Awasiya Mahavidyalaya.', 5, 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80', 'Secured 3rd rank in SAMA 2080', 'Class 10'),
  ('Maya Sharma', 'parent', 'The academy exceeded our expectations. My son''s confidence has grown tremendously.', 5, 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&q=80', null, null),
  ('Sujan KC', 'cadet', 'Currently serving as a cadet at Birendra Sainik Awasiya Mahavidyalaya. Special academy was the foundation of my success.', 5, 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&q=80', 'Currently at BSAM', 'Class 10'),
  ('Priya Khanal', 'student', 'The scholarship preparation program was outstanding. I received a full scholarship to one of the top colleges.', 4, 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&q=80', 'Full Scholarship Winner', 'Class 12'),
  ('Rajesh Hamal', 'parent', 'A perfect place for holistic development. My daughter has become more disciplined and focused.', 5, 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&q=80', null, null),
  ('Anita Gurung', 'student', 'The leadership program was an eye-opening experience. Highly recommend!', 5, 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=80', 'Leadership Award 2080', 'Class 11');

-- Enrollments
delete from enrollments;
insert into enrollments (full_name, email, phone, current_class, interested_course, guardian_name, guardian_contact, address, previous_school, message, status) values
  ('Ramesh Adhikari', 'ramesh@example.com', '9841234567', 'Class 10', 'Cadet College Preparation', 'Hari Adhikari', '9847654321', 'Kathmandu', 'Valley Public School', 'Interested in the cadet program.', 'pending'),
  ('Sita Poudel', 'sita@example.com', '9861234567', 'Class 12', 'Scholarship Exam Preparation', 'Gopal Poudel', '9867654321', 'Pokhara', 'Gandaki Boarding School', 'Looking for scholarship guidance.', 'pending'),
  ('Binod Shah', 'binod@example.com', '9851234567', 'Class 9', 'Foundation Course', 'Mina Shah', '9857654321', 'Lalitpur', 'Everest English School', 'Want to build a strong foundation.', 'pending');

-- Exam Categories
delete from exam_categories;
insert into exam_categories (id, name, description, color) values
  ('ec0000000-0000-0000-0000-000000000001', 'General Knowledge', 'Test your knowledge of history, geography, science and current affairs.', 'bg-emerald-100 text-emerald-800'),
  ('ec0000000-0000-0000-0000-000000000002', 'Mathematics', 'Arithmetic, algebra, geometry and data interpretation.', 'bg-blue-100 text-blue-800'),
  ('ec0000000-0000-0000-0000-000000000003', 'English', 'Grammar, vocabulary, comprehension and writing skills.', 'bg-amber-100 text-amber-800');

-- Questions
delete from questions;
insert into questions (id, category_id, type, question, options, answer, explanation) values
  ('d0000000-0000-0000-0000-000000000001', 'ec0000000-0000-0000-0000-000000000001', 'mcq', 'What is the capital of Nepal?', '["Kathmandu","Pokhara","Lalitpur","Bhaktapur"]', 'Kathmandu', 'Kathmandu is the capital and largest city of Nepal.'),
  ('d0000000-0000-0000-0000-000000000002', 'ec0000000-0000-0000-0000-000000000001', 'mcq', 'Which planet is known as the Red Planet?', '["Venus","Mars","Jupiter","Saturn"]', 'Mars', 'Mars appears reddish due to iron oxide on its surface.'),
  ('d0000000-0000-0000-0000-000000000003', 'ec0000000-0000-0000-0000-000000000001', 'subjective', 'Explain the importance of discipline in a cadet''s life.', '[]', 'Discipline is crucial for cadets as it builds character, instills punctuality, and develops leadership qualities.', 'Discipline forms the foundation of cadet training.'),
  ('d0000000-0000-0000-0000-000000000004', 'ec0000000-0000-0000-0000-000000000002', 'mcq', 'What is 15% of 200?', '["25","30","35","40"]', '30', '15% of 200 = (15/100) × 200 = 30.'),
  ('d0000000-0000-0000-0000-000000000005', 'ec0000000-0000-0000-0000-000000000002', 'mcq', 'What is the square root of 144?', '["10","11","12","13"]', '12', '12 × 12 = 144.'),
  ('d0000000-0000-0000-0000-000000000006', 'ec0000000-0000-0000-0000-000000000002', 'subjective', 'Solve: 5x + 3 = 18. Find x.', '[]', 'x = 3', '5x + 3 = 18 → 5x = 15 → x = 3.'),
  ('d0000000-0000-0000-0000-000000000007', 'ec0000000-0000-0000-0000-000000000003', 'mcq', 'What is the synonym of ''Brave''?', '["Cowardly","Courageous","Timid","Weak"]', 'Courageous', 'Brave and courageous are synonyms.'),
  ('d0000000-0000-0000-0000-000000000008', 'ec0000000-0000-0000-0000-000000000003', 'mcq', 'Which of the following is a noun?', '["Run","Beautiful","Happiness","Quickly"]', 'Happiness', 'Happiness is a noun representing a state of being.'),
  ('d0000000-0000-0000-0000-000000000009', 'ec0000000-0000-0000-0000-000000000003', 'subjective', 'Write a short paragraph about your aspirations to join the cadet academy.', '[]', 'Model answer: I aspire to join the cadet academy to develop leadership skills, build character, and serve my nation.', 'Answers should reflect genuine motivation and understanding of cadet life.');

-- Students
delete from students;
insert into students (name, email, phone, class, enrolled_courses, join_date, status) values
  ('Arafat Hossain', 'arafat@example.com', '01711111111', 'Class 12', '["Cadet Entrance Preparation","Scholarship Preparation"]', '2025-09-01', 'active'),
  ('Tasnim Rahman', 'tasnim@example.com', '01722222222', 'Class 10', '["Cadet Entrance Preparation"]', '2025-09-01', 'active'),
  ('Sadia Islam', 'sadia@example.com', '01733333333', 'Class 11', '["Leadership Development","Spoken English"]', '2025-09-15', 'active'),
  ('Rafiq Ahmed', 'rafiq@example.com', '01744444444', 'Class 12', '["Scholarship Preparation","Foundation Classes"]', '2025-08-15', 'active'),
  ('Nusrat Jahan', 'nusrat@example.com', '01755555555', 'Class 10', '["Cadet Entrance Preparation"]', '2025-10-01', 'inactive');

-- Exam Attempts
delete from exam_attempts;
insert into exam_attempts (category_id, student_name, score, total, completed_at) values
  ((select id from exam_categories where name = 'General Knowledge'), 'Arafat Hossain', 8, 10, now() - interval '2 days'),
  ((select id from exam_categories where name = 'Mathematics'), 'Arafat Hossain', 7, 10, now() - interval '1 day'),
  ((select id from exam_categories where name = 'General Knowledge'), 'Tasnim Rahman', 9, 10, now() - interval '3 days'),
  ((select id from exam_categories where name = 'English'), 'Sadia Islam', 6, 10, now() - interval '5 days');

-- Exam Answers
delete from exam_answers;
insert into exam_answers (attempt_id, question_id, answer, correct)
select ea.id, q.id, 'Kathmandu', true
from exam_attempts ea
cross join questions q
where ea.student_name = 'Arafat Hossain'
  and q.question = 'What is the capital of Nepal?';

insert into exam_answers (attempt_id, question_id, answer, correct)
select ea.id, q.id, 'Mars', true
from exam_attempts ea
cross join questions q
where ea.student_name = 'Arafat Hossain'
  and q.question = 'Which planet is known as the Red Planet?';

-- Progress (requires a student profile — skip if none exist)
insert into progress (student_id, item_id, completed_at)
select p.id, i.id, now() - interval '1 day'
from profiles p
cross join items i
where p.role = 'student'
  and i.title = 'GK - Introduction to World Geography'
  and exists (select 1 from profiles where role = 'student');
