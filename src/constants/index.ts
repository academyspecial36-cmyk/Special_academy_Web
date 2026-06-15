export const SITE_NAME = "Special academy";
export const SITE_TAGLINE = "Preparing Future Leaders Through Discipline & Excellence";

export const NAV_ITEMS = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Courses", href: "/courses" },
  { label: "Notices", href: "/notices" },
  { label: "Testimonials", href: "/testimonials" },
  { label: "Blog", href: "/blog" },
  { label: "Gallery", href: "/gallery" },
  { label: "Team", href: "/team" },
  { label: "Contact", href: "/contact" },
];

export type SidebarItem =
  | { type: "link"; label: string; href: string; icon: string }
  | { type: "group"; label: string; icon: string; children: { label: string; href: string; icon: string }[] };

export const DASHBOARD_SIDEBAR: SidebarItem[] = [
  { type: "link", label: "Dashboard", href: "/dashboard", icon: "LayoutDashboard" },
  {
    type: "group", label: "Content", icon: "BookOpen",
    children: [
      { label: "Courses", href: "/dashboard/courses", icon: "BookOpen" },
      { label: "Media", href: "/dashboard/media", icon: "ImageIcon" },
      { label: "Notices", href: "/dashboard/notices", icon: "Bell" },
      { label: "Blog", href: "/dashboard/blog", icon: "FileText" },
      { label: "FAQs", href: "/dashboard/faqs", icon: "HelpCircle" },
      { label: "Gallery", href: "/dashboard/gallery", icon: "ImageIcon" },
      { label: "Notes", href: "/dashboard/notes", icon: "StickyNote" },
      { label: "Testimonials", href: "/dashboard/testimonials", icon: "MessageSquare" },
      { label: "Faculty", href: "/dashboard/faculty", icon: "GraduationCap" },
    ],
  },
  {
    type: "group", label: "People", icon: "Users",
    children: [
      { label: "Students", href: "/dashboard/students", icon: "Users" },
      { label: "Enrollments", href: "/dashboard/enrollments", icon: "FileText" },
    ],
  },
  {
    type: "group", label: "Academics", icon: "ClipboardCheck",
    children: [
      { label: "Exams", href: "/dashboard/exams", icon: "ClipboardCheck" },
    ],
  },
  {
    type: "group", label: "System", icon: "Settings",
    children: [
      { label: "Categories", href: "/dashboard/categories", icon: "Tags" },
      { label: "Communications", href: "/dashboard/communications", icon: "Megaphone" },
      { label: "Contact", href: "/dashboard/contact-submissions", icon: "MessageSquare" },
      { label: "Settings", href: "/dashboard/settings", icon: "Settings" },
      { label: "Guide", href: "/dashboard/guide", icon: "BookOpen" },
    ],
  },
];

export const STUDENT_NAV = [
  { label: "Dashboard", href: "/student", icon: "LayoutDashboard" },
  { label: "My Courses", href: "/student/courses", icon: "BookOpen" },
  { label: "Exams", href: "/student/exams", icon: "ClipboardCheck" },
  { label: "Notices", href: "/student/notices", icon: "Bell" },
  { label: "Profile", href: "/student/profile", icon: "User" },
  { label: "Guide", href: "/student/guide", icon: "BookOpen" },
];

export const NOTICE_CATEGORIES = [
  { value: "admission", label: "Admission", color: "bg-emerald-100 text-emerald-800" },
  { value: "exam", label: "Exam", color: "bg-amber-100 text-amber-800" },
  { value: "holiday", label: "Holiday", color: "bg-sky-100 text-sky-800" },
  { value: "event", label: "Event", color: "bg-violet-100 text-violet-800" },
  { value: "announcement", label: "Announcement", color: "bg-slate-100 text-slate-800" },
];

export const COURSE_CATEGORIES = [
  "All",
  "Cadet Preparation",
  "Scholarship",
  "Foundation",
  "Leadership",
  "Language",
  "Physical",
];

export const CLASS_LEVELS = [
  "Class 12",
  "Becholor"
];
