"use client";

import { motion } from "framer-motion";
import {
  School,
  BookOpen,
  Monitor,
  Trophy,
  FlaskConical,
  UtensilsCrossed,
} from "lucide-react";
import { SectionHeader } from "@/components/ui/section-header";

const iconMap: Record<string, React.ElementType> = {
  School,
  BookOpen,
  Monitor,
  Trophy,
  FlaskConical,
  UtensilsCrossed,
};

const facilities = [
  {
    id: "1",
    title: "Modern Classrooms",
    description: "Spacious, air-conditioned classrooms equipped with smart boards and multimedia facilities for interactive learning.",
    icon: "School",
  },
  {
    id: "2",
    title: "Digital Library",
    description: "Extensive collection of books, journals, and digital resources with 24/7 online access for all students.",
    icon: "BookOpen",
  },
  {
    id: "3",
    title: "Computer Lab",
    description: "State-of-the-art computer laboratory with high-speed internet for research, practice tests, and skill development.",
    icon: "Monitor",
  },
  {
    id: "4",
    title: "Sports Ground",
    description: "Well-maintained sports ground for physical training, athletics, and outdoor activities essential for cadet preparation.",
    icon: "Trophy",
  },
  {
    id: "5",
    title: "Science Laboratory",
    description: "Fully equipped science lab for practical demonstrations and hands-on learning experiences.",
    icon: "FlaskConical",
  },
  {
    id: "6",
    title: "Cafeteria",
    description: "Hygienic cafeteria serving nutritious meals to ensure students maintain good health during intensive preparation.",
    icon: "UtensilsCrossed",
  },
];

export function FacilitiesSection() {
  return (
    <section className="py-20 md:py-28 bg-accent">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          label="Infrastructure"
          title="World-Class Facilities"
          description="Our campus is equipped with modern facilities designed to provide the best learning environment for aspiring cadets."
        />

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {facilities.map((facility, index) => {
            const Icon = iconMap[facility.icon];
            return (
              <motion.div
                key={facility.id}
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
