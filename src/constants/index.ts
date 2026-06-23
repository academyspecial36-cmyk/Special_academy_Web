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
  {
    type: "link",
    label: "Dashboard",
    href: "/dashboard",
    icon: "LayoutDashboard",
  },
  {
    type: "link",
    label: "Analytics",
    href: "/dashboard/analytics",
    icon: "BarChart3",
  },

  {
    type: "group",
    label: "Admissions",
    icon: "Users",
    children: [
      {
        label: "Enrollments",
        href: "/dashboard/enrollments",
        icon: "FileText",
      },
      {
        label: "Students",
        href: "/dashboard/students",
        icon: "Users",
      },
      {
        label: "Contact Inquiries",
        href: "/dashboard/contact-submissions",
        icon: "MessageSquare",
      },
    ],
  },

  {
    type: "group",
    label: "Courses & Learning",
    icon: "GraduationCap",
    children: [
      {
        label: "Courses",
        href: "/dashboard/courses",
        icon: "BookOpen",
      },
      {
        label: "Faculty",
        href: "/dashboard/faculty",
        icon: "GraduationCap",
      },
      {
        label: "Notes",
        href: "/dashboard/notes",
        icon: "StickyNote",
      },
      {
        label: "Exams",
        href: "/dashboard/exams",
        icon: "ClipboardCheck",
      },
      {
        label: "Live Classes",
        href: "/dashboard/live-classes",
        icon: "Video",
      },
    ],
  },

  {
    type: "group",
    label: "Website Content",
    icon: "FileText",
    children: [
      {
        label: "Notices",
        href: "/dashboard/notices",
        icon: "Bell",
      },
      {
        label: "Blog Posts",
        href: "/dashboard/blog",
        icon: "FileText",
      },
      {
        label: "FAQs",
        href: "/dashboard/faqs",
        icon: "HelpCircle",
      },
      {
        label: "Testimonials",
        href: "/dashboard/testimonials",
        icon: "MessageSquare",
      },
      {
        label: "Gallery",
        href: "/dashboard/gallery",
        icon: "ImageIcon",
      },
      {
        label: "Media Library",
        href: "/dashboard/media",
        icon: "ImageIcon",
      },
      {
        label: "My Storage",
        href: "/dashboard/media/storage",
        icon: "HardDrive",
      },
    ],
  },

  {
    type: "group",
    label: "Marketing",
    icon: "Megaphone",
    children: [
      {
        label: "Communications",
        href: "/dashboard/communications",
        icon: "Megaphone",
      },
    ],
  },

  {
    type: "group",
    label: "Administration",
    icon: "Settings",
    children: [
      {
        label: "Categories",
        href: "/dashboard/categories",
        icon: "Tags",
      },
      {
        label: "AI Assistant",
        href: "/dashboard/ai",
        icon: "Sparkles",
      },
      {
        label: "Settings",
        href: "/dashboard/settings",
        icon: "Settings",
      },
      {
        label: "User Guide",
        href: "/dashboard/guide",
        icon: "BookOpen",
      },
    ],
  },
];

export const STUDENT_NAV = [
  { label: "Dashboard", href: "/student", icon: "LayoutDashboard" },
  { label: "My Courses", href: "/student/courses", icon: "BookOpen" },
  { label: "Live Classes", href: "/student/live-classes", icon: "Video" },
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

export const QUALIFICATIONS = [
  "Class 8",
  "Class 9",
  "Class 10",
  "Class 11",
  "Class 12",
  "+2",
  "Bachelor",
  "Master",
];
