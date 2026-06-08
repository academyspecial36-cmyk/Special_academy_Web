"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { CheckCircle2 } from "lucide-react";
import { SectionHeader } from "@/components/ui/section-header";

const preparationSteps = [
  "Comprehensive subject coverage for written exams",
  "Intelligence test and IQ development sessions",
  "Physical fitness assessment and training",
  "Interview skills and personality development",
  "Medical examination preparation guidance",
  "Mock examinations under real exam conditions",
  "Time management and stress handling techniques",
  "Regular parent-teacher progress meetings",
];

export function CadetOverviewSection() {
  return (
    <section className="py-20 md:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          label="Preparation"
          title="Complete Cadet Entrance Preparation"
          description="Our structured program covers every aspect of cadet college admission — from academics to physical fitness to interview readiness."
        />

        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="order-2 lg:order-1"
          >
            <h3 className="text-2xl font-bold text-primary mb-6">
              What We Prepare You For
            </h3>
            <div className="space-y-4">
              {preparationSteps.map((step, index) => (
                <motion.div
                  key={step}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="flex items-start gap-3"
                >
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 mt-0.5 shrink-0" />
                  <span className="text-muted leading-relaxed">{step}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Image */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="order-1 lg:order-2 relative"
          >
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <div className="rounded-xl overflow-hidden shadow-card">
                  <Image
                    src="https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=400&q=80"
                    alt="Academic Preparation"
                    width={300}
                    height={250}
                    className="w-full h-48 object-cover"
                  />
                </div>
                <div className="rounded-xl overflow-hidden shadow-card">
                  <Image
                    src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&q=80"
                    alt="Physical Training"
                    width={300}
                    height={250}
                    className="w-full h-64 object-cover"
                  />
                </div>
              </div>
              <div className="space-y-4 pt-8">
                <div className="rounded-xl overflow-hidden shadow-card">
                  <Image
                    src="https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?w=400&q=80"
                    alt="Leadership Training"
                    width={300}
                    height={250}
                    className="w-full h-64 object-cover"
                  />
                </div>
                <div className="rounded-xl overflow-hidden shadow-card">
                  <Image
                    src="https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?w=400&q=80"
                    alt="Scholarship Prep"
                    width={300}
                    height={250}
                    className="w-full h-48 object-cover"
                  />
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
