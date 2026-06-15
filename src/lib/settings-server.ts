import { createServiceRoleSupabase } from "./supabase-server";
import type { SocialLinks } from "./app-context";

export type SectionKey =
  | "hero" | "about" | "whyChoose" | "cadetOverview" | "stats"
  | "courses" | "freeResources" | "notices" | "testimonials" | "faculty"
  | "facilities" | "activities" | "gallery" | "enrollmentCta" | "faq"
  | "contact" | "blog";

export interface LandingConfig {
  hero: {
    title: string;
    subtitle: string;
    badge: string;
    image: string;
  };
  about: {
    title: string;
    description: string;
    image: string;
    values: { title: string; description: string }[];
  };
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
  theme?: {
    primaryColor: string;
    fontFamily: string;
  };
  enablePinnedPopup?: boolean;
  backup?: {
    autoBackup: { enabled: boolean; frequency: string; lastBackup: string | null };
  };
  backupHistory?: {
    id: string;
    timestamp: string;
    type: string;
    destination: string;
    status: string;
    fileSize: number | null;
    errorMessage: string | null;
    fileName: string | null;
  }[];
  privacyPolicy?: {
    title: string;
    description: string;
    lastUpdated: string;
    sections: { title: string; content: string[] }[];
  };
  terms?: {
    title: string;
    description: string;
    lastUpdated: string;
    sections: { title: string; content: string[] }[];
  };
}

export interface AppSettings {
  academyName: string;
  tagline: string;
  description: string;
  address: string;
  email: string;
  admissionEmail: string;
  phone: string;
  secondaryPhone: string;
  website: string;
  officeHours: string;
  holiday: string;
  appIcon: string;
  socialLinks: SocialLinks;
  enableBlog: boolean;
  maintenanceMode: boolean;
  config: LandingConfig;
  seo: { metaDescription: string; gaTrackingId: string };
}

const envDefaults: Partial<AppSettings> = {
  academyName: process.env.NEXT_PUBLIC_SITE_NAME || "Special Academy",
  email: process.env.ADMIN_EMAIL || "info@cadetacademy.edu",
  website: process.env.NEXT_PUBLIC_SITE_URL || "https://cadetacademy.edu",
};

