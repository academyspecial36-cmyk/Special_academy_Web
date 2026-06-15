"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { Target, Shield, Award, Heart } from "lucide-react";
import { SectionHeader } from "@/components/ui/section-header";
import { useAppContext } from "@/lib/app-context";

const valueIcons = [Target, Shield, Award, Heart];

export function AboutSection() {
  const { settings } = useAppContext();
  const about = settings.config.about;
  const values = about.values;
  return (
    <section className="py-20 md:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          label={settings.config.sectionLabels?.about?.label || "About Us"}
          title={about.title}
          description={about.description}
        />

        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Image */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative overflow-hidden"
          >
            <div className="relative rounded-2xl overflow-hidden shadow-elevated">
              <Image
                  src={about.image}
                  alt="Special academy Classroom"
                  width={600}
                  height={450}
                  className="w-full h-[400px] object-cover"
                  unoptimized
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
                  {(() => { const Icon = valueIcons[index % valueIcons.length]; return <Icon className="w-5 h-5 text-primary group-hover:text-white transition-colors" />; })()}
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
