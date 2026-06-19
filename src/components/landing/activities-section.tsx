"use client";

import { motion } from "framer-motion";
import {
  Sunrise,
  BookOpen,
  Dumbbell,
  Users,
  Lightbulb,
  School,
  Monitor,
  Trophy,
  FlaskConical,
  UtensilsCrossed,
  ClipboardCheck,
  TrendingUp,
  HeadphonesIcon,
} from "lucide-react";
import { SectionHeader } from "@/components/ui/section-header";
import { useAppContext } from "@/lib/app-context";

const iconMap: Record<string, React.ElementType> = {
  Sunrise, BookOpen, Dumbbell, Users, Lightbulb,
  School, Monitor, Trophy, FlaskConical, UtensilsCrossed,
  ClipboardCheck, TrendingUp, HeadphonesIcon,
};

export function ActivitiesSection() {
  const { settings } = useAppContext();
  const activities = settings.config.activities || [];
  const labels = settings.config.sectionLabels?.activities;

  if (activities.length === 0) return null;

  return (
    <section className="py-20 md:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          label={labels?.label || "Daily Schedule"}
          title={labels?.title || "A Day at Special academy"}
          description={labels?.description || ""}
        />

        <div className="max-w-3xl mx-auto">
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-6 md:left-8 top-0 bottom-0 w-px bg-primary/10" />

            <div className="space-y-8">
              {activities.map((activity, index) => {
                const Icon = iconMap[activity.icon] || Sunrise;
                return (
                  <motion.div
                    key={activity.title + index}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    className="relative flex gap-5 md:gap-8"
                  >
                    {/* Icon bubble */}
                    <div className="relative z-10 w-12 h-12 md:w-16 md:h-16 rounded-full bg-white border-2 border-primary/10 flex items-center justify-center shrink-0 shadow-soft">
                      <Icon className="w-5 h-5 md:w-6 md:h-6 text-primary" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 pt-1 md:pt-2">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 mb-2">
                        <h3 className="text-base sm:text-lg font-semibold text-primary">
                          {activity.title}
                        </h3>
                        <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-secondary/10 text-secondary w-fit">
                          {activity.time}
                        </span>
                      </div>
                      <p className="text-sm text-muted leading-relaxed">
                        {activity.description}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
