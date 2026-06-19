"use client";

import { motion } from "framer-motion";
import {
  School,
  BookOpen,
  Monitor,
  Trophy,
  FlaskConical,
  UtensilsCrossed,
  Users,
  Dumbbell,
  ClipboardCheck,
  TrendingUp,
  HeadphonesIcon,
  Sunrise,
  Lightbulb,
} from "lucide-react";
import { SectionHeader } from "@/components/ui/section-header";
import { useAppContext } from "@/lib/app-context";

const iconMap: Record<string, React.ElementType> = {
  School, BookOpen, Monitor, Trophy, FlaskConical, UtensilsCrossed,
  Users, Dumbbell, ClipboardCheck, TrendingUp, HeadphonesIcon, Sunrise, Lightbulb,
};

export function FacilitiesSection() {
  const { settings } = useAppContext();
  const facilities = settings.config.facilities || [];
  const labels = settings.config.sectionLabels?.facilities;

  if (facilities.length === 0) return null;

  return (
    <section className="py-20 md:py-28 bg-accent">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          label={labels?.label || "Infrastructure"}
          title={labels?.title || "World-Class Facilities"}
          description={labels?.description || ""}
        />

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {facilities.map((facility, index) => {
            const Icon = iconMap[facility.icon] || School;
            return (
              <motion.div
                key={facility.title + index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.4, delay: index * 0.08 }}
                className="group p-5 sm:p-7 rounded-xl bg-white border border-primary/5 hover:border-primary/10 hover:shadow-card transition-all duration-300"
              >
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-primary/5 flex items-center justify-center mb-4 sm:mb-5 group-hover:bg-primary group-hover:text-white transition-all duration-300">
                  <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-primary group-hover:text-white transition-colors" />
                </div>
                <h3 className="text-base sm:text-lg font-semibold text-primary mb-3">
                  {facility.title}
                </h3>
                <p className="text-sm text-muted leading-relaxed">
                  {facility.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
