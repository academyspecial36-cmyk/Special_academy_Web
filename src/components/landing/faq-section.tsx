"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, HelpCircle } from "lucide-react";
import { SectionHeader } from "@/components/ui/section-header";
import { useAppContext } from "@/lib/app-context";
import { Skeleton } from "@/components/ui/skeleton";

export function FaqSection() {
  const { faqs, settings, dataLoading } = useAppContext();
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const labels = settings.config.sectionLabels?.faq;

  const sortedFaqs = dataLoading ? [] : [...faqs].sort(
    (a, b) => a.sortOrder - b.sortOrder
  );

  return (
    <section className="py-20 md:py-28 bg-accent">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          label={labels?.label || "FAQ"}
          title={labels?.title || "Frequently Asked Questions"}
          description={labels?.description || ""}
        />

        <div className="space-y-3">
          {dataLoading
            ? Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="bg-white rounded-xl border border-primary/5 p-5 flex items-center justify-between">
                  <div className="flex items-center gap-3 w-full">
                    <Skeleton className="w-5 h-5 rounded-full shrink-0" />
                    <Skeleton className="h-5 w-3/4" />
                  </div>
                  <Skeleton className="w-5 h-5 rounded" />
                </div>
              ))
            : sortedFaqs.map((faq, index) => (
                <motion.div
              key={faq.id}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className="bg-white rounded-xl border border-primary/5 overflow-hidden"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full flex items-center justify-between gap-4 p-5 text-left hover:bg-primary/[0.02] transition-colors"
              >
                <div className="flex items-center gap-3">
                  <HelpCircle className="w-5 h-5 text-secondary shrink-0" />
                  <span className="font-medium text-primary text-sm md:text-base">
                    {faq.question}
                  </span>
                </div>
                <ChevronDown
                  className={`w-5 h-5 text-muted shrink-0 transition-transform duration-300 ${
                    openIndex === index ? "rotate-180" : ""
                  }`}
                />
              </button>
              <AnimatePresence>
                {openIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="px-5 pb-5 pl-12">
                      <p className="text-sm text-muted leading-relaxed pl-8">
                        {faq.answer}
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
