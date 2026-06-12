"use client";

import {
  LayoutDashboard,
  Users,
  BookOpen,
  ClipboardCheck,
  Bell,
  FileText,
  MessageSquare,
  Settings,
  HelpCircle,
  GraduationCap,
  Tags,
  ImageIcon,
  ArrowRight,
  LogIn,
  Eye,
  BarChart3,
} from "lucide-react";

const sections = [
  {
    id: "login",
    title: "Logging In (Admin Portal)",
    icon: LogIn,
    steps: [
      { step: "1", title: "Open the Admin Login Modal", desc: "Go to the public website. To open the hidden admin login, either: (A) Press Ctrl + Shift + K on your keyboard, OR (B) Quickly tap the academy logo in the top-left corner 5 times within 2 seconds. A passcode screen will appear." },
      { step: "2", title: "Enter the Passcode", desc: "Type the admin passcode into the input field. The default passcode is 'admin@123' (your academy may have changed this). Click 'Verify Passcode' to proceed." },
      { step: "3", title: "Enter Your Credentials", desc: "Enter your admin email address and password. Click 'Sign In'." },
      { step: "4", title: "You Are In", desc: "On success, you will be redirected to the Admin Dashboard. If you close your browser, you will need to log in again — admin sessions do not persist across browser restarts for security." },
    ],
    tips: [
      "If the passcode does not work, contact the system administrator.",
      "Make sure you are using the admin login modal, not the public student login page.",
    ],
  },
  {
    id: "dashboard",
    title: "Dashboard — What You Can Monitor",
    icon: LayoutDashboard,
    items: [
      "The dashboard is your command center. It shows 4 summary cards at the top:",
      "• Total Students — The total number of student records in the system.",
      "• Active Courses — How many courses are currently published and available.",
      "• New Enrollments — Recent applications that need your attention.",
      "• Pending Notices — Notices that have been drafted but not yet published.",
      "Below the cards, you will see quick-action buttons: 'View Enrollments' takes you directly to the enrollment review page, and 'Publish Notice' opens the notice creation page.",
      "On the right side, a Recent Notices panel shows the latest announcements at a glance.",
      "The left sidebar gives you access to all management pages. The current page is highlighted.",
      "In the top-right corner, you will see your profile avatar and a bell icon for notifications about new enrollments and contact form submissions.",
    ],
  },
  {
    id: "students",
    title: "Students — Managing & Monitoring Student Records",
    icon: Users,
    steps: [
      { step: "1", title: "View Students", desc: 'Go to Students in the sidebar. You will see a table of all student records with name, email, phone, class, and status (Active/Inactive).' },
      { step: "2", title: "Search & Filter", desc: "Use the search box to find a student by name or email. Use the filter dropdown to show All, Active, or Inactive students. This helps you quickly find specific students." },
      { step: "3", title: "Add a Student Manually", desc: 'Click "Add Student" and fill in the form: name, email, phone, class level, and status. Click "Save". This is useful if you need to register a student directly without going through the enrollment process.' },
      { step: "4", title: "Edit a Student", desc: "Click the pencil icon next to any student. Update any field and click 'Save'. Changes take effect immediately." },
      { step: "5", title: "Delete a Student", desc: "Click the trash icon next to any student. Confirm the deletion. Use this carefully — deleted records cannot be recovered." },
    ],
    items: [
      "You can monitor the total number of students, their enrollment statuses, and which courses they are taking.",
      "Student accounts can be activated or deactivated anytime from this page.",
    ],
  },
  {
    id: "enrollments",
    title: "Enrollments — Processing & Monitoring Applications",
    icon: FileText,
    items: [
      "This is where all public enrollment applications appear. You can monitor the entire pipeline from application to approval.",
      "Applications have four statuses:",
      "• Unverified — The student applied but has not verified their email yet.",
      "• Pending — Email is verified. Waiting for you to review and decide.",
      "• Approved — You accepted the application. A student account was created automatically, and an approval email was sent.",
      "• Rejected — You declined the application. The student received a rejection email with your reason.",
      "To review an application: Click the eye icon to see the full details (personal info, course selection, guardian details, address, and message).",
      "To approve: Click 'Approve'. The system creates a student account, assigns them to the selected course, and sends an approval email. The student can now log in.",
      "To reject: Click 'Reject', type a reason explaining why, and the student will receive a rejection email.",
      "You can monitor how many applications are pending and process them in bulk.",
    ],
  },
  {
    id: "courses",
    title: "Courses — Creating, Managing & Monitoring Content",
    icon: BookOpen,
    steps: [
      { step: "1", title: "Add a Course", desc: 'Go to Courses and click "Add Course". Fill in: title, slug (auto-generated), description, duration, class level, category, price, and image URL. Click "Save".' },
      { step: "2", title: "Course List", desc: "All courses appear as cards on the main Courses page. Each card shows the title, category, class level, and price. You can edit or delete any course from here." },
      { step: "3", title: "Add Subcategories (Chapters)", desc: "Click on a course to open its detail page. Here you can add Subcategories — these are chapters or topics within the course. Give each a title and description." },
      { step: "4", title: "Add Learning Items", desc: "Inside each subcategory, add Items. Items are the actual learning materials. Choose the type: Video (YouTube/Vimeo URL), PDF (document URL), or Image (image URL). Add a title and the link." },
      { step: "5", title: "Monitor Progress", desc: "When students mark items as complete, their progress updates automatically. You can see overall progress for each course but cannot change it — only students can mark items." },
      { step: "6", title: "Automatic Notifications", desc: "When you add new content to a course, all enrolled students receive an in-app notification automatically. No need to notify them separately." },
    ],
  },
  {
    id: "exams",
    title: "Exams — Managing Questions & Monitoring Results",
    icon: ClipboardCheck,
    steps: [
      { step: "1", title: "Exam Categories", desc: 'Go to Exams. Here you can add exam categories (subjects) like "Mathematics", "English", "General Knowledge", etc. Each category can have a name, description, and color for easy identification.' },
      { step: "2", title: "Add MCQ Questions", desc: "Inside a category, click 'Add Question'. Choose 'MCQ' type. Enter the question text, 4 answer options, select the correct one, and add an explanation. This explanation will show to students after they submit." },
      { step: "3", title: "Add Subjective Questions", desc: "Choose 'Subjective' type. Enter the question and a model answer. The model answer helps reviewers evaluate student responses." },
      { step: "4", title: "Print Question Bank", desc: "Click 'Print PDF' to generate a printable PDF of all questions in a category. Useful for offline exams or classroom use." },
      { step: "5", title: "View Results", desc: "Click 'View Results' to see how students performed. You can see each student's score, which questions they got right/wrong, and their subjective answers for manual review." },
    ],
    items: [
      "You can monitor which exams students have taken, their scores, and identify areas where students struggle.",
      "Use this data to improve your teaching materials or create targeted revision content.",
    ],
  },
  {
    id: "notices",
    title: "Notices — Publishing & Monitoring Announcements",
    icon: Bell,
    steps: [
      { step: "1", title: "View All Notices", desc: 'Go to Notices in the sidebar. You will see a list of all published notices with their title, category, author, and publish date.' },
      { step: "2", title: "Publish a Notice", desc: 'Click "Publish Notice". Enter the title, content (full announcement text), category (Admission, Exam, Holiday, Event, or Announcement), and author name.' },
      { step: "3", title: "Category Colors", desc: "Each category has a unique color: Admission (green), Exam (amber), Holiday (sky blue), Event (purple), Announcement (gray). This helps students quickly identify notice types." },
      { step: "4", title: "Automatic Notifications", desc: 'Click "Save" to publish. All students immediately receive an in-app notification. You can monitor which notices are live and delete outdated ones.' },
    ],
  },
  {
    id: "faculty",
    title: "Faculty — Managing Staff Profiles",
    icon: GraduationCap,
    steps: [
      { step: "1", title: "View Faculty", desc: 'Go to Faculty in the sidebar. You will see a grid of all faculty/staff profiles.' },
      { step: "2", title: "Add Faculty", desc: 'Click "Add Faculty Member". Fill in their name, role/position, and image URL. Click "Save".' },
      { step: "3", title: "Edit or Delete", desc: "Click the pencil or trash icon to edit or remove a faculty member. The public Team page updates automatically." },
    ],
  },
  {
    id: "faqs",
    title: "FAQs — Managing Frequently Asked Questions",
    icon: HelpCircle,
    items: [
      'Go to FAQs in the sidebar. Here you can add questions and answers that appear on the public FAQ section.',
      "Click 'Add FAQ' to create a new entry. Enter the question and the answer.",
      "You can reorder FAQs by dragging them up or down (drag handle on the left).",
      "Edit or delete existing FAQs using the pencil or trash icons.",
    ],
  },
  {
    id: "blog",
    title: "Blog — Writing & Publishing Articles",
    icon: FileText,
    steps: [
      { step: "1", title: "Create a Post", desc: 'Go to Blog and click "Add Post". You will see a rich text editor with formatting tools (bold, italic, lists, headings, etc.).' },
      { step: "2", title: "Add Content", desc: "Write your article. Add a featured image URL. Add tags (comma-separated) for categorization. The slug is auto-generated from the title." },
      { step: "3", title: "Save or Publish", desc: "Click 'Save as Draft' to keep it unpublished. Click 'Publish' to make it live on the public Blog page. You can switch between draft and published anytime." },
      { step: "4", title: "Manage Posts", desc: "Edit, delete, or toggle publish status from the blog list view." },
    ],
  },
  {
    id: "categories",
    title: "Categories — Managing Course & Notice Categories",
    icon: Tags,
    items: [
      'Go to Categories in the sidebar. Two tabs are available: "Course Categories" and "Notice Categories".',
      "Course Categories — Add categories like 'Cadet Preparation', 'Scholarship', etc. These appear on the Courses page filter.",
      "Notice Categories — Add categories like 'Admission', 'Exam', 'Holiday', etc. Each has a color for visual identification.",
      "Edit or delete categories as needed.",
    ],
  },
  {
    id: "testimonials",
    title: "Testimonials — Managing Student & Parent Reviews",
    icon: MessageSquare,
    items: [
      'Go to Testimonials. Here you can add reviews from students and parents that appear on the public Testimonials page.',
      "Click 'Add Testimonial'. Enter the person's name, their image URL, their role (e.g., 'Student' or 'Parent'), and their review text.",
      "Edit or delete testimonials using the pencil or trash icons.",
    ],
  },
  {
    id: "gallery",
    title: "Gallery — Uploading & Managing Photos",
    icon: ImageIcon,
    items: [
      'Go to Gallery. Upload photos that will appear on the public Gallery page.',
      "Click 'Add Image' and enter the image URL. The image will display on the public gallery.",
      "You can delete images from the gallery list.",
    ],
  },
  {
    id: "contact",
    title: "Contact Submissions — Monitoring Messages",
    icon: MessageSquare,
    items: [
      "Messages from the public Contact form appear here. You can monitor all incoming inquiries in one place.",
      "Unread messages have a blue 'New' badge for easy identification.",
      "Click any message to expand and read the full content (name, email, subject, and message).",
      "Mark messages as Read or Unread to track which ones you have handled.",
      "Delete spam or resolved messages to keep the list clean.",
      "You will receive an in-app notification whenever a new contact submission arrives.",
    ],
  },
  {
    id: "settings",
    title: "Settings — Controlling the Entire Platform",
    icon: Settings,
    items: [
      "Settings has 5 tabs that let you control every aspect of the academy platform:",
      "",
      "Tab 1: Profile — Update your admin name, upload an avatar, and change your password.",
      "",
      "Tab 2: Site Settings — Control the academy's public identity:",
      "• Academy Info: Name, tagline, description, address, and app icon (the logo shown everywhere).",
      "• Contact Info: Email, phone number, office hours, and holiday/closing day.",
      "• Social Links: Add links to Facebook, Instagram, TikTok, and YouTube. These appear in the website footer.",
      "",
      "Tab 3: Landing Content — Control what visitors see on the homepage:",
      "• Hero Section: Title, subtitle, and background image.",
      "• About Section: Title, description, and value propositions (add/remove as needed).",
      "• Stats: Numbers like 'Students Enrolled', 'Years of Experience', etc.",
      "• Call to Action: The 'Apply Now' banner at the bottom of the homepage.",
      "• Footer: Copyright text and description.",
      "",
      "Tab 4: Sections — Turn entire sections of the landing page on or off:",
      "• Toggle visibility for: Hero, About, Courses, Notices, Testimonials, Gallery, Blog, Team, Contact, FAQ, and Stats sections.",
      "• When a section is turned off, it simply does not appear on the public website.",
      "",
      "Tab 5: SEO & Features — Technical controls:",
      "• Meta Description: The description that appears in search engine results.",
      "• Google Analytics ID: Connect your Google Analytics account.",
      "• Enable Blog: Turn the blog feature on or off for the entire site.",
      "• Maintenance Mode: When enabled, visitors see a maintenance page instead of the website. You can still access the admin dashboard.",
    ],
  },
  {
    id: "notifications",
    title: "Notifications — What You Get Alerts For",
    icon: Bell,
    items: [
      "As an admin, you receive in-app notifications (bell icon in the top bar) for:",
      "• New Enrollment Application — When someone submits a new enrollment application.",
      "• New Contact Form Submission — When someone sends a message through the Contact page.",
      "Click the bell icon to see your notifications. Unread items have a blue dot.",
      "You can 'Mark read' individual notifications or 'Mark all read' to clear everything.",
    ],
  },
];

