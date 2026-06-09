import type { Metadata } from "next";
import {
  FileText,
  BookOpen,
  UserCheck,
  Scale,
  Ban,
  AlertTriangle,
  Mail,
  Shield,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "Review the terms and conditions governing the use of Special academy's website, programs, and services. Understand your rights and responsibilities.",
};

const sections = [
  {
    icon: BookOpen,
    title: "Acceptance of Terms",
    content: [
      "By accessing or using the Special academy website, enrolling in our programs, or interacting with our services, you agree to be bound by these Terms of Service. If you do not agree with any part of these terms, you should not use our website or services.",
      "These terms apply to all visitors, students, parents, and any other users of our platform and services.",
      "We reserve the right to update or modify these terms at any time without prior notice. Continued use of our services after any changes constitutes acceptance of the modified terms.",
    ],
  },
  {
    icon: UserCheck,
    title: "Eligibility and Enrollment",
    content: [
      "Admission to our cadet preparation programs is subject to meeting the eligibility criteria specified for each program, including age requirements, academic qualifications, and physical fitness standards.",
      "All information provided during enrollment must be accurate, complete, and truthful. Providing false or misleading information may result in immediate termination of enrollment.",
      "Enrollment confirmation is subject to availability and completion of all required documentation and fee payment.",
      "We reserve the right to refuse or cancel enrollment at our discretion, with appropriate refunds issued as per our refund policy.",
    ],
  },
  {
    icon: Scale,
    title: "User Responsibilities",
    content: [
      "Users agree to use our website and services only for lawful purposes and in accordance with these terms.",
      "You are responsible for maintaining the confidentiality of any account credentials provided to you and for all activities that occur under your account.",
      "You agree not to engage in any conduct that could damage, disable, or impair our website or interfere with other users' access and enjoyment.",
      "Students enrolled in our programs must adhere to the academy's code of conduct, discipline policies, and academic requirements.",
    ],
  },
  {
    icon: Shield,
    title: "Intellectual Property",
    content: [
      "All content on our website, including text, graphics, logos, images, course materials, and software, is the property of Special academy or its content providers and is protected by applicable intellectual property laws.",
      "You may not reproduce, distribute, modify, create derivative works from, or commercially exploit any content from our website without our prior written consent.",
      "Course materials provided to enrolled students are for personal educational use only and may not be shared, reproduced, or distributed to third parties.",
    ],
  },
  {
    icon: Ban,
    title: "Prohibited Activities",
    content: [
      "You agree not to use our website or services for any unlawful purpose or in violation of any applicable laws or regulations.",
      "Prohibited activities include, but are not limited to: hacking, introducing malicious code, attempting to gain unauthorized access, scraping data, or interfering with website security features.",
      "Harassment, discrimination, or any form of misconduct towards academy staff, faculty, or fellow students will not be tolerated and may result in immediate dismissal from programs.",
      "Any attempt to circumvent payment requirements, access restricted areas without authorization, or impersonate another individual is strictly prohibited.",
    ],
  },
  {
    icon: AlertTriangle,
    title: "Limitation of Liability",
    content: [
      "Special academy shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of our website or services.",
      "While we strive to provide accurate and up-to-date information, we make no warranties regarding the completeness, reliability, or accuracy of content on our website.",
      "We are not responsible for the content or practices of third-party websites linked from our site. Such links are provided for convenience only.",
      "Our total liability for any claim arising from these terms or your use of our services shall not exceed the total fees paid by you for the specific program in question.",
    ],
  },
  {
    icon: Mail,
    title: "Contact and Communication",
    content: [
      "By providing your contact information, you consent to receive communications from us regarding your enrollment, program updates, and academy announcements via phone, email, or SMS.",
      "You may opt out of promotional communications at any time; however, transactional and administrative communications related to your enrollment will continue as necessary.",
      "For questions or concerns regarding these terms, please contact us through the information provided on our Contact page.",
    ],
  },
];

export default function TermsPage() {
  return (
    <main>
      <section className="bg-primary py-20 md:py-28 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center mb-6">
              <FileText className="w-6 h-6 text-secondary" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Terms of Service</h1>
            <p className="text-lg text-white/70 leading-relaxed">
              Please read these terms carefully before using our website or enrolling in our programs. 
              These terms govern your relationship with Special academy and your use of our services.
            </p>
            <p className="text-sm text-white/40 mt-4">Last updated: June 2026</p>
          </div>
        </div>
      </section>

      <section className="py-20 md:py-28 bg-accent">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-12">
            {sections.map((section) => (
              <div key={section.title} className="bg-white rounded-2xl p-8 md:p-10 border border-primary/5 shadow-sm">
                <div className="flex items-start gap-5">
                  <div className="w-12 h-12 rounded-xl bg-primary/5 flex items-center justify-center shrink-0">
                    <section.icon className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className="text-2xl font-bold text-primary mb-4">{section.title}</h2>
                    <div className="space-y-3">
                      {section.content.map((paragraph, i) => (
                        <p key={i} className="text-muted leading-relaxed">
                          {paragraph}
                        </p>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-white border-t border-primary/5">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-sm text-muted">
            These Terms of Service were last updated in June 2026. We encourage you to review them 
            periodically. If you have any questions, please contact our administration office.
          </p>
        </div>
      </section>
    </main>
  );
}
