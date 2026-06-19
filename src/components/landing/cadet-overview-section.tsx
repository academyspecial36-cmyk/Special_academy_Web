"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { CheckCircle2 } from "lucide-react";
import { SectionHeader } from "@/components/ui/section-header";
import { useAppContext } from "@/lib/app-context";

export function CadetOverviewSection() {
  const { settings } = useAppContext();
  const data = settings.config.cadetOverview;
  const labels = settings.config.sectionLabels?.cadetOverview;

  if (!data) return null;

  return (
    <section className="bg-white py-16 md:py-24 lg:py-28 overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader
          label={labels?.label || "Preparation"}
          title={labels?.title || data.title}
          description={labels?.description || data.description}
        />

        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-20">
          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="order-2 lg:order-1"
          >
            <h3 className="mb-6 text-xl sm:text-2xl font-bold text-primary">
              {data.heading || "What We Prepare You For"}
            </h3>

            <div className="space-y-4">
              {(data.steps || []).map((step, index) => (
                <motion.div
                  key={`${step}-${index}`}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{
                    duration: 0.3,
                    delay: index * 0.05,
                  }}
                  className="flex items-start gap-3"
                >
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-500" />

                  <span className="break-words text-muted leading-relaxed">
                    {step}
                  </span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Images */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="order-1 lg:order-2"
          >
            {/* 
              Mobile: 1 column
              Tablet/Desktop: 2 columns masonry layout
            */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {/* Left Column */}
              <div className="space-y-4">
                <div className="overflow-hidden rounded-xl shadow-card">
                  <Image
                    src={
                      data.images?.[0] ||
                      "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=400&q=80"
                    }
                    alt="Academic Preparation"
                    width={300}
                    height={250}
                    className="h-52 w-full object-cover sm:h-48 lg:h-56"
                  />
                </div>

                <div className="overflow-hidden rounded-xl shadow-card">
                  <Image
                    src={
                      data.images?.[1] ||
                      "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&q=80"
                    }
                    alt="Physical Training"
                    width={300}
                    height={250}
                    className="h-52 w-full object-cover sm:h-64 lg:h-72"
                  />
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-4 sm:pt-8">
                <div className="overflow-hidden rounded-xl shadow-card">
                  <Image
                    src={
                      data.images?.[2] ||
                      "https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?w=400&q=80"
                    }
                    alt="Leadership Training"
                    width={300}
                    height={250}
                    className="h-52 w-full object-cover sm:h-64 lg:h-72"
                  />
                </div>

                <div className="overflow-hidden rounded-xl shadow-card">
                  <Image
                    src={
                      data.images?.[3] ||
                      "https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?w=400&q=80"
                    }
                    alt="Scholarship Preparation"
                    width={300}
                    height={250}
                    className="h-52 w-full object-cover sm:h-48 lg:h-56"
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