export default function AdminGuidePage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-primary mb-2">Admin Guide</h1>
        <p className="text-muted text-sm">
          A complete walkthrough of the Admin Dashboard — how to log in, monitor activity, manage content, and control the entire academy platform.
        </p>
      </div>

      <div className="space-y-6">
        {sections.map((section) => (
          <div key={section.id} id={section.id} className="bg-white rounded-xl border border-primary/5 p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-9 h-9 rounded-lg bg-primary/5 flex items-center justify-center">
                <section.icon className="w-5 h-5 text-primary" />
              </div>
              <h2 className="text-lg font-bold text-primary">{section.title}</h2>
            </div>

            {"steps" in section && section.steps ? (
              <div className="space-y-4">
                {section.steps.map((s) => (
                  <div key={s.step} className="flex gap-3">
                    <div className="w-7 h-7 rounded-full bg-primary text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                      {s.step}
                    </div>
                    <div>
                      <h3 className="font-semibold text-primary text-sm mb-0.5">{s.title}</h3>
                      <p className="text-muted text-sm leading-relaxed">{s.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : null}

            {"tips" in section && section.tips ? (
              <div className="mt-4 bg-amber-50 border border-amber-200 rounded-lg p-3">
                <p className="text-xs font-semibold text-amber-800 mb-1">Tips</p>
                <ul className="space-y-1">
                  {section.tips.map((tip, i) => (
                    <li key={i} className="text-xs text-amber-700 flex items-start gap-2">
                      <span>•</span>
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            {"items" in section && section.items ? (
              <ul className="space-y-2">
                {section.items.map((item, i) => (
                  <li key={i} className={`flex items-start gap-2.5 text-sm leading-relaxed ${item === "" ? "h-2" : "text-muted"}`}>
                    {item ? <ArrowRight className="w-3.5 h-3.5 text-primary mt-0.5 shrink-0" /> : null}
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}
