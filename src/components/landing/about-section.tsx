"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { Target, Shield, Award, Heart } from "lucide-react";
import { SectionHeader } from "@/components/ui/section-header";

const values = [
  {
    icon: Target,
    title: "Mission",
    description:
      "To prepare disciplined, academically excellent, and morally upright future leaders through comprehensive cadet preparation programs.",
  },
  {
    icon: Shield,
    title: "Discipline",
    description:
      "We instill military-grade discipline, punctuality, and self-control that forms the foundation of successful cadet life.",
  },
  {
    icon: Award,
    title: "Excellence",
    description:
      "Pursuit of academic and personal excellence is at the core of everything we teach, ensuring our students stand out.",
  },
  {
    icon: Heart,
    title: "Character",
    description:
      "Building strong character, integrity, and leadership qualities that last a lifetime beyond cadet college admission.",
  },
];

export function AboutSection() {
  return (
    <section className="py-20 md:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          label="About Us"
          title="Building Future Leaders Since 2010"
          description="Special academy has been the trusted choice for parents and students aspiring for cadet college admissions. Our holistic approach combines academic rigor with character building."
        />

        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Image */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative"
          >
            <div className="relative rounded-2xl overflow-hidden shadow-elevated">
              <Image
                src="https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800&q=80"
                alt="Special academy Classroom"
                width={600}
                height={450}
                className="w-full h-[400px] object-cover"
              />
            </div>
            <div className="absolute -bottom-6 -right-6 w-48 h-48 bg-primary/5 rounded-2xl -z-10" />
            <div className="absolute -top-6 -left-6 w-32 h-32 bg-secondary/10 rounded-2xl -z-10" />
          </motion.div>

          {/* Values Grid */}
          <div className="grid sm:grid-cols-2 gap-6">
            {values.map((value, index) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="p-6 rounded-xl bg-accent border border-primary/5 hover:border-primary/10 hover:shadow-soft transition-all duration-300 group"
              >
                <div className="w-11 h-11 rounded-lg bg-primary/5 flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                  <value.icon className="w-5 h-5 text-primary group-hover:text-white transition-colors" />
                </div>
                <h3 className="font-semibold text-primary mb-2">{value.title}</h3>
                <p className="text-sm text-muted leading-relaxed">
                  {value.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
