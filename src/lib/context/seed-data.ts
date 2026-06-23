import type { Subcategory, Item, ExamCategory, ExamSubcategory, Question, ExamAttempt, Notice, Testimonial, GalleryImage, Course, Student } from "@/types";

export interface FAQ {
  id: string;
  question: string;
  answer: string;
  sortOrder: number;
}

export interface NoticeCategory {
  value: string;
  label: string;
  color: string;
}

export interface Qualification {
  id: string;
  name: string;
  sortOrder: number;
}

export interface SocialLinks {
  facebook: string;
  instagram: string;
  tiktok: string;
  youtube: string;
}

export type SectionKey =
  | "hero" | "about" | "whyChoose" | "cadetOverview" | "stats"
  | "courses" | "freeResources" | "notices" | "testimonials" | "faculty"
  | "facilities" | "activities" | "gallery" | "enrollmentCta" | "faq"
  | "contact" | "blog";

export interface LandingConfig {
  hero: { title: string; subtitle: string; badge: string; image: string };
  about: { title: string; description: string; image: string; values: { title: string; description: string }[] };
  stats: { label: string; value: string; suffix?: string; description?: string }[];
  seo?: { metaDescription: string; gaTrackingId: string };
  sections?: Record<SectionKey, boolean>;
  cta?: { title: string; subtitle: string; buttonText: string; buttonLink: string };
  footer?: { copyright: string; description: string };
  whyChoose: { icon: string; title: string; description: string }[];
  cadetOverview: { title: string; description: string; heading: string; steps: string[]; images: string[] };
  facilities: { icon: string; title: string; description: string }[];
  activities: { icon: string; title: string; time: string; description: string }[];
  enrollmentCta: { badge: string; heading: string; description: string; offerTitle: string; offerText: string; discount: string; buttonText: string; buttonLink: string };
  heroCards: { icon: string; value: string; label: string }[];
  trustIndicators: { studentsCount: string; rating: string };
  sectionLabels: Record<string, { label: string; title: string; description: string }>;
  buttonLabels: { applyNow: string; exploreCourses: string; learnMore: string; viewAllCourses: string; viewAllTeam: string; viewAllTestimonials: string; viewAllArticles: string; viewAllNotices: string; viewFullGallery: string; contactUs: string; sendMessage: string };
  loaderQuotes: string[];
  theme?: { primaryColor: string; fontFamily: string; };
  enablePinnedPopup?: boolean;
  showAdmissionBar?: boolean;
  backup?: { autoBackup: { enabled: boolean; frequency: string; lastBackup: string | null }; };
  backupHistory?: { id: string; timestamp: string; type: string; destination: string; status: string; fileSize: number | null; errorMessage: string | null; fileName: string | null; }[];
  privacyPolicy?: { title: string; description: string; lastUpdated: string; sections: { title: string; content: string[] }[]; };
  terms?: { title: string; description: string; lastUpdated: string; sections: { title: string; content: string[] }[]; };
}

export interface AppSettings {
  academyName: string; tagline: string; description: string; address: string; email: string;
  admissionEmail: string; phone: string; secondaryPhone: string; website: string; officeHours: string;
  holiday: string; appIcon: string; socialLinks: SocialLinks; enableBlog: boolean; maintenanceMode: boolean;
  config: LandingConfig; seo: { metaDescription: string; gaTrackingId: string };
}

interface Enrollment {
  id: string; fullName: string; email: string; interestedCourse: string;
  qualificationId: string; createdAt: string; status: "unverified" | "pending" | "approved" | "rejected"; rejectionMessage?: string;
}

export function generateId() {
  return crypto.randomUUID();
}

