-- Seed default settings with full config data
-- Run after settings-migration.sql (ensures config + maintenance_mode columns exist)

-- Ensure the columns exist first (idempotent)
alter table settings add column if not exists config jsonb default '{}'::jsonb;
alter table settings add column if not exists maintenance_mode boolean default false;
alter table settings add column if not exists enable_blog boolean default true;

-- Upsert the first settings row with complete default data
insert into settings (id, academy_name, tagline, description, address, email, admission_email, phone, secondary_phone, website, office_hours, holiday, app_icon, social_links, enable_blog, maintenance_mode, config)
values (
  gen_random_uuid(),
  'Special Academy',
  'Preparing Future Leaders Through Discipline & Excellence',
  'Nepal''s premier cadet preparation academy.',
  'Kathmandu, Nepal',
  'info@cadetacademy.edu',
  'admission@cadetacademy.edu',
  '986-0302036',
  '986-0302036',
  'https://cadetacademy.edu',
  'Sun-Thu: 9:00 AM - 5:00 PM',
  'Friday & Public Holidays',
  '/icon-image.png',
  '{"facebook":"","instagram":"","tiktok":"","youtube":""}'::jsonb,
  true,
  false,
  '{
    "hero": {
      "title": "Preparing Future Cadets Through Discipline & Excellence",
      "subtitle": "We help students develop academic excellence, leadership skills, confidence, and discipline for cadet entrance success. Join Nepal''s most trusted cadet preparation academy.",
      "badge": "Admission Open for 2026-27 Session",
      "image": "https://images.unsplash.com/photo-1763656443687-c3de11b68813?q=80&w=687&auto=format&fit=crop"
    },
    "about": {
      "title": "Building Future Leaders Since 2010",
      "description": "Special academy has been the trusted choice for parents and students aspiring for cadet college admissions. Our holistic approach combines academic rigor with character building.",
      "image": "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800&q=80",
      "values": [
        { "title": "Mission", "description": "To prepare disciplined, academically excellent, and morally upright future leaders through comprehensive cadet preparation programs." },
        { "title": "Discipline", "description": "We instill military-grade discipline, punctuality, and self-control that forms the foundation of successful cadet life." },
        { "title": "Excellence", "description": "Pursuit of academic and personal excellence is at the core of everything we teach, ensuring our students stand out." },
        { "title": "Character", "description": "Building strong character, integrity, and leadership qualities that last a lifetime beyond cadet college admission." }
      ]
    },
    "stats": [
      { "label": "Students Enrolled", "value": "2500", "suffix": "+", "description": "Since 2010" },
      { "label": "Success Rate", "value": "94", "suffix": "%", "description": "College admission" },
      { "label": "Expert Faculty", "value": "35", "suffix": "+", "description": "Qualified instructors" },
      { "label": "Years Experience", "value": "15", "suffix": "+", "description": "In education" }
    ],
    "seo": {
      "metaDescription": "Special Academy - Nepal''s premier cadet preparation academy. We prepare students for cadet college entrance through discipline, academic excellence, and leadership training.",
      "gaTrackingId": ""
    },
    "sections": {
      "hero": true,
      "about": true,
      "whyChoose": true,
      "cadetOverview": true,
      "stats": true,
      "courses": true,
      "freeResources": true,
      "notices": true,
      "testimonials": true,
      "faculty": true,
      "facilities": true,
      "activities": true,
      "gallery": true,
      "enrollmentCta": true,
      "faq": true,
      "contact": true,
      "blog": true
    },
    "cta": {
      "title": "Start Your Cadet Journey Today",
      "subtitle": "Join Nepal''s most trusted cadet preparation academy and take the first step toward a disciplined, successful future.",
      "buttonText": "Enroll Now",
      "buttonLink": "/enroll"
    },
    "footer": {
      "copyright": "© 2026 Special Academy. All rights reserved.",
      "description": "Special Academy is Nepal''s premier cadet preparation institution, dedicated to shaping disciplined, academically excellent, and morally upright future leaders."
    },
    "whyChoose": [
      { "icon": "Users", "title": "Expert Faculty", "description": "Our team includes retired military officers, subject matter experts, and experienced educators with proven track records." },
      { "icon": "BookOpen", "title": "Comprehensive Curriculum", "description": "Specially designed curriculum covering all aspects of cadet entrance exams with regular updates based on exam patterns." },
      { "icon": "Dumbbell", "title": "Physical Training", "description": "Structured physical fitness programs designed to meet cadet college standards and build lasting endurance." },
      { "icon": "ClipboardCheck", "title": "Mock Tests & Assessments", "description": "Regular mock examinations, weekly assessments, and detailed performance analysis to track progress." },
      { "icon": "TrendingUp", "title": "Proven Results", "description": "94% of our students successfully secure admission to prestigious cadet colleges across the country." },
      { "icon": "HeadphonesIcon", "title": "Personalized Attention", "description": "Small batch sizes ensure every student receives individual attention and customized learning support." }
    ],
    "cadetOverview": {
      "title": "Complete Cadet Entrance Preparation",
      "description": "Our structured program covers every aspect of cadet college admission — from academics to physical fitness to interview readiness.",
      "heading": "What We Prepare You For",
      "steps": [
        "Comprehensive subject coverage for written exams",
        "Intelligence test and IQ development sessions",
        "Physical fitness assessment and training",
        "Interview skills and personality development",
        "Medical examination preparation guidance",
        "Mock examinations under real exam conditions",
        "Time management and stress handling techniques",
        "Regular parent-teacher progress meetings"
      ],
      "images": [
        "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=400&q=80",
        "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&q=80",
        "https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?w=400&q=80",
        "https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?w=400&q=80"
      ]
    },
    "facilities": [
      { "icon": "School", "title": "Modern Classrooms", "description": "Spacious, air-conditioned classrooms equipped with smart boards and multimedia facilities for interactive learning." },
      { "icon": "BookOpen", "title": "Digital Library", "description": "Extensive collection of books, journals, and digital resources with 24/7 online access for all students." },
      { "icon": "Monitor", "title": "Computer Lab", "description": "State-of-the-art computer laboratory with high-speed internet for research, practice tests, and skill development." },
      { "icon": "Trophy", "title": "Sports Ground", "description": "Well-maintained sports ground for physical training, athletics, and outdoor activities essential for cadet preparation." },
      { "icon": "FlaskConical", "title": "Science Laboratory", "description": "Fully equipped science lab for practical demonstrations and hands-on learning experiences." },
      { "icon": "UtensilsCrossed", "title": "Cafeteria", "description": "Hygienic cafeteria serving nutritious meals to ensure students maintain good health during intensive preparation." }
    ],
    "activities": [
      { "icon": "Sunrise", "title": "Morning Assembly", "time": "7:30 AM - 8:00 AM", "description": "Daily assembly with national anthem, physical exercises, and motivational talks to start the day with discipline." },
      { "icon": "BookOpen", "title": "Academic Classes", "time": "8:00 AM - 12:00 PM", "description": "Structured subject-wise classes focusing on core academic subjects with interactive teaching methods." },
      { "icon": "Dumbbell", "title": "Physical Training", "time": "12:30 PM - 1:30 PM", "description": "Daily physical training sessions including running, exercises, and sports to build stamina and fitness." },
      { "icon": "Users", "title": "Leadership Workshop", "time": "2:00 PM - 3:30 PM", "description": "Afternoon sessions on leadership skills, public speaking, teamwork, and personality development." },
      { "icon": "Lightbulb", "title": "Doubt Clearing & Self Study", "time": "3:30 PM - 5:00 PM", "description": "Dedicated time for students to clarify doubts, revise topics, and engage in self-directed learning." }
    ],
    "enrollmentCta": {
      "badge": "Admissions Open for 2026-27",
      "heading": "Begin Your Journey to Cadet College Today",
      "description": "Limited seats available for the upcoming session. Secure your child''s future with our proven cadet preparation programs. Early applicants receive a 10% discount.",
      "offerTitle": "Limited Time Offer",
      "offerText": "Apply before January 15, 2026 to receive a 10% early bird discount on your first semester fee.",
      "discount": "10%",
      "buttonText": "Apply for Admission",
      "buttonLink": "/enrollment"
    },
    "heroCards": [
      { "icon": "Trophy", "value": "94%", "label": "Success Rate" },
      { "icon": "Users", "value": "35+", "label": "Expert Faculty" },
      { "icon": "BookOpen", "value": "15+", "label": "Years Experience" }
    ],
    "trustIndicators": { "studentsCount": "2,500+", "rating": "4.9" },
    "sectionLabels": {
      "about": { "label": "About Us", "title": "Building Future Leaders Since 2010", "description": "Special academy has been the trusted choice for parents and students aspiring for cadet college admissions. Our holistic approach combines academic rigor with character building." },
      "whyChoose": { "label": "Why Choose Us", "title": "What Makes Special academy Different", "description": "We combine academic excellence with character building to create well-rounded individuals ready for cadet college life." },
      "cadetOverview": { "label": "Preparation", "title": "Complete Cadet Entrance Preparation", "description": "Our structured program covers every aspect of cadet college admission — from academics to physical fitness to interview readiness." },
      "stats": { "label": "Our Impact", "title": "By the Numbers", "description": "Our track record speaks for itself." },
      "courses": { "label": "Our Programs", "title": "Popular Preparation Courses", "description": "Choose from our range of specialized courses designed to prepare you for cadet college admissions and academic excellence." },
      "freeResources": { "label": "Free Resources", "title": "Try Free Sample Classes", "description": "Explore our free learning materials. No registration required." },
      "notices": { "label": "Updates", "title": "Latest Notices & Announcements", "description": "Stay informed with the latest updates, admission notices, exam schedules, and important announcements." },
      "testimonials": { "label": "Success Stories", "title": "What Our Students & Parents Say", "description": "Real stories from real students who achieved their dreams of joining cadet colleges." },
      "faculty": { "label": "Our Team", "title": "Meet Our Expert Faculty", "description": "Learn from the best. Our faculty comprises retired military officers, subject experts, and experienced educators." },
      "facilities": { "label": "Infrastructure", "title": "World-Class Facilities", "description": "Our campus is equipped with modern facilities designed to provide the best learning environment for aspiring cadets." },
      "activities": { "label": "Daily Schedule", "title": "A Day at Special academy", "description": "Our structured daily routine ensures students develop discipline, academic excellence, and physical fitness." },
      "gallery": { "label": "Gallery", "title": "Life at Special academy", "description": "Glimpses of our classrooms, training sessions, events, and the vibrant community that makes our academy special." },
      "enrollmentCta": { "label": "Enrollment", "title": "Start Your Journey", "description": "" },
      "faq": { "label": "FAQ", "title": "Frequently Asked Questions", "description": "Find answers to common questions about our admission process, courses, and preparation programs." },
      "contact": { "label": "Get in Touch", "title": "Contact Us", "description": "We''d love to hear from you. Reach out with any questions." },
      "blog": { "label": "From Our Blog", "title": "Latest Articles & Tips", "description": "Expert advice, study tips, and updates to help you succeed in your cadet entrance journey." }
    },
    "buttonLabels": {
      "applyNow": "Apply for Admission",
      "exploreCourses": "Explore Courses",
      "learnMore": "Learn More",
      "viewAllCourses": "View All Courses",
      "viewAllTeam": "View All Team",
      "viewAllTestimonials": "View All Testimonials",
      "viewAllArticles": "View All Articles",
      "viewAllNotices": "View All Notices",
      "viewFullGallery": "View Full Gallery",
      "contactUs": "Contact Us",
      "sendMessage": "Send Message"
    },
    "loaderQuotes": [
      "Discipline is the bridge between goals and accomplishment.",
      "The only way to do great work is to love what you do.",
      "Success is not final, failure is not fatal: it is the courage to continue that counts.",
      "Leadership is not about being in charge. It is about taking care of those in your charge.",
      "The future belongs to those who believe in the beauty of their dreams.",
      "Excellence is not a skill. It is an attitude.",
      "Strive not to be a success, but rather to be of value.",
      "Perseverance is the hard work you do after you get tired of doing the hard work.",
      "A leader is one who knows the way, goes the way, and shows the way.",
      "The difference between ordinary and extraordinary is that little extra."
    ],
    "theme": {
      "primaryColor": "#07220B",
      "fontFamily": "Inter"
    },
    "enablePinnedPopup": true,
    "privacyPolicy": {
      "title": "Privacy Policy",
      "description": "Learn how we collect, use, and protect your personal information.",
      "lastUpdated": "June 2026",
      "sections": [
        { "title": "Information We Collect", "content": ["We collect information you provide directly to us, including your name, email address, phone number, and academic details when you fill out admission forms, contact forms, or register for our programs.", "We automatically collect certain information when you visit our website, including your IP address, browser type, device information, and browsing patterns through cookies and similar technologies.", "We may collect photographs and video footage during academy events and activities for promotional and record-keeping purposes with appropriate consent."] },
        { "title": "How We Use Your Information", "content": ["To process admissions, enrollments, and academic record management for our cadet preparation programs.", "To communicate with you regarding program updates, admissions notices, examination schedules, and other academy-related information.", "To improve our educational services, curriculum, and website experience based on usage patterns and feedback.", "To comply with legal obligations and maintain academic records as required by educational regulatory authorities."] },
        { "title": "Information Sharing and Disclosure", "content": ["We do not sell, trade, or rent your personal information to third parties for marketing purposes.", "We may share information with trusted educational partners and service providers who assist in operating our academy and programs, under strict confidentiality agreements.", "We may disclose information when required by law, to enforce our policies, or to protect the rights and safety of our academy, students, or others.", "Aggregated, anonymized data may be used for statistical analysis and reporting without personally identifying individuals."] },
        { "title": "Data Security", "content": ["We implement appropriate technical and organizational security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.", "All sensitive data transmitted through our website is encrypted using industry-standard SSL/TLS protocols.", "Access to personal information is restricted to authorized personnel only, who are bound by confidentiality obligations.", "We regularly review and update our security practices to maintain the integrity and confidentiality of your data."] },
        { "title": "Cookies and Tracking", "content": ["Our website uses cookies to enhance your browsing experience, analyze site traffic, and understand where our visitors come from.", "You can control cookie preferences through your browser settings. Please note that disabling certain cookies may affect website functionality.", "We use essential cookies for basic site operations, analytics cookies to understand usage patterns, and occasionally marketing cookies for targeted communications."] },
        { "title": "Your Rights and Choices", "content": ["You have the right to access, update, or request deletion of your personal information held by us.", "You may opt out of receiving promotional communications at any time by contacting us or using the unsubscribe link in our emails.", "You can request a copy of the information we hold about you, subject to verification of your identity.", "You have the right to withdraw consent for data processing where consent was previously provided."] },
        { "title": "Contact Us", "content": ["If you have any questions, concerns, or requests regarding this Privacy Policy or our data practices, please contact us at our academy address, phone number, or email address listed on our Contact page.", "We will respond to your inquiry within a reasonable timeframe and work to address any concerns you may have about your privacy."] },
        { "title": "Children''s Privacy", "content": ["Our services are primarily directed toward students and prospective cadets. We collect information about minors only with parental or guardian consent.", "Parents and guardians have the right to review, update, or request deletion of their child''s personal information.", "If we become aware that we have collected personal information from a minor without proper consent, we will take steps to delete that information promptly."] }
      ]
    },
    "terms": {
      "title": "Terms of Service",
      "description": "Review the terms and conditions governing the use of our website, programs, and services. Understand your rights and responsibilities.",
      "lastUpdated": "June 2026",
      "sections": [
        { "title": "Acceptance of Terms", "content": ["By accessing or using the Special academy website, enrolling in our programs, or interacting with our services, you agree to be bound by these Terms of Service. If you do not agree with any part of these terms, you should not use our website or services.", "These terms apply to all visitors, students, parents, and any other users of our platform and services.", "We reserve the right to update or modify these terms at any time without prior notice. Continued use of our services after any changes constitutes acceptance of the modified terms."] },
        { "title": "Eligibility and Enrollment", "content": ["Admission to our cadet preparation programs is subject to meeting the eligibility criteria specified for each program, including age requirements, academic qualifications, and physical fitness standards.", "All information provided during enrollment must be accurate, complete, and truthful. Providing false or misleading information may result in immediate termination of enrollment.", "Enrollment confirmation is subject to availability and completion of all required documentation and fee payment.", "We reserve the right to refuse or cancel enrollment at our discretion, with appropriate refunds issued as per our refund policy."] },
        { "title": "User Responsibilities", "content": ["Users agree to use our website and services only for lawful purposes and in accordance with these terms.", "You are responsible for maintaining the confidentiality of any account credentials provided to you and for all activities that occur under your account.", "You agree not to engage in any conduct that could damage, disable, or impair our website or interfere with other users'' access and enjoyment.", "Students enrolled in our programs must adhere to the academy''s code of conduct, discipline policies, and academic requirements."] },
        { "title": "Intellectual Property", "content": ["All content on our website, including text, graphics, logos, images, course materials, and software, is the property of Special academy or its content providers and is protected by applicable intellectual property laws.", "You may not reproduce, distribute, modify, create derivative works from, or commercially exploit any content from our website without our prior written consent.", "Course materials provided to enrolled students are for personal educational use only and may not be shared, reproduced, or distributed to third parties."] },
        { "title": "Prohibited Activities", "content": ["You agree not to use our website or services for any unlawful purpose or in violation of any applicable laws or regulations.", "Prohibited activities include, but are not limited to: hacking, introducing malicious code, attempting to gain unauthorized access, scraping data, or interfering with website security features.", "Harassment, discrimination, or any form of misconduct towards academy staff, faculty, or fellow students will not be tolerated and may result in immediate dismissal from programs.", "Any attempt to circumvent payment requirements, access restricted areas without authorization, or impersonate another individual is strictly prohibited."] },
        { "title": "Limitation of Liability", "content": ["Special academy shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of our website or services.", "While we strive to provide accurate and up-to-date information, we make no warranties regarding the completeness, reliability, or accuracy of content on our website.", "We are not responsible for the content or practices of third-party websites linked from our site. Such links are provided for convenience only.", "Our total liability for any claim arising from these terms or your use of our services shall not exceed the total fees paid by you for the specific program in question."] },
        { "title": "Contact and Communication", "content": ["By providing your contact information, you consent to receive communications from us regarding your enrollment, program updates, and academy announcements via phone, email, or SMS.", "You may opt out of promotional communications at any time; however, transactional and administrative communications related to your enrollment will continue as necessary.", "For questions or concerns regarding these terms, please contact us through the information provided on our Contact page."] }
      ]
    }
  }'::jsonb
)
on conflict (id) do update set
  academy_name = excluded.academy_name,
  tagline = excluded.tagline,
  description = excluded.description,
  address = excluded.address,
  email = excluded.email,
  admission_email = excluded.admission_email,
  phone = excluded.phone,
  secondary_phone = excluded.secondary_phone,
  website = excluded.website,
  office_hours = excluded.office_hours,
  holiday = excluded.holiday,
  app_icon = excluded.app_icon,
  social_links = excluded.social_links,
  enable_blog = excluded.enable_blog,
  maintenance_mode = excluded.maintenance_mode,
  config = excluded.config;

