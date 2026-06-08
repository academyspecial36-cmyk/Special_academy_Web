"use client";

import { motion } from "framer-motion";
import {
  Users,
  BookOpen,
  Dumbbell,
  ClipboardCheck,
  TrendingUp,
  HeadphonesIcon,
} from "lucide-react";
import { SectionHeader } from "@/components/ui/section-header";

const reasons = [
  {
    icon: Users,
    title: "Expert Faculty",
    description:
      "Our team includes retired military officers, subject matter experts, and experienced educators with proven track records.",
  },
  {
    icon: BookOpen,
    title: "Comprehensive Curriculum",
    description:
      "Specially designed curriculum covering all aspects of cadet entrance exams with regular updates based on exam patterns.",
  },
  {
    icon: Dumbbell,
    title: "Physical Training",
    description:
      "Structured physical fitness programs designed to meet cadet college standards and build lasting endurance.",
  },
  {
    icon: ClipboardCheck,
    title: "Mock Tests & Assessments",
    description:
      "Regular mock examinations, weekly assessments, and detailed performance analysis to track progress.",
  },
  {
    icon: TrendingUp,
    title: "Proven Results",
    description:
      "94% of our students successfully secure admission to prestigious cadet colleges across the country.",
  },
  {
    icon: HeadphonesIcon,
    title: "Personalized Attention",
    description:
      "Small batch sizes ensure every student receives individual attention and customized learning support.",
  },
];

export function WhyChooseSection() {
  return (
    <section className="py-20 md:py-28 bg-accent">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          label="Why Choose Us"
          title="What Makes Special academy Different"
          description="We combine academic excellence with character building to create well-rounded individuals ready for cadet college life."
        />

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {reasons.map((reason, index) => (
            <motion.div
              key={reason.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.4, delay: index * 0.08 }}
              className="group p-7 rounded-xl bg-white border border-primary/5 hover:border-primary/10 hover:shadow-card transition-all duration-300"
            >
              <div className="w-12 h-12 rounded-xl bg-primary/5 flex items-center justify-center mb-5 group-hover:bg-primary group-hover:text-white transition-all duration-300">
                <reason.icon className="w-6 h-6 text-primary group-hover:text-white transition-colors" />
              </div>
              <h3 className="text-lg font-semibold text-primary mb-3">
                {reason.title}
              </h3>
              <p className="text-sm text-muted leading-relaxed">
                {reason.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