export const defaultSettings: AppSettings = {
  academyName: "Special Academy",
  tagline: "Preparing Future Leaders Through Discipline & Excellence",
  description: "Nepal's premier cadet preparation academy.",
  address: "Kathmandu, Nepal",
  email: "info@cadetacademy.edu",
  admissionEmail: "admission@cadetacademy.edu",
  phone: "986-0302036",
  secondaryPhone: "986-0302036",
  website: "https://cadetacademy.edu",
  officeHours: "Sun-Thu: 9:00 AM - 5:00 PM",
  holiday: "Friday & Public Holidays",
  appIcon: "/icon-image.png",
  socialLinks: { facebook: "", instagram: "", tiktok: "", youtube: "" },
  enableBlog: true,
  maintenanceMode: false,
  config: {
    hero: { title: "Preparing Future Cadets Through Discipline & Excellence", subtitle: "We help students develop academic excellence, leadership skills, confidence, and discipline for cadet entrance success. Join Nepal's most trusted cadet preparation academy.", badge: "Admission Open for 2026-27 Session", image: "https://images.unsplash.com/photo-1763656443687-c3de11b68813?q=80&w=687&auto=format&fit=crop" },
    about: { title: "Building Future Leaders Since 2010", description: "Special academy has been the trusted choice for parents and students aspiring for cadet college admissions. Our holistic approach combines academic rigor with character building.", image: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800&q=80", values: [
      { title: "Mission", description: "To prepare disciplined, academically excellent, and morally upright future leaders through comprehensive cadet preparation programs." },
      { title: "Discipline", description: "We instill military-grade discipline, punctuality, and self-control that forms the foundation of successful cadet life." },
      { title: "Excellence", description: "Pursuit of academic and personal excellence is at the core of everything we teach, ensuring our students stand out." },
      { title: "Character", description: "Building strong character, integrity, and leadership qualities that last a lifetime beyond cadet college admission." },
    ] },
    stats: [
      { label: "Students Enrolled", value: "2500", suffix: "+", description: "Since 2010" },
      { label: "Success Rate", value: "94", suffix: "%", description: "College admission" },
      { label: "Expert Faculty", value: "35", suffix: "+", description: "Qualified instructors" },
      { label: "Years Experience", value: "15", suffix: "+", description: "In education" },
    ],
    sections: { hero: true, about: true, whyChoose: true, cadetOverview: true, stats: true, courses: true, freeResources: true, notices: true, testimonials: true, faculty: true, facilities: true, activities: true, gallery: true, enrollmentCta: true, faq: true, contact: true, blog: true },
    cta: { title: "Start Your Cadet Journey Today", subtitle: "Join Nepal's most trusted cadet preparation academy and take the first step toward a disciplined, successful future.", buttonText: "Enroll Now", buttonLink: "/enroll" },
    footer: { copyright: "© 2026 Special Academy. All rights reserved.", description: "Special Academy is Nepal's premier cadet preparation institution, dedicated to shaping disciplined, academically excellent, and morally upright future leaders." },
    whyChoose: [
      { icon: "Users", title: "Expert Faculty", description: "Our team includes retired military officers, subject matter experts, and experienced educators with proven track records." },
      { icon: "BookOpen", title: "Comprehensive Curriculum", description: "Specially designed curriculum covering all aspects of cadet entrance exams with regular updates based on exam patterns." },
      { icon: "Dumbbell", title: "Physical Training", description: "Structured physical fitness programs designed to meet cadet college standards and build lasting endurance." },
      { icon: "ClipboardCheck", title: "Mock Tests & Assessments", description: "Regular mock examinations, weekly assessments, and detailed performance analysis to track progress." },
      { icon: "TrendingUp", title: "Proven Results", description: "94% of our students successfully secure admission to prestigious cadet colleges across the country." },
      { icon: "HeadphonesIcon", title: "Personalized Attention", description: "Small batch sizes ensure every student receives individual attention and customized learning support." },
    ],
    cadetOverview: { title: "Complete Cadet Entrance Preparation", description: "Our structured program covers every aspect of cadet college admission — from academics to physical fitness to interview readiness.", heading: "What We Prepare You For", steps: [
      "Comprehensive subject coverage for written exams",
      "Intelligence test and IQ development sessions",
      "Physical fitness assessment and training",
      "Interview skills and personality development",
      "Medical examination preparation guidance",
      "Mock examinations under real exam conditions",
      "Time management and stress handling techniques",
      "Regular parent-teacher progress meetings",
    ], images: [
      "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=400&q=80",
      "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&q=80",
      "https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?w=400&q=80",
      "https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?w=400&q=80",
    ] },
    facilities: [
      { icon: "School", title: "Modern Classrooms", description: "Spacious, air-conditioned classrooms equipped with smart boards and multimedia facilities for interactive learning." },
      { icon: "BookOpen", title: "Digital Library", description: "Extensive collection of books, journals, and digital resources with 24/7 online access for all students." },
      { icon: "Monitor", title: "Computer Lab", description: "State-of-the-art computer laboratory with high-speed internet for research, practice tests, and skill development." },
      { icon: "Trophy", title: "Sports Ground", description: "Well-maintained sports ground for physical training, athletics, and outdoor activities essential for cadet preparation." },
      { icon: "FlaskConical", title: "Science Laboratory", description: "Fully equipped science lab for practical demonstrations and hands-on learning experiences." },
      { icon: "UtensilsCrossed", title: "Cafeteria", description: "Hygienic cafeteria serving nutritious meals to ensure students maintain good health during intensive preparation." },
    ],
    activities: [
      { icon: "Sunrise", title: "Morning Assembly", time: "7:30 AM - 8:00 AM", description: "Daily assembly with national anthem, physical exercises, and motivational talks to start the day with discipline." },
      { icon: "BookOpen", title: "Academic Classes", time: "8:00 AM - 12:00 PM", description: "Structured subject-wise classes focusing on core academic subjects with interactive teaching methods." },
      { icon: "Dumbbell", title: "Physical Training", time: "12:30 PM - 1:30 PM", description: "Daily physical training sessions including running, exercises, and sports to build stamina and fitness." },
      { icon: "Users", title: "Leadership Workshop", time: "2:00 PM - 3:30 PM", description: "Afternoon sessions on leadership skills, public speaking, teamwork, and personality development." },
      { icon: "Lightbulb", title: "Doubt Clearing & Self Study", time: "3:30 PM - 5:00 PM", description: "Dedicated time for students to clarify doubts, revise topics, and engage in self-directed learning." },
    ],
    enrollmentCta: { badge: "Admissions Open for 2026-27", heading: "Begin Your Journey to Cadet College Today", description: "Limited seats available for the upcoming session. Secure your child's future with our proven cadet preparation programs. Early applicants receive a 10% discount.", offerTitle: "Limited Time Offer", offerText: "Apply before January 15, 2026 to receive a 10% early bird discount on your first semester fee.", discount: "10%", buttonText: "Apply for Admission", buttonLink: "/enrollment" },
    heroCards: [
      { icon: "Trophy", value: "94%", label: "Success Rate" },
      { icon: "Users", value: "35+", label: "Expert Faculty" },
      { icon: "BookOpen", value: "15+", label: "Years Experience" },
    ],
    trustIndicators: { studentsCount: "2,500+", rating: "4.9" },
    sectionLabels: {
      about: { label: "About Us", title: "Building Future Leaders Since 2010", description: "Special academy has been the trusted choice for parents and students aspiring for cadet college admissions. Our holistic approach combines academic rigor with character building." },
      whyChoose: { label: "Why Choose Us", title: "What Makes Special academy Different", description: "We combine academic excellence with character building to create well-rounded individuals ready for cadet college life." },
      cadetOverview: { label: "Preparation", title: "Complete Cadet Entrance Preparation", description: "Our structured program covers every aspect of cadet college admission — from academics to physical fitness to interview readiness." },
      stats: { label: "Our Impact", title: "By the Numbers", description: "Our track record speaks for itself." },
      courses: { label: "Our Programs", title: "Popular Preparation Courses", description: "Choose from our range of specialized courses designed to prepare you for cadet college admissions and academic excellence." },
      freeResources: { label: "Free Resources", title: "Try Free Sample Classes", description: "Explore our free learning materials. No registration required." },
      notices: { label: "Updates", title: "Latest Notices & Announcements", description: "Stay informed with the latest updates, admission notices, exam schedules, and important announcements." },
      testimonials: { label: "Success Stories", title: "What Our Students & Parents Say", description: "Real stories from real students who achieved their dreams of joining cadet colleges." },
      faculty: { label: "Our Team", title: "Meet Our Expert Faculty", description: "Learn from the best. Our faculty comprises retired military officers, subject experts, and experienced educators." },
      facilities: { label: "Infrastructure", title: "World-Class Facilities", description: "Our campus is equipped with modern facilities designed to provide the best learning environment for aspiring cadets." },
      activities: { label: "Daily Schedule", title: "A Day at Special academy", description: "Our structured daily routine ensures students develop discipline, academic excellence, and physical fitness." },
      gallery: { label: "Gallery", title: "Life at Special academy", description: "Glimpses of our classrooms, training sessions, events, and the vibrant community that makes our academy special." },
      enrollmentCta: { label: "Enrollment", title: "Start Your Journey", description: "" },
      faq: { label: "FAQ", title: "Frequently Asked Questions", description: "Find answers to common questions about our admission process, courses, and preparation programs." },
      contact: { label: "Contact Us", title: "Contact Us", description: "We'd love to hear from you. Reach out with any questions." },
      blog: { label: "From Our Blog", title: "Latest Articles & Tips", description: "Expert advice, study tips, and updates to help you succeed in your cadet entrance journey." },
    },
    buttonLabels: { applyNow: "Apply for Admission", exploreCourses: "Explore Courses", learnMore: "Learn More", viewAllCourses: "View All Courses", viewAllTeam: "View All Team", viewAllTestimonials: "View All Testimonials", viewAllArticles: "View All Articles", viewAllNotices: "View All Notices", viewFullGallery: "View Full Gallery", contactUs: "Contact Us", sendMessage: "Send Message" },
    loaderQuotes: [
      "Discipline is the bridge between goals and accomplishment.",
      "The only way to do great work is to love what you do.",
      "Success is not final, failure is not fatal: it is the courage to continue that counts.",
      "Leadership is not about being in charge. It is about taking care of those in your charge.",
      "The future belongs to those who believe in the beauty of their dreams.",
      "Excellence is not a skill. It is an attitude.",
      "Strive not to be a success, but rather to be of value.",
      "Perseverance is the hard work you do after you get tired of doing the hard work.",
      "A leader is one who knows the way, goes the way, and shows the way.",
      "The difference between ordinary and extraordinary is that little extra.",
    ],
    theme: { primaryColor: "#07220B", fontFamily: "Inter" },
    enablePinnedPopup: true,
    showAdmissionBar: true,
    privacyPolicy: { title: "Privacy Policy", description: "Learn how we collect, use, and protect your personal information.", lastUpdated: "June 2026", sections: [
      { title: "Information We Collect", content: ["We collect information you provide directly to us, including your name, email address, phone number, and academic details when you fill out admission forms, contact forms, or register for our programs.", "We automatically collect certain information when you visit our website, including your IP address, browser type, device information, and browsing patterns through cookies and similar technologies.", "We may collect photographs and video footage during academy events and activities for promotional and record-keeping purposes with appropriate consent."] },
      { title: "How We Use Your Information", content: ["To process admissions, enrollments, and academic record management for our cadet preparation programs.", "To communicate with you regarding program updates, admissions notices, examination schedules, and other academy-related information.", "To improve our educational services, curriculum, and website experience based on usage patterns and feedback.", "To comply with legal obligations and maintain academic records as required by educational regulatory authorities."] },
      { title: "Information Sharing and Disclosure", content: ["We do not sell, trade, or rent your personal information to third parties for marketing purposes.", "We may share information with trusted educational partners and service providers who assist in operating our academy and programs, under strict confidentiality agreements.", "We may disclose information when required by law, to enforce our policies, or to protect the rights and safety of our academy, students, or others.", "Aggregated, anonymized data may be used for statistical analysis and reporting without personally identifying individuals."] },
      { title: "Data Security", content: ["We implement appropriate technical and organizational security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.", "All sensitive data transmitted through our website is encrypted using industry-standard SSL/TLS protocols.", "Access to personal information is restricted to authorized personnel only, who are bound by confidentiality obligations.", "We regularly review and update our security practices to maintain the integrity and confidentiality of your data."] },
      { title: "Cookies and Tracking", content: ["Our website uses cookies to enhance your browsing experience, analyze site traffic, and understand where our visitors come from.", "You can control cookie preferences through your browser settings. Please note that disabling certain cookies may affect website functionality.", "We use essential cookies for basic site operations, analytics cookies to understand usage patterns, and occasionally marketing cookies for targeted communications."] },
      { title: "Your Rights and Choices", content: ["You have the right to access, update, or request deletion of your personal information held by us.", "You may opt out of receiving promotional communications at any time by contacting us or using the unsubscribe link in our emails.", "You can request a copy of the information we hold about you, subject to verification of your identity.", "You have the right to withdraw consent for data processing where consent was previously provided."] },
      { title: "Contact Us", content: ["If you have any questions, concerns, or requests regarding this Privacy Policy or our data practices, please contact us at our academy address, phone number, or email address listed on our Contact page.", "We will respond to your inquiry within a reasonable timeframe and work to address any concerns you may have about your privacy."] },
      { title: "Children's Privacy", content: ["Our services are primarily directed toward students and prospective cadets. We collect information about minors only with parental or guardian consent.", "Parents and guardians have the right to review, update, or request deletion of their child's personal information.", "If we become aware that we have collected personal information from a minor without proper consent, we will take steps to delete that information promptly."] },
    ] },
    terms: { title: "Terms of Service", description: "Review the terms and conditions governing the use of our website, programs, and services.", lastUpdated: "June 2026", sections: [
      { title: "Acceptance of Terms", content: ["By accessing or using the Special academy website, enrolling in our programs, or interacting with our services, you agree to be bound by these Terms of Service. If you do not agree with any part of these terms, you should not use our website or services.", "These terms apply to all visitors, students, parents, and any other users of our platform and services.", "We reserve the right to update or modify these terms at any time without prior notice. Continued use of our services after any changes constitutes acceptance of the modified terms."] },
      { title: "Eligibility and Enrollment", content: ["Admission to our cadet preparation programs is subject to meeting the eligibility criteria specified for each program, including age requirements, academic qualifications, and physical fitness standards.", "All information provided during enrollment must be accurate, complete, and truthful. Providing false or misleading information may result in immediate termination of enrollment.", "Enrollment confirmation is subject to availability and completion of all required documentation and fee payment.", "We reserve the right to refuse or cancel enrollment at our discretion, with appropriate refunds issued as per our refund policy."] },
      { title: "User Responsibilities", content: ["Users agree to use our website and services only for lawful purposes and in accordance with these terms.", "You are responsible for maintaining the confidentiality of any account credentials provided to you and for all activities that occur under your account.", "You agree not to engage in any conduct that could damage, disable, or impair our website or interfere with other users' access and enjoyment.", "Students enrolled in our programs must adhere to the academy's code of conduct, discipline policies, and academic requirements."] },
      { title: "Intellectual Property", content: ["All content on our website, including text, graphics, logos, images, course materials, and software, is the property of Special academy or its content providers and is protected by applicable intellectual property laws.", "You may not reproduce, distribute, modify, create derivative works from, or commercially exploit any content from our website without our prior written consent.", "Course materials provided to enrolled students are for personal educational use only and may not be shared, reproduced, or distributed to third parties."] },
      { title: "Prohibited Activities", content: ["You agree not to use our website or services for any unlawful purpose or in violation of any applicable laws or regulations.", "Prohibited activities include, but are not limited to: hacking, introducing malicious code, attempting to gain unauthorized access, scraping data, or interfering with website security features.", "Harassment, discrimination, or any form of misconduct towards academy staff, faculty, or fellow students will not be tolerated and may result in immediate dismissal from programs.", "Any attempt to circumvent payment requirements, access restricted areas without authorization, or impersonate another individual is strictly prohibited."] },
      { title: "Limitation of Liability", content: ["Special academy shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of our website or services.", "While we strive to provide accurate and up-to-date information, we make no warranties regarding the completeness, reliability, or accuracy of content on our website.", "We are not responsible for the content or practices of third-party websites linked from our site. Such links are provided for convenience only.", "Our total liability for any claim arising from these terms or your use of our services shall not exceed the total fees paid by you for the specific program in question."] },
      { title: "Contact and Communication", content: ["By providing your contact information, you consent to receive communications from us regarding your enrollment, program updates, and academy announcements via phone, email, or SMS.", "You may opt out of promotional communications at any time; however, transactional and administrative communications related to your enrollment will continue as necessary.", "For questions or concerns regarding these terms, please contact us through the information provided on our Contact page."] },
    ] },
  },
  seo: { metaDescription: "", gaTrackingId: "" },
};

