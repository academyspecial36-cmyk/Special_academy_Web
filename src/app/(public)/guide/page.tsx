import type { Metadata } from "next";
import Link from "next/link";
import { BookOpen, UserPlus, FileText, CheckCircle, ArrowRight, HelpCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "User Guide",
  description: "Learn how to use the academy website — browse courses, apply for enrollment, and get started as a student.",
};

const sections = [
  {
    id: "browsing",
    title: "Browsing the Website",
    icon: BookOpen,
    items: [
      "Use the top menu to visit pages like About, Courses, Notices, Blog, Gallery, and Contact.",
      "The homepage shows you the academy's highlights, stats, and featured courses.",
      "Click any course to read its full description, duration, and pricing.",
      "Scroll to the footer to find quick links, program listings, and contact information.",
    ],
  },
  {
    id: "enrollment",
    title: "How to Enroll (Apply for Admission)",
    icon: UserPlus,
    steps: [
      { step: "1", title: "Personal Information", desc: "Click 'Apply Now' or go to the Enrollment page. Enter your full name, email, and phone number. Click 'Next'." },
      { step: "2", title: "Course & Guardian Info", desc: "Select the course you want to join from the dropdown. Enter your guardian's name and contact number. Add your address and any extra message. Click 'Next'." },
      { step: "3", title: "Create Account", desc: "Create a password (remember this — you will need it to log in later). Confirm your password. Click 'Create Account'." },
      { step: "4", title: "Verify Email", desc: "A 6-digit verification code will be sent to your email. Enter the code on the screen. Click 'Verify', then 'Next'." },
      { step: "5", title: "Submit Application", desc: "Review all your details to make sure everything is correct. Click 'Submit Application'." },
    ],
  },
  {
    id: "after-enrollment",
    title: "After You Apply",
    icon: CheckCircle,
    items: [
      "You will see a success screen with a checkmark animation.",
      "Your application is now waiting for admin review.",
      "You will receive an email when your application is approved or rejected.",
      "Once approved, you can log in with your email and the password you created.",
      "If rejected, the email will include the reason. You can contact the academy for more information.",
    ],
  },
  {
    id: "courses",
    title: "About Courses",
    icon: FileText,
    items: [
      "The academy offers courses in Cadet Preparation, Scholarship Preparation, Foundation Classes, Leadership Development, Spoken English, and Physical Training.",
      "Each course has a description, duration, class level, and price.",
      "Browse all available courses on the Courses page.",
      "Once you are enrolled and approved, you can access your course materials through the Student Portal.",
    ],
  },
  {
    id: "help",
    title: "Need Help?",
    icon: HelpCircle,
    items: [
      "Use the Contact page to send a message to the academy.",
      "Call the phone number listed on the website.",
      "Use the WhatsApp chat button (floating on the bottom-right of the screen).",
      "Visit the academy address during office hours.",
    ],
  },
];

export default function PublicGuidePage() {
  return (
    <main>
      <section className="bg-primary py-20 md:py-28 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">User Guide</h1>
            <p className="text-lg text-white/70 leading-relaxed">
              Everything you need to know about using the academy website — from browsing courses to applying for admission.
            </p>
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          {sections.map((section) => (
            <div key={section.id} id={section.id}>
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center">
                  <section.icon className="w-5 h-5 text-primary" />
                </div>
                <h2 className="text-2xl font-bold text-primary">{section.title}</h2>
              </div>

              {"steps" in section && section.steps ? (
                <div className="space-y-6">
                  {section.steps.map((s) => (
                    <div key={s.step} className="flex gap-4">
                      <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold text-lg shrink-0">
                        {s.step}
                      </div>
                      <div className="pt-1.5">
                        <h3 className="font-semibold text-primary mb-1">{s.title}</h3>
                        <p className="text-muted leading-relaxed">{s.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <ul className="space-y-3">
                  {section.items.map((item, i) => (
                    <li key={i} className="flex items-start gap-3 text-muted leading-relaxed">
                      <ArrowRight className="w-4 h-4 text-primary mt-1 shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      </section>

      <section className="py-16 bg-accent">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-bold text-primary mb-4">Ready to Get Started?</h2>
          <p className="text-muted mb-8 max-w-lg mx-auto">
            Apply for admission today and take the first step toward becoming a future leader.
          </p>
          <Link
            href="/enrollment"
            className="inline-flex items-center gap-2 bg-primary text-white px-8 py-3 rounded-xl font-semibold hover:bg-primary/90 transition-colors"
          >
            Apply Now <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </main>
  );
}