const defaultLandingConfig: LandingConfig = {
  hero: {
    title: "Preparing Future Cadets Through Discipline & Excellence",
    subtitle:
      "We help students develop academic excellence, leadership skills, confidence, and discipline for cadet entrance success. Join Nepal's most trusted cadet preparation academy.",
    badge: "Admission Open for 2026-27 Session",
    image:
      "https://images.unsplash.com/photo-1763656443687-c3de11b68813?q=80&w=687&auto=format&fit=crop",
  },
  about: {
    title: "Building Future Leaders Since 2010",
    description:
      "Special academy has been the trusted choice for parents and students aspiring for cadet college admissions. Our holistic approach combines academic rigor with character building.",
    image:
      "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800&q=80",
    values: [
      {
        title: "Mission",
        description:
          "To prepare disciplined, academically excellent, and morally upright future leaders through comprehensive cadet preparation programs.",
      },
      {
        title: "Discipline",
        description:
          "We instill military-grade discipline, punctuality, and self-control that forms the foundation of successful cadet life.",
      },
      {
        title: "Excellence",
        description:
          "Pursuit of academic and personal excellence is at the core of everything we teach, ensuring our students stand out.",
      },
      {
        title: "Character",
        description:
          "Building strong character, integrity, and leadership qualities that last a lifetime beyond cadet college admission.",
      },
    ],
  },
  stats: [
    { label: "Students Enrolled", value: "2500", suffix: "+", description: "Since 2010" },
    { label: "Success Rate", value: "94", suffix: "%", description: "College admission" },
    { label: "Expert Faculty", value: "35", suffix: "+", description: "Qualified instructors" },
    { label: "Years Experience", value: "15", suffix: "+", description: "In education" },
  ],
  sections: {
    hero: true, about: true, whyChoose: true, cadetOverview: true,
    stats: true, courses: true, freeResources: true, notices: true,
    testimonials: true, faculty: true, facilities: true, activities: true,
    gallery: true, enrollmentCta: true, faq: true, contact: true, blog: true,
  },
  cta: {
    title: "Start Your Cadet Journey Today",
    subtitle: "Join Nepal's most trusted cadet preparation academy and take the first step toward a disciplined, successful future.",
    buttonText: "Enroll Now",
    buttonLink: "/enroll",
  },
  footer: {
    copyright: "© 2026 Special Academy. All rights reserved.",
    description: "Special Academy is Nepal's premier cadet preparation institution, dedicated to shaping disciplined, academically excellent, and morally upright future leaders.",
  },
  whyChoose: [
    { icon: "Users", title: "Expert Faculty", description: "Our team includes retired military officers, subject matter experts, and experienced educators with proven track records." },
    { icon: "BookOpen", title: "Comprehensive Curriculum", description: "Specially designed curriculum covering all aspects of cadet entrance exams with regular updates based on exam patterns." },
    { icon: "Dumbbell", title: "Physical Training", description: "Structured physical fitness programs designed to meet cadet college standards and build lasting endurance." },
    { icon: "ClipboardCheck", title: "Mock Tests & Assessments", description: "Regular mock examinations, weekly assessments, and detailed performance analysis to track progress." },
    { icon: "TrendingUp", title: "Proven Results", description: "94% of our students successfully secure admission to prestigious cadet colleges across the country." },
    { icon: "HeadphonesIcon", title: "Personalized Attention", description: "Small batch sizes ensure every student receives individual attention and customized learning support." },
  ],
  cadetOverview: {
    title: "Complete Cadet Entrance Preparation",
    description: "Our structured program covers every aspect of cadet college admission — from academics to physical fitness to interview readiness.",
    heading: "What We Prepare You For",
    steps: [
      "Comprehensive subject coverage for written exams",
      "Intelligence test and IQ development sessions",
      "Physical fitness assessment and training",
      "Interview skills and personality development",
      "Medical examination preparation guidance",
      "Mock examinations under real exam conditions",
      "Time management and stress handling techniques",
      "Regular parent-teacher progress meetings",
    ],
    images: [
      "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=400&q=80",
      "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&q=80",
      "https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?w=400&q=80",
      "https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?w=400&q=80",
    ],
  },
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
  enrollmentCta: {
    badge: "Admissions Open for 2026-27",
    heading: "Begin Your Journey to Cadet College Today",
    description: "Limited seats available for the upcoming session. Secure your child's future with our proven cadet preparation programs. Early applicants receive a 10% discount.",
    offerTitle: "Limited Time Offer",
    offerText: "Apply before January 15, 2026 to receive a 10% early bird discount on your first semester fee.",
    discount: "10%",
    buttonText: "Apply for Admission",
    buttonLink: "/enrollment",
  },
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
    contact: { label: "Get in Touch", title: "Contact Us", description: "We'd love to hear from you. Reach out with any questions." },
    blog: { label: "From Our Blog", title: "Latest Articles & Tips", description: "Expert advice, study tips, and updates to help you succeed in your cadet entrance journey." },
  },
  buttonLabels: {
    applyNow: "Apply for Admission",
    exploreCourses: "Explore Courses",
    learnMore: "Learn More",
    viewAllCourses: "View All Courses",
    viewAllTeam: "View All Team",
    viewAllTestimonials: "View All Testimonials",
    viewAllArticles: "View All Articles",
    viewAllNotices: "View All Notices",
    viewFullGallery: "View Full Gallery",
    contactUs: "Contact Us",
    sendMessage: "Send Message",
  },
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
  theme: {
    primaryColor: "#07220B",
    fontFamily: "Inter",
  },
  enablePinnedPopup: true,
  privacyPolicy: {
    title: "Privacy Policy",
    description: "Learn how we collect, use, and protect your personal information.",
    lastUpdated: "June 2026",
    sections: [
      { title: "Information We Collect", content: ["We collect information you provide directly to us, including your name, email address, phone number, and academic details.", "We automatically collect certain information when you visit our website, including your IP address, browser type, and browsing patterns.", "We may collect photographs and video footage during academy events with appropriate consent."] },
      { title: "How We Use Your Information", content: ["To process admissions, enrollments, and academic record management.", "To communicate with you regarding program updates and academy-related information.", "To improve our educational services and website experience.", "To comply with legal obligations and maintain academic records."] },
      { title: "Information Sharing", content: ["We do not sell or rent your personal information to third parties.", "We may share information with trusted partners under confidentiality agreements.", "We may disclose information when required by law."] },
      { title: "Data Security", content: ["We implement security measures to protect your personal information.", "All sensitive data is encrypted using industry-standard protocols.", "Access to personal information is restricted to authorized personnel."] },
      { title: "Your Rights", content: ["You have the right to access, update, or request deletion of your data.", "You may opt out of promotional communications at any time.", "You can request a copy of the information we hold about you."] },
    ],
  },
  terms: {
    title: "Terms of Service",
    description: "Review the terms governing the use of our website, programs, and services.",
    lastUpdated: "June 2026",
    sections: [
      { title: "Acceptance of Terms", content: ["By accessing or using our website and services, you agree to these Terms.", "We reserve the right to update these terms at any time.", "Continued use after changes constitutes acceptance."] },
      { title: "Eligibility", content: ["Admission is subject to meeting eligibility criteria.", "All information provided must be accurate and truthful.", "We reserve the right to refuse or cancel enrollment."] },
      { title: "User Responsibilities", content: ["Users agree to use our services only for lawful purposes.", "You are responsible for maintaining account confidentiality.", "Students must adhere to the academy's code of conduct."] },
      { title: "Intellectual Property", content: ["All content is the property of Special academy.", "You may not reproduce or distribute content without permission.", "Course materials are for personal educational use only."] },
      { title: "Limitation of Liability", content: ["We shall not be liable for indirect damages arising from use of our services.", "We make no warranties regarding completeness or accuracy of content.", "Liability is limited to fees paid for the specific program."] },
    ],
  },
};