export const initialEnrollments = [
  { id: "1", fullName: "Arafat Hossain", email: "arafat@example.com", interestedCourse: "Cadet Entrance Preparation", qualificationId: "qual-1", createdAt: "2025-12-01", status: "pending" as const },
  { id: "2", fullName: "Tasnim Rahman", email: "tasnim@example.com", interestedCourse: "Scholarship Preparation", qualificationId: "qual-2", createdAt: "2025-12-02", status: "approved" as const },
  { id: "3", fullName: "Sadia Islam", email: "sadia@example.com", interestedCourse: "Leadership Development", qualificationId: "qual-3", createdAt: "2025-12-03", status: "pending" as const },
  { id: "4", fullName: "Rafiq Ahmed", email: "rafiq@example.com", interestedCourse: "Foundation Classes", qualificationId: "qual-4", createdAt: "2025-12-04", status: "rejected" as const },
  { id: "5", fullName: "Nusrat Jahan", email: "nusrat@example.com", interestedCourse: "Spoken English", qualificationId: "qual-5", createdAt: "2025-12-05", status: "approved" as const },
];

export function createSeedSubcategories(): Subcategory[] { /* same as original */
  const now = new Date().toISOString();
  return [
    { id: "sub-1", courseId: "1", title: "General Knowledge", thumbnail: "https://images.unsplash.com/photo-1544717305-2782549b5136?w=200&q=80", shortDescription: "Comprehensive GK covering history, geography, science and current affairs.", createdAt: now, status: "free", hidden: false, items: [
      { id: "item-1", subcategoryId: "sub-1", type: "video", title: "GK - Introduction to World Geography", description: "Overview of continents and oceans.", url: "https://www.youtube.com/embed/dQw4w9WgXcQ", duration: "12:30", createdAt: now, status: "free", hidden: false },
      { id: "item-2", subcategoryId: "sub-1", type: "pdf", title: "GK Study Notes - Chapter 1", description: "Complete study notes with diagrams.", url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf", createdAt: now, status: "paid", hidden: false },
      { id: "item-3", subcategoryId: "sub-1", type: "video", title: "Current Affairs - Monthly Review", description: "Important current events summarized.", url: "https://www.youtube.com/embed/dQw4w9WgXcQ", duration: "18:45", createdAt: now, status: "free", hidden: false },
    ] },
    { id: "sub-2", courseId: "1", title: "English Language", thumbnail: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=200&q=80", shortDescription: "Grammar, vocabulary, comprehension and essay writing skills.", createdAt: now, status: "free", hidden: false, items: [
      { id: "item-4", subcategoryId: "sub-2", type: "video", title: "English Grammar - Tenses", description: "Complete guide to English tenses.", url: "https://www.youtube.com/embed/dQw4w9WgXcQ", duration: "15:20", createdAt: now, status: "free", hidden: false },
      { id: "item-5", subcategoryId: "sub-2", type: "pdf", title: "Vocabulary Builder - 500 Words", description: "Essential vocabulary for cadet exams.", url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf", createdAt: now, status: "free", hidden: false },
    ] },
    { id: "sub-3", courseId: "1", title: "Mathematics", thumbnail: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=200&q=80", shortDescription: "Arithmetic, algebra, geometry and data interpretation.", createdAt: now, status: "paid", hidden: false, items: [
      { id: "item-6", subcategoryId: "sub-3", type: "video", title: "Algebra Basics", description: "Linear equations and quadratic formulas.", url: "https://www.youtube.com/embed/dQw4w9WgXcQ", duration: "22:10", createdAt: now, status: "paid", hidden: false },
      { id: "item-7", subcategoryId: "sub-3", type: "pdf", title: "Math Formula Sheet", description: "All important formulas in one place.", url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf", createdAt: now, status: "paid", hidden: false },
    ] },
    { id: "sub-4", courseId: "1", title: "Intelligence (IQ)", thumbnail: "https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=200&q=80", shortDescription: "Logical reasoning, pattern recognition and mental ability.", createdAt: now, status: "free", hidden: false, items: [
      { id: "item-8", subcategoryId: "sub-4", type: "video", title: "IQ Test Strategies", description: "Tips and tricks for IQ tests.", url: "https://www.youtube.com/embed/dQw4w9WgXcQ", duration: "10:15", createdAt: now, status: "free", hidden: false },
    ] },
    { id: "sub-5", courseId: "2", title: "Advanced Mathematics", thumbnail: "https://images.unsplash.com/photo-1509228627152-72ae9ae6848d?w=200&q=80", shortDescription: "Advanced topics for scholarship exams.", createdAt: now, status: "free", hidden: false, items: [
      { id: "item-9", subcategoryId: "sub-5", type: "video", title: "Number Systems", description: "Understanding number theory.", url: "https://www.youtube.com/embed/dQw4w9WgXcQ", duration: "14:30", createdAt: now, status: "free", hidden: false },
      { id: "item-10", subcategoryId: "sub-5", type: "pdf", title: "Practice Problems Set 1", description: "100 practice problems with solutions.", url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf", createdAt: now, status: "paid", hidden: false },
    ] },
    { id: "sub-6", courseId: "2", title: "English Literature", thumbnail: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=200&q=80", shortDescription: "Literary analysis and advanced comprehension.", createdAt: now, status: "free", hidden: false, items: [
      { id: "item-11", subcategoryId: "sub-6", type: "video", title: "Poetry Analysis", description: "How to analyze poems effectively.", url: "https://www.youtube.com/embed/dQw4w9WgXcQ", duration: "20:00", createdAt: now, status: "free", hidden: false },
    ] },
    { id: "sub-7", courseId: "3", title: "Science Fundamentals", thumbnail: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=200&q=80", shortDescription: "Physics, chemistry and biology fundamentals.", createdAt: now, status: "free", hidden: false, items: [
      { id: "item-12", subcategoryId: "sub-7", type: "video", title: "Introduction to Physics", description: "Basic concepts of motion and force.", url: "https://www.youtube.com/embed/dQw4w9WgXcQ", duration: "16:40", createdAt: now, status: "free", hidden: false },
      { id: "item-13", subcategoryId: "sub-7", type: "pdf", title: "Science Lab Manual", description: "Lab experiments and procedures.", url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf", createdAt: now, status: "free", hidden: false },
    ] },
  ];
}

export function createSeedNotices(): Notice[] {
  return [
    { id: "notice-1", title: "Admission Open for 2026-27 Session", content: "We are pleased to announce that admissions for the 2026-27 academic session are now open. Interested candidates can apply online or visit our campus for more information.", category: "admission", date: "2026-01-15", isPinned: true, author: "Admin", image: "" },
    { id: "notice-2", title: "Mock Test Schedule Released", content: "The schedule for upcoming mock tests has been released. All students are requested to check the schedule and prepare accordingly.", category: "exam", date: "2026-01-10", isPinned: false, author: "Admin", image: "" },
    { id: "notice-3", title: "Parent-Teacher Meeting", content: "The quarterly parent-teacher meeting is scheduled for next week. Parents are requested to attend.", category: "event", date: "2026-01-05", isPinned: false, author: "Admin", image: "" },
  ];
}

export function createSeedExamCategories(): ExamCategory[] {
  return [
    { id: "exam-cat-1", name: "General Knowledge", description: "Test your knowledge of history, geography, science and current affairs.", color: "bg-emerald-100 text-emerald-800", createdAt: new Date().toISOString() },
    { id: "exam-cat-2", name: "Mathematics", description: "Arithmetic, algebra, geometry and data interpretation.", color: "bg-blue-100 text-blue-800", createdAt: new Date().toISOString() },
    { id: "exam-cat-3", name: "English", description: "Grammar, vocabulary, comprehension and writing skills.", color: "bg-amber-100 text-amber-800", createdAt: new Date().toISOString() },
  ];
}

export function createSeedExamSubcategories(): ExamSubcategory[] {
  const now = new Date().toISOString();
  return [
    { id: "exam-sub-1", categoryId: "exam-cat-1", name: "GK Set 1", description: "General Knowledge - Set 1 covering history, geography, and science.", color: "bg-emerald-100 text-emerald-800", createdAt: now },
    { id: "exam-sub-2", categoryId: "exam-cat-1", name: "GK Set 2", description: "General Knowledge - Set 2 covering current affairs and civics.", color: "bg-emerald-100 text-emerald-800", createdAt: now },
    { id: "exam-sub-3", categoryId: "exam-cat-2", name: "Math Set 1", description: "Mathematics - Set 1 covering arithmetic and algebra.", color: "bg-blue-100 text-blue-800", createdAt: now },
    { id: "exam-sub-4", categoryId: "exam-cat-3", name: "English Set 1", description: "English - Set 1 covering grammar and vocabulary.", color: "bg-amber-100 text-amber-800", createdAt: now },
  ];
}

export function createSeedQuestions(): Question[] {
  const now = new Date().toISOString();
  return [
    { id: "q-1", categoryId: "exam-cat-1", subcategoryId: "exam-sub-1", type: "mcq", question: "What is the capital of Nepal?", options: ["Kathmandu", "Pokhara", "Lalitpur", "Bhaktapur"], answer: "Kathmandu", explanation: "Kathmandu is the capital and largest city of Nepal.", createdAt: now },
    { id: "q-2", categoryId: "exam-cat-1", subcategoryId: "exam-sub-1", type: "mcq", question: "Which planet is known as the Red Planet?", options: ["Venus", "Mars", "Jupiter", "Saturn"], answer: "Mars", explanation: "Mars appears reddish due to iron oxide on its surface.", createdAt: now },
    { id: "q-3", categoryId: "exam-cat-1", subcategoryId: "exam-sub-2", type: "subjective", question: "Explain the importance of discipline in a cadet's life.", options: [], answer: "Discipline is crucial for cadets as it builds character, instills punctuality, and develops leadership qualities necessary for military service.", explanation: "Discipline forms the foundation of cadet training.", createdAt: now },
    { id: "q-4", categoryId: "exam-cat-2", subcategoryId: "exam-sub-3", type: "mcq", question: "What is 15% of 200?", options: ["25", "30", "35", "40"], answer: "30", explanation: "15% of 200 = (15/100) × 200 = 30.", createdAt: now },
    { id: "q-5", categoryId: "exam-cat-2", subcategoryId: "exam-sub-3", type: "mcq", question: "What is the square root of 144?", options: ["10", "11", "12", "13"], answer: "12", explanation: "12 × 12 = 144.", createdAt: now },
    { id: "q-6", categoryId: "exam-cat-2", subcategoryId: "exam-sub-3", type: "subjective", question: "Solve: 5x + 3 = 18. Find x.", options: [], answer: "x = 3", explanation: "5x + 3 = 18 -> 5x = 15 -> x = 3.", createdAt: now },
    { id: "q-7", categoryId: "exam-cat-3", subcategoryId: "exam-sub-4", type: "mcq", question: "What is the synonym of 'Brave'?", options: ["Cowardly", "Courageous", "Timid", "Weak"], answer: "Courageous", explanation: "Brave and courageous are synonyms.", createdAt: now },
    { id: "q-8", categoryId: "exam-cat-3", subcategoryId: "exam-sub-4", type: "mcq", question: "Which of the following is a noun?", options: ["Run", "Beautiful", "Happiness", "Quickly"], answer: "Happiness", explanation: "Happiness is a noun representing a state of being.", createdAt: now },
    { id: "q-9", categoryId: "exam-cat-3", subcategoryId: "exam-sub-4", type: "subjective", question: "Write a short paragraph about your aspirations to join the cadet academy.", options: [], answer: "Model answer: I aspire to join the cadet academy to develop leadership skills, build character, and serve my nation with honor and discipline.", explanation: "Answers should reflect genuine motivation and understanding of cadet life.", createdAt: now },
  ];
}

export function createSeedAttempts(): ExamAttempt[] {
  const now = new Date();
  return [
    { id: "att-1", categoryId: "exam-cat-1", subcategoryId: "exam-sub-1", studentName: "Arafat Hossain", answers: [{ questionId: "q-1", answer: "Kathmandu", correct: true }, { questionId: "q-2", answer: "Mars", correct: true }], score: 2, total: 2, completedAt: new Date(now.getTime() - 86400000).toISOString() },
    { id: "att-2", categoryId: "exam-cat-1", subcategoryId: "exam-sub-1", studentName: "Rahul Sharma", answers: [{ questionId: "q-1", answer: "Pokhara", correct: false }, { questionId: "q-2", answer: "Mars", correct: true }], score: 1, total: 2, completedAt: new Date(now.getTime() - 172800000).toISOString() },
    { id: "att-3", categoryId: "exam-cat-1", subcategoryId: "exam-sub-2", studentName: "Priya Thapa", answers: [{ questionId: "q-3", answer: "", correct: false }], score: 0, total: 1, completedAt: new Date(now.getTime() - 259200000).toISOString() },
    { id: "att-4", categoryId: "exam-cat-2", subcategoryId: "exam-sub-3", studentName: "Arafat Hossain", answers: [{ questionId: "q-4", answer: "30", correct: true }, { questionId: "q-5", answer: "12", correct: true }, { questionId: "q-6", answer: "x = 3", correct: true }], score: 3, total: 3, completedAt: new Date(now.getTime() - 43200000).toISOString() },
    { id: "att-5", categoryId: "exam-cat-2", subcategoryId: "exam-sub-3", studentName: "Sneha KC", answers: [{ questionId: "q-4", answer: "25", correct: false }, { questionId: "q-5", answer: "12", correct: true }, { questionId: "q-6", answer: "x = 5", correct: false }], score: 1, total: 3, completedAt: new Date(now.getTime() - 86400000).toISOString() },
    { id: "att-6", categoryId: "exam-cat-3", subcategoryId: "exam-sub-4", studentName: "Bikram Adhikari", answers: [{ questionId: "q-7", answer: "Courageous", correct: true }, { questionId: "q-8", answer: "Happiness", correct: true }, { questionId: "q-9", answer: "I want to join cadet academy to become a strong leader and serve my country with pride and dedication.", correct: true }], score: 3, total: 3, completedAt: new Date(now.getTime() - 7200000).toISOString() },
  ];
}
