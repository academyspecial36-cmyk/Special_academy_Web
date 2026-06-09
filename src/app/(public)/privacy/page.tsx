import type { Metadata } from "next";
import { Shield, Lock, Eye, FileText, Database, Cookie, Mail, Users } from "lucide-react";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "Learn how Special academy collects, uses, and protects your personal information. Our commitment to your privacy and data security.",
};

const sections = [
  {
    icon: Shield,
    title: "Information We Collect",
    content: [
      "We collect information you provide directly to us, including your name, email address, phone number, and academic details when you fill out admission forms, contact forms, or register for our programs.",
      "We automatically collect certain information when you visit our website, including your IP address, browser type, device information, and browsing patterns through cookies and similar technologies.",
      "We may collect photographs and video footage during academy events and activities for promotional and record-keeping purposes with appropriate consent.",
    ],
  },
  {
    icon: FileText,
    title: "How We Use Your Information",
    content: [
      "To process admissions, enrollments, and academic record management for our cadet preparation programs.",
      "To communicate with you regarding program updates, admissions notices, examination schedules, and other academy-related information.",
      "To improve our educational services, curriculum, and website experience based on usage patterns and feedback.",
      "To comply with legal obligations and maintain academic records as required by educational regulatory authorities.",
    ],
  },
  {
    icon: Database,
    title: "Information Sharing and Disclosure",
    content: [
      "We do not sell, trade, or rent your personal information to third parties for marketing purposes.",
      "We may share information with trusted educational partners and service providers who assist in operating our academy and programs, under strict confidentiality agreements.",
      "We may disclose information when required by law, to enforce our policies, or to protect the rights and safety of our academy, students, or others.",
      "Aggregated, anonymized data may be used for statistical analysis and reporting without personally identifying individuals.",
    ],
  },
  {
    icon: Lock,
    title: "Data Security",
    content: [
      "We implement appropriate technical and organizational security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.",
      "All sensitive data transmitted through our website is encrypted using industry-standard SSL/TLS protocols.",
      "Access to personal information is restricted to authorized personnel only, who are bound by confidentiality obligations.",
      "We regularly review and update our security practices to maintain the integrity and confidentiality of your data.",
    ],
  },
  {
    icon: Cookie,
    title: "Cookies and Tracking",
    content: [
      "Our website uses cookies to enhance your browsing experience, analyze site traffic, and understand where our visitors come from.",
      "You can control cookie preferences through your browser settings. Please note that disabling certain cookies may affect website functionality.",
      "We use essential cookies for basic site operations, analytics cookies to understand usage patterns, and occasionally marketing cookies for targeted communications.",
    ],
  },
  {
    icon: Eye,
    title: "Your Rights and Choices",
    content: [
      "You have the right to access, update, or request deletion of your personal information held by us.",
      "You may opt out of receiving promotional communications at any time by contacting us or using the unsubscribe link in our emails.",
      "You can request a copy of the information we hold about you, subject to verification of your identity.",
      "You have the right to withdraw consent for data processing where consent was previously provided.",
    ],
  },
  {
    icon: Mail,
    title: "Contact Us",
    content: [
      "If you have any questions, concerns, or requests regarding this Privacy Policy or our data practices, please contact us at our academy address, phone number, or email address listed on our Contact page.",
      "We will respond to your inquiry within a reasonable timeframe and work to address any concerns you may have about your privacy.",
    ],
  },
  {
    icon: Users,
    title: "Children's Privacy",
    content: [
      "Our services are primarily directed toward students and prospective cadets. We collect information about minors only with parental or guardian consent.",
      "Parents and guardians have the right to review, update, or request deletion of their child's personal information.",
      "If we become aware that we have collected personal information from a minor without proper consent, we will take steps to delete that information promptly.",
    ],
  },
];

export default function PrivacyPage() {
  return (
    <main>
      <section className="bg-primary py-20 md:py-28 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center mb-6">
              <Shield className="w-6 h-6 text-secondary" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Privacy Policy</h1>
            <p className="text-lg text-white/70 leading-relaxed">
              At Special academy, we take your privacy seriously. This policy outlines how we collect, 
              use, and protect your personal information when you interact with our website and services.
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
            This Privacy Policy may be updated periodically. We encourage you to review this page 
            regularly for any changes. Continued use of our services after changes constitutes 
            acceptance of the updated policy.
          </p>
        </div>
      </section>
    </main>
  );
}