-- If a row already exists without an id conflict, update its config
do $$
declare
  existing_id uuid;
begin
  select id into existing_id from settings limit 1;
  if existing_id is not null then
    update settings set
      config = '{
        "hero": {
          "title": "Preparing Future Cadets Through Discipline & Excellence",
          "subtitle": "We help students develop academic excellence, leadership skills, confidence, and discipline for cadet entrance success. Join Nepal''s most trusted cadet preparation academy.",
          "badge": "Admission Open for 2026-27 Session",
          "image": "https://images.unsplash.com/photo-1763656443687-c3de11b68813?q=80&w=687&auto=format&fit=crop"
        },
        "about": {
          "title": "Building Future Leaders Since 2010",
          "description": "Special academy has been the trusted choice for parents and students aspiring for cadet college admissions. Our holistic approach combines academic rigor with character building.",
          "image": "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800&q=80",
          "values": [
            { "title": "Mission", "description": "To prepare disciplined, academically excellent, and morally upright future leaders through comprehensive cadet preparation programs." },
            { "title": "Discipline", "description": "We instill military-grade discipline, punctuality, and self-control that forms the foundation of successful cadet life." },
            { "title": "Excellence", "description": "Pursuit of academic and personal excellence is at the core of everything we teach, ensuring our students stand out." },
            { "title": "Character", "description": "Building strong character, integrity, and leadership qualities that last a lifetime beyond cadet college admission." }
          ]
        },
        "stats": [
          { "label": "Students Enrolled", "value": "2500", "suffix": "+", "description": "Since 2010" },
          { "label": "Success Rate", "value": "94", "suffix": "%", "description": "College admission" },
          { "label": "Expert Faculty", "value": "35", "suffix": "+", "description": "Qualified instructors" },
          { "label": "Years Experience", "value": "15", "suffix": "+", "description": "In education" }
        ],
        "seo": {
          "metaDescription": "Special Academy - Nepal''s premier cadet preparation academy.",
          "gaTrackingId": ""
        },
        "sections": {
          "hero": true, "about": true, "whyChoose": true, "cadetOverview": true,
          "stats": true, "courses": true, "freeResources": true, "notices": true,
          "testimonials": true, "faculty": true, "facilities": true, "activities": true,
          "gallery": true, "enrollmentCta": true, "faq": true, "contact": true, "blog": true
        },
        "cta": {
          "title": "Start Your Cadet Journey Today",
          "subtitle": "Join Nepal''s most trusted cadet preparation academy.",
          "buttonText": "Enroll Now",
          "buttonLink": "/enroll"
        },
        "footer": {
          "copyright": "© 2026 Special Academy. All rights reserved.",
          "description": "Special Academy is Nepal''s premier cadet preparation institution."
        },
        "whyChoose": [
          { "icon": "Users", "title": "Expert Faculty", "description": "Our team includes retired military officers, subject matter experts, and experienced educators with proven track records." },
          { "icon": "BookOpen", "title": "Comprehensive Curriculum", "description": "Specially designed curriculum covering all aspects of cadet entrance exams with regular updates based on exam patterns." },
          { "icon": "Dumbbell", "title": "Physical Training", "description": "Structured physical fitness programs designed to meet cadet college standards and build lasting endurance." },
          { "icon": "ClipboardCheck", "title": "Mock Tests & Assessments", "description": "Regular mock examinations, weekly assessments, and detailed performance analysis to track progress." },
          { "icon": "TrendingUp", "title": "Proven Results", "description": "94% of our students successfully secure admission to prestigious cadet colleges across the country." },
          { "icon": "HeadphonesIcon", "title": "Personalized Attention", "description": "Small batch sizes ensure every student receives individual attention and customized learning support." }
        ],
        "cadetOverview": {
          "title": "Complete Cadet Entrance Preparation",
          "description": "Our structured program covers every aspect of cadet college admission — from academics to physical fitness to interview readiness.",
          "heading": "What We Prepare You For",
          "steps": [
            "Comprehensive subject coverage for written exams",
            "Intelligence test and IQ development sessions",
            "Physical fitness assessment and training",
            "Interview skills and personality development",
            "Medical examination preparation guidance",
            "Mock examinations under real exam conditions",
            "Time management and stress handling techniques",
            "Regular parent-teacher progress meetings"
          ],
          "images": [
            "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=400&q=80",
            "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&q=80",
            "https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?w=400&q=80",
            "https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?w=400&q=80"
          ]
        },
        "facilities": [
          { "icon": "School", "title": "Modern Classrooms", "description": "Spacious, air-conditioned classrooms equipped with smart boards and multimedia facilities for interactive learning." },
          { "icon": "BookOpen", "title": "Digital Library", "description": "Extensive collection of books, journals, and digital resources with 24/7 online access for all students." },
          { "icon": "Monitor", "title": "Computer Lab", "description": "State-of-the-art computer laboratory with high-speed internet for research, practice tests, and skill development." },
          { "icon": "Trophy", "title": "Sports Ground", "description": "Well-maintained sports ground for physical training, athletics, and outdoor activities essential for cadet preparation." },
          { "icon": "FlaskConical", "title": "Science Laboratory", "description": "Fully equipped science lab for practical demonstrations and hands-on learning experiences." },
          { "icon": "UtensilsCrossed", "title": "Cafeteria", "description": "Hygienic cafeteria serving nutritious meals to ensure students maintain good health during intensive preparation." }
        ],
        "activities": [
          { "icon": "Sunrise", "title": "Morning Assembly", "time": "7:30 AM - 8:00 AM", "description": "Daily assembly with national anthem, physical exercises, and motivational talks to start the day with discipline." },
          { "icon": "BookOpen", "title": "Academic Classes", "time": "8:00 AM - 12:00 PM", "description": "Structured subject-wise classes focusing on core academic subjects with interactive teaching methods." },
          { "icon": "Dumbbell", "title": "Physical Training", "time": "12:30 PM - 1:30 PM", "description": "Daily physical training sessions including running, exercises, and sports to build stamina and fitness." },
          { "icon": "Users", "title": "Leadership Workshop", "time": "2:00 PM - 3:30 PM", "description": "Afternoon sessions on leadership skills, public speaking, teamwork, and personality development." },
          { "icon": "Lightbulb", "title": "Doubt Clearing & Self Study", "time": "3:30 PM - 5:00 PM", "description": "Dedicated time for students to clarify doubts, revise topics, and engage in self-directed learning." }
        ],
        "enrollmentCta": {
          "badge": "Admissions Open for 2026-27",
          "heading": "Begin Your Journey to Cadet College Today",
          "description": "Limited seats available for the upcoming session. Secure your child''s future with our proven cadet preparation programs. Early applicants receive a 10% discount.",
          "offerTitle": "Limited Time Offer",
          "offerText": "Apply before January 15, 2026 to receive a 10% early bird discount on your first semester fee.",
          "discount": "10%",
          "buttonText": "Apply for Admission",
          "buttonLink": "/enrollment"
        },
        "heroCards": [
          { "icon": "Trophy", "value": "94%", "label": "Success Rate" },
          { "icon": "Users", "value": "35+", "label": "Expert Faculty" },
          { "icon": "BookOpen", "value": "15+", "label": "Years Experience" }
        ],
        "trustIndicators": { "studentsCount": "2,500+", "rating": "4.9" },
        "sectionLabels": {
          "about": { "label": "About Us", "title": "Building Future Leaders Since 2010", "description": "Special academy has been the trusted choice for parents and students aspiring for cadet college admissions." },
          "whyChoose": { "label": "Why Choose Us", "title": "What Makes Special academy Different", "description": "We combine academic excellence with character building to create well-rounded individuals ready for cadet college life." },
          "cadetOverview": { "label": "Preparation", "title": "Complete Cadet Entrance Preparation", "description": "Our structured program covers every aspect of cadet college admission — from academics to physical fitness to interview readiness." },
          "stats": { "label": "Our Impact", "title": "By the Numbers", "description": "Our track record speaks for itself." },
          "courses": { "label": "Our Programs", "title": "Popular Preparation Courses", "description": "Choose from our range of specialized courses designed to prepare you for cadet college admissions and academic excellence." },
          "freeResources": { "label": "Free Resources", "title": "Try Free Sample Classes", "description": "Explore our free learning materials. No registration required." },
          "notices": { "label": "Updates", "title": "Latest Notices & Announcements", "description": "Stay informed with the latest updates, admission notices, exam schedules, and important announcements." },
          "testimonials": { "label": "Success Stories", "title": "What Our Students & Parents Say", "description": "Real stories from real students who achieved their dreams of joining cadet colleges." },
          "faculty": { "label": "Our Team", "title": "Meet Our Expert Faculty", "description": "Learn from the best. Our faculty comprises retired military officers, subject experts, and experienced educators." },
          "facilities": { "label": "Infrastructure", "title": "World-Class Facilities", "description": "Our campus is equipped with modern facilities designed to provide the best learning environment for aspiring cadets." },
          "activities": { "label": "Daily Schedule", "title": "A Day at Special academy", "description": "Our structured daily routine ensures students develop discipline, academic excellence, and physical fitness." },
          "gallery": { "label": "Gallery", "title": "Life at Special academy", "description": "Glimpses of our classrooms, training sessions, events, and the vibrant community." },
          "enrollmentCta": { "label": "Enrollment", "title": "Start Your Journey", "description": "" },
          "faq": { "label": "FAQ", "title": "Frequently Asked Questions", "description": "Find answers to common questions about our admission process, courses, and preparation programs." },
          "contact": { "label": "Get in Touch", "title": "Contact Us", "description": "We''d love to hear from you. Reach out with any questions." },
          "blog": { "label": "From Our Blog", "title": "Latest Articles & Tips", "description": "Expert advice, study tips, and updates to help you succeed in your cadet entrance journey." }
        },
        "buttonLabels": {
          "applyNow": "Apply for Admission",
          "exploreCourses": "Explore Courses",
          "learnMore": "Learn More",
          "viewAllCourses": "View All Courses",
          "viewAllTeam": "View All Team",
          "viewAllTestimonials": "View All Testimonials",
          "viewAllArticles": "View All Articles",
          "viewAllNotices": "View All Notices",
          "viewFullGallery": "View Full Gallery",
          "contactUs": "Contact Us",
          "sendMessage": "Send Message"
        },
        "loaderQuotes": [
          "Discipline is the bridge between goals and accomplishment.",
          "The only way to do great work is to love what you do.",
          "Success is not final, failure is not fatal: it is the courage to continue that counts.",
          "Leadership is not about being in charge. It is about taking care of those in your charge.",
          "The future belongs to those who believe in the beauty of their dreams.",
          "Excellence is not a skill. It is an attitude.",
          "Strive not to be a success, but rather to be of value.",
          "Perseverance is the hard work you do after you get tired of doing the hard work.",
          "A leader is one who knows the way, goes the way, and shows the way.",
          "The difference between ordinary and extraordinary is that little extra."
        ],
        "theme": {
          "primaryColor": "#07220B",
          "fontFamily": "Inter"
        },
        "enablePinnedPopup": true,
        "privacyPolicy": {
          "title": "Privacy Policy",
          "description": "Learn how we collect, use, and protect your personal information.",
          "lastUpdated": "June 2026",
          "sections": [
            { "title": "Information We Collect", "content": ["We collect information you provide directly to us, including your name, email address, phone number, and academic details.", "We automatically collect certain information when you visit our website, including your IP address, browser type, and browsing patterns.", "We may collect photographs and video footage during academy events with appropriate consent."] },
            { "title": "How We Use Your Information", "content": ["To process admissions, enrollments, and academic record management.", "To communicate with you regarding program updates and academy-related information.", "To improve our educational services and website experience.", "To comply with legal obligations and maintain academic records."] },
            { "title": "Information Sharing", "content": ["We do not sell or rent your personal information to third parties.", "We may share information with trusted partners under confidentiality agreements.", "We may disclose information when required by law."] },
            { "title": "Data Security", "content": ["We implement security measures to protect your personal information.", "All sensitive data is encrypted using industry-standard protocols.", "Access to personal information is restricted to authorized personnel."] },
            { "title": "Your Rights", "content": ["You have the right to access, update, or request deletion of your data.", "You may opt out of promotional communications at any time.", "You can request a copy of the information we hold about you."] }
          ]
        },
        "terms": {
          "title": "Terms of Service",
          "description": "Review the terms governing the use of our website, programs, and services.",
          "lastUpdated": "June 2026",
          "sections": [
            { "title": "Acceptance of Terms", "content": ["By accessing or using our website and services, you agree to these Terms.", "We reserve the right to update these terms at any time.", "Continued use after changes constitutes acceptance."] },
            { "title": "Eligibility", "content": ["Admission is subject to meeting eligibility criteria.", "All information provided must be accurate and truthful.", "We reserve the right to refuse or cancel enrollment."] },
            { "title": "User Responsibilities", "content": ["Users agree to use our services only for lawful purposes.", "You are responsible for maintaining account confidentiality.", "Students must adhere to the academy''s code of conduct."] },
            { "title": "Intellectual Property", "content": ["All content is the property of Special academy.", "You may not reproduce or distribute content without permission.", "Course materials are for personal educational use only."] },
            { "title": "Limitation of Liability", "content": ["We shall not be liable for indirect damages arising from use of our services.", "We make no warranties regarding completeness or accuracy of content.", "Liability is limited to fees paid for the specific program."] }
          ]
        }
      }'::jsonb
    where id = existing_id
      and (config is null or config = '{}'::jsonb);
  end if;
end $$;
