"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Star, Quote, Trophy, GraduationCap, User, ChevronLeft, ChevronRight } from "lucide-react";
import { PageWrapper } from "@/components/shared/page-wrapper";
import { SectionHeader } from "@/components/ui/section-header";
import { useAppContext } from "@/lib/app-context";

const roleIcons = {
  student: User,
  parent: GraduationCap,
  cadet: Trophy,
};

const roleLabels = {
  student: "Student",
  parent: "Parent",
  cadet: "Cadet Success",
};

const roleColors = {
  student: "bg-secondary/10 text-secondary",
  parent: "bg-emerald-100 text-emerald-700",
  cadet: "bg-amber-100 text-amber-700",
};

export default function TestimonialsPage() {
  const { testimonials } = useAppContext();
  const [filter, setFilter] = useState<"all" | "student" | "parent" | "cadet">("all");

  const filtered = filter === "all" ? testimonials : testimonials.filter((t) => t.role === filter);

  return (
    <PageWrapper>
      <section className="bg-primary py-16 md:py-24 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Testimonials</h1>
            <p className="text-lg text-white/70">
              Hear from our students, parents, and successful cadets about their journey with Special academy.
            </p>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-accent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Filter */}
          <div className="flex items-center gap-2 mb-10 flex-wrap">
            {(["all", "student", "parent", "cadet"] as const).map((r) => (
              <button
                key={r}
                onClick={() => setFilter(r)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  filter === r
                    ? "bg-primary text-white"
                    : "bg-white text-muted hover:bg-primary/5"
                }`}
              >
                {r === "all" ? "All Stories" : roleLabels[r]}
              </button>
            ))}
          </div>

          {/* Featured Cadet Story */}
          {filter === "all" || filter === "cadet" ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-12"
            >
              <div className="bg-primary rounded-2xl p-8 md:p-12 text-white relative overflow-hidden">
                <div className="absolute top-4 right-4 opacity-10">
                  <Quote className="w-32 h-32" />
                </div>
                <div className="relative grid md:grid-cols-3 gap-8 items-center">
                  <div className="md:col-span-2">
                    <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-3 py-1 text-xs mb-6">
                      <Trophy className="w-3 h-3 text-amber-400" />
                      Cadet Success Story
                    </div>
                    <p className="text-lg md:text-xl leading-relaxed mb-6 italic">
                      &ldquo;{testimonials.find((t) => t.role === "cadet")?.content}&rdquo;
                    </p>
                    <div>
                      <p className="font-semibold">
                        {testimonials.find((t) => t.role === "cadet")?.name}
                      </p>
                      <p className="text-white/60 text-sm">
                        {testimonials.find((t) => t.role === "cadet")?.achievement}
                      </p>
                    </div>
                  </div>
                  <div className="hidden md:flex justify-center">
                    <div className="w-32 h-32 rounded-full bg-white/10 flex items-center justify-center">
                      <Trophy className="w-14 h-14 text-amber-400" />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ) : null}

          {/* Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((t, index) => (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.08 }}
                className="bg-white rounded-xl p-6 border border-primary/5 hover:shadow-card transition-all"
              >
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < t.rating ? "text-amber-400 fill-amber-400" : "text-gray-200"
                      }`}
                    />
                  ))}
                </div>
                <Quote className="w-6 h-6 text-primary/10 mb-3" />
                <p className="text-sm text-muted leading-relaxed mb-6">
                  &ldquo;{t.content}&rdquo;
                </p>
                <div className="flex items-center justify-between pt-4 border-t border-primary/5">
                  <div>
                    <p className="font-semibold text-primary text-sm">{t.name}</p>
                    {t.class && <p className="text-xs text-muted">{t.class}</p>}
                  </div>
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${roleColors[t.role]}`}>
                    {roleLabels[t.role]}
                  </span>
                </div>
                {t.achievement && (
                  <div className="mt-3 p-2.5 bg-amber-50 rounded-lg border border-amber-100">
                    <p className="text-xs text-amber-800 font-medium flex items-center gap-1.5">
                      <Trophy className="w-3 h-3" />
                      {t.achievement}
                    </p>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </PageWrapper>
  );
}