export function getDefaultSettings(): AppSettings {
  return {
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
    socialLinks: {
      facebook: "",
      instagram: "",
      tiktok: "",
      youtube: "",
    },
    enableBlog: true,
    maintenanceMode: false,
    config: defaultLandingConfig,
    seo: { metaDescription: "", gaTrackingId: "" },
  };
}

export async function seedSettings() {
  const svc = createServiceRoleSupabase();
  const defaults = { ...getDefaultSettings(), ...envDefaults };
  const { error } = await svc.from("settings").insert({
    academy_name: defaults.academyName,
    tagline: defaults.tagline,
    description: defaults.description,
    address: defaults.address,
    email: defaults.email,
    admission_email: defaults.admissionEmail,
    phone: defaults.phone,
    secondary_phone: defaults.secondaryPhone,
    website: defaults.website,
    office_hours: defaults.officeHours,
    holiday: defaults.holiday,
    app_icon: defaults.appIcon,
    social_links: defaults.socialLinks,
    enable_blog: defaults.enableBlog,
    maintenance_mode: defaults.maintenanceMode,
    config: defaults.config,
    seo: defaults.seo,
  });
  if (error) console.error("Failed to seed settings:", error.message);
}

export async function fetchSettings(): Promise<AppSettings> {
  try {
    const svc = createServiceRoleSupabase();
    let { data } = await svc.from("settings").select("*").maybeSingle();
    if (!data) {
      await seedSettings();
      const { data: newData } = await svc.from("settings").select("*").maybeSingle();
      data = newData;
      if (!data) return { ...getDefaultSettings(), ...envDefaults };
    }

    const row = data as Record<string, unknown>;
    const rawConfig = (row.config as Record<string, unknown>) || {};
    const defaultLC = defaultLandingConfig;
    const config: LandingConfig = {
      hero: { ...defaultLC.hero, ...((rawConfig.hero as Record<string, unknown>) || {}) },
      about: { ...defaultLC.about, ...((rawConfig.about as Record<string, unknown>) || {}) },
      stats: Array.isArray(rawConfig.stats) ? (rawConfig.stats as typeof defaultLC.stats) : defaultLC.stats,
      sections: { ...defaultLC.sections, ...(rawConfig.sections || {}) as Record<string, boolean> } as Record<SectionKey, boolean>,
      cta: { ...defaultLC.cta, ...(rawConfig.cta || {}) as Record<string, string> } as { title: string; subtitle: string; buttonText: string; buttonLink: string },
      footer: { ...defaultLC.footer, ...(rawConfig.footer || {}) as Record<string, string> } as { copyright: string; description: string },
      whyChoose: Array.isArray(rawConfig.whyChoose) ? (rawConfig.whyChoose as typeof defaultLC.whyChoose) : defaultLC.whyChoose,
      cadetOverview: { ...defaultLC.cadetOverview, ...((rawConfig.cadetOverview as Record<string, unknown>) || {}) } as typeof defaultLC.cadetOverview,
      facilities: Array.isArray(rawConfig.facilities) ? (rawConfig.facilities as typeof defaultLC.facilities) : defaultLC.facilities,
      activities: Array.isArray(rawConfig.activities) ? (rawConfig.activities as typeof defaultLC.activities) : defaultLC.activities,
      enrollmentCta: { ...defaultLC.enrollmentCta, ...((rawConfig.enrollmentCta as Record<string, unknown>) || {}) } as typeof defaultLC.enrollmentCta,
      heroCards: Array.isArray(rawConfig.heroCards) ? (rawConfig.heroCards as typeof defaultLC.heroCards) : defaultLC.heroCards,
      trustIndicators: { ...defaultLC.trustIndicators, ...((rawConfig.trustIndicators as Record<string, unknown>) || {}) } as typeof defaultLC.trustIndicators,
      sectionLabels: { ...defaultLC.sectionLabels, ...((rawConfig.sectionLabels as Record<string, unknown>) || {}) } as Record<string, { label: string; title: string; description: string }>,
      buttonLabels: { ...defaultLC.buttonLabels, ...((rawConfig.buttonLabels as Record<string, unknown>) || {}) } as typeof defaultLC.buttonLabels,
      loaderQuotes: Array.isArray(rawConfig.loaderQuotes) ? (rawConfig.loaderQuotes as typeof defaultLC.loaderQuotes) : defaultLC.loaderQuotes,
      theme: { ...defaultLC.theme, ...((rawConfig.theme as Record<string, unknown>) || {}) } as typeof defaultLC.theme,
      enablePinnedPopup: rawConfig.enablePinnedPopup != null ? Boolean(rawConfig.enablePinnedPopup) : defaultLC.enablePinnedPopup,
      privacyPolicy: { ...defaultLC.privacyPolicy, ...((rawConfig.privacyPolicy as Record<string, unknown>) || {}) } as typeof defaultLC.privacyPolicy,
      terms: { ...defaultLC.terms, ...((rawConfig.terms as Record<string, unknown>) || {}) } as typeof defaultLC.terms,
    };
    const socialLinks = (row.social_links as SocialLinks) || getDefaultSettings().socialLinks;

    return {
      academyName:
        String(row.academy_name || row.academyName || envDefaults.academyName || getDefaultSettings().academyName),
      tagline: String(row.tagline || getDefaultSettings().tagline),
      description: String(row.description || getDefaultSettings().description),
      address: String(row.address || getDefaultSettings().address),
      email: String(row.email || envDefaults.email || getDefaultSettings().email),
      admissionEmail: String(row.admission_email || row.admissionEmail || getDefaultSettings().admissionEmail),
      phone: String(row.phone || getDefaultSettings().phone),
      secondaryPhone: String(row.secondary_phone || row.secondaryPhone || getDefaultSettings().secondaryPhone),
      website: String(row.website || envDefaults.website || getDefaultSettings().website),
      officeHours: String(row.office_hours || row.officeHours || getDefaultSettings().officeHours),
      holiday: String(row.holiday || getDefaultSettings().holiday),
      appIcon: String(row.app_icon || row.appIcon || getDefaultSettings().appIcon),
      socialLinks,
      enableBlog: row.enable_blog !== false,
      maintenanceMode: row.maintenance_mode === true,
      config,
      seo: {
        metaDescription: String(config.seo?.metaDescription || ""),
        gaTrackingId: String(config.seo?.gaTrackingId || ""),
      },
    };
  } catch {
    return { ...getDefaultSettings(), ...envDefaults };
  }
}
