"use client";

import { motion } from "framer-motion";
import {
  Users,
  BookOpen,
  Dumbbell,
  ClipboardCheck,
  TrendingUp,
  HeadphonesIcon,
  Trophy,
  School,
  Monitor,
  FlaskConical,
  UtensilsCrossed,
  Sunrise,
  Lightbulb,
} from "lucide-react";
import { SectionHeader } from "@/components/ui/section-header";
import { useAppContext } from "@/lib/app-context";

const iconMap: Record<string, React.ElementType> = {
  Users, BookOpen, Dumbbell, ClipboardCheck, TrendingUp, HeadphonesIcon,
  Trophy, School, Monitor, FlaskConical, UtensilsCrossed, Sunrise, Lightbulb,
};

export function WhyChooseSection() {
  const { settings } = useAppContext();
  const reasons = settings.config.whyChoose || [];
  const labels = settings.config.sectionLabels?.whyChoose;

  if (reasons.length === 0) return null;

  return (
    <section className="py-20 md:py-28 bg-accent">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          label={labels?.label || "Why Choose Us"}
          title={labels?.title || "What Makes Us Different"}
          description={labels?.description || ""}
        />

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {reasons.map((reason, index) => {
            const Icon = iconMap[reason.icon] || BookOpen;
            return (
              <motion.div
                key={reason.title + index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.4, delay: index * 0.08 }}
                className="group p-7 rounded-xl bg-white border border-primary/5 hover:border-primary/10 hover:shadow-card transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/5 flex items-center justify-center mb-5 group-hover:bg-primary group-hover:text-white transition-all duration-300">
                  <Icon className="w-6 h-6 text-primary group-hover:text-white transition-colors" />
                </div>
                <h3 className="text-lg font-semibold text-primary mb-3">
                  {reason.title}
                </h3>
                <p className="text-sm text-muted leading-relaxed">
                  {reason.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
