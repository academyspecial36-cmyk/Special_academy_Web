import Link from "next/link";
import {
  LayoutDashboard,
  BookOpen,
  ClipboardCheck,
  Bell,
  User,
  LogOut,
  CheckCircle,
  ArrowRight,
  HelpCircle,
  GraduationCap,
} from "lucide-react";

const sections = [
  {
    id: "dashboard",
    title: "Your Dashboard",
    icon: LayoutDashboard,
    items: [
      "After logging in, you land on the Student Dashboard.",
      "You will see four summary cards: Enrolled Courses, Overall Progress (%), Items Completed, and Total Items.",
      "Below the cards, you will find quick links to your courses and the latest notices.",
      "Use the left sidebar to navigate between pages.",
    ],
  },
  {
    id: "courses",
    title: "My Courses — Learning Materials",
    icon: BookOpen,
    steps: [
      { step: "1", title: "View Your Courses", desc: 'Click "My Courses" in the sidebar. You will see all courses you are enrolled in, each with a progress bar.' },
      { step: "2", title: "Open a Course", desc: "Click any course to enter it. The course is divided into chapters (subcategories)." },
      { step: "3", title: "View Learning Items", desc: "Inside each chapter, you will find learning items — Videos (blue icon), PDFs (amber icon), and Images (purple icon)." },
      { step: "4", title: "Preview an Item", desc: "Click any item to open it in a preview window. Videos play inline, PDFs open in a viewer, and images display in a gallery." },
      { step: "5", title: "Mark as Complete", desc: "Click the circle next to an item to mark it as done. The circle turns green with a checkmark. Your overall progress updates automatically." },
    ],
  },
  {
    id: "exams",
    title: "Taking Exams",
    icon: ClipboardCheck,
    steps: [
      { step: "1", title: "Go to Exams", desc: 'Click "Exams" in the sidebar. You will see exam categories like Mathematics, English, etc. with the number of questions in each.' },
      { step: "2", title: "Start an Exam", desc: "Click a category to start. Read the instructions carefully, then begin answering." },
      { step: "3", title: "Answer MCQ Questions", desc: "For multiple-choice questions, click the radio button next to your chosen answer." },
      { step: "4", title: "Answer Subjective Questions", desc: "For written questions, type your answer in the text box provided." },
      { step: "5", title: "Submit Your Exam", desc: 'Click "Submit Exam" when you are finished. MCQ answers are graded automatically.' },
      { step: "6", title: "View Your Results", desc: "You will see your score (correct out of total), percentage, and whether you passed (pass mark: 40%). You can review each question to see the correct answers and explanations." },
    ],
  },
  {
    id: "notices",
    title: "Notices",
    icon: Bell,
    items: [
      'Click "Notices" in the sidebar to see all announcements from the academy.',
      "Notices are color-coded by category: Admission (green), Exam (amber), Holiday (blue), Event (purple), Announcement (gray).",
      "Pinned notices appear first. Each notice shows the date and author.",
      "Click any notice to open a slide-out panel with the full content.",
    ],
  },
  {
    id: "profile",
    title: "Profile & Settings",
    icon: User,
    items: [
      'Click "Profile" in the sidebar to view your information.',
      "You can see your avatar, name, class, student ID, email, phone, address, and guardian details.",
      'Click "Edit Profile" to update your name, phone, address, or guardian information.',
      "Click your avatar image to upload a new profile picture.",
    ],
  },
  {
    id: "notifications",
    title: "Notifications (Bell Icon)",
    icon: Bell,
    items: [
      "The bell icon in the top bar shows your notifications.",
      "A blue dot on a notification means it is unread.",
      "The number on the bell icon shows how many unread notifications you have.",
      "You will get notified when the admin publishes a new notice or adds new course materials.",
      'Click "View" on a notification to go to the related page.',
      'Click "Mark read" to dismiss a notification, or "Mark all read" to clear everything.',
      "A sound plays when new notifications arrive.",
    ],
  },
  {
    id: "logout",
    title: "Signing Out",
    icon: LogOut,
    items: [
      "Click your avatar in the top-right corner.",
      'Click "Sign Out" from the dropdown menu.',
      "You will be redirected to the login page.",
    ],
  },
];

export default function StudentGuidePage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-primary mb-2">Student Guide</h1>
        <p className="text-muted text-sm">
          Everything you need to know about using the Student Portal.
        </p>
      </div>

      <div className="space-y-10">
        {sections.map((section) => (
          <div key={section.id} id={section.id} className="bg-white rounded-xl border border-primary/5 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-9 h-9 rounded-lg bg-primary/5 flex items-center justify-center">
                <section.icon className="w-5 h-5 text-primary" />
              </div>
              <h2 className="text-lg font-bold text-primary">{section.title}</h2>
            </div>

            {"steps" in section && section.steps ? (
              <div className="space-y-5">
                {section.steps.map((s) => (
                  <div key={s.step} className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm shrink-0">
                      {s.step}
                    </div>
                    <div className="pt-0.5">
                      <h3 className="font-semibold text-primary text-sm mb-0.5">{s.title}</h3>
                      <p className="text-muted text-sm leading-relaxed">{s.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <ul className="space-y-2.5">
                {section.items.map((item, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-muted text-sm leading-relaxed">
                    <ArrowRight className="w-3.5 h-3.5 text-primary mt-0.5 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
