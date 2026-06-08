"use client";

import { motion } from "framer-motion";
import {
  Sunrise,
  BookOpen,
  Dumbbell,
  Users,
  Lightbulb,
} from "lucide-react";
import { SectionHeader } from "@/components/ui/section-header";

const iconMap: Record<string, React.ElementType> = {
  Sunrise,
  BookOpen,
  Dumbbell,
  Users,
  Lightbulb,
};

const activities = [
  {
    id: "1",
    title: "Morning Assembly",
    description: "Daily assembly with national anthem, physical exercises, and motivational talks to start the day with discipline.",
    time: "7:30 AM - 8:00 AM",
    icon: "Sunrise",
  },
  {
    id: "2",
    title: "Academic Classes",
    description: "Structured subject-wise classes focusing on core academic subjects with interactive teaching methods.",
    time: "8:00 AM - 12:00 PM",
    icon: "BookOpen",
  },
  {
    id: "3",
    title: "Physical Training",
    description: "Daily physical training sessions including running, exercises, and sports to build stamina and fitness.",
    time: "12:30 PM - 1:30 PM",
    icon: "Dumbbell",
  },
  {
    id: "4",
    title: "Leadership Workshop",
    description: "Afternoon sessions on leadership skills, public speaking, teamwork, and personality development.",
    time: "2:00 PM - 3:30 PM",
    icon: "Users",
  },
  {
    id: "5",
    title: "Doubt Clearing & Self Study",
    description: "Dedicated time for students to clarify doubts, revise topics, and engage in self-directed learning.",
    time: "3:30 PM - 5:00 PM",
    icon: "Lightbulb",
  },
];

export function ActivitiesSection() {
  return (
    <section className="py-20 md:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          label="Daily Schedule"
          title="A Day at Special academy"
          description="Our structured daily routine ensures students develop discipline, academic excellence, and physical fitness — the three pillars of cadet preparation."
        />

        <div className="max-w-3xl mx-auto">
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-6 md:left-8 top-0 bottom-0 w-px bg-primary/10" />

            <div className="space-y-8">
              {activities.map((activity, index) => {
                const Icon = iconMap[activity.icon];
                return (
                  <motion.div
                    key={activity.id}
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
                        <h3 className="text-lg font-semibold text-primary">
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
