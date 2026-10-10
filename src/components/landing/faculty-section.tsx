"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { Award, BookOpen, ArrowRight } from "lucide-react";
import { SectionHeader } from "@/components/ui/section-header";
import { Button } from "@/components/ui/button";
import { useAppContext } from "@/lib/app-context";
import { Skeleton } from "@/components/ui/skeleton";

export function FacultySection() {
  const { facultyMembers, settings, dataLoading } = useAppContext();
  const labels = settings.config.sectionLabels?.faculty;
  const btns = settings.config.buttonLabels || ({} as Record<string, string>);

  return (
    <section className="py-20 md:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          label={labels?.label || "Our Team"}
          title={labels?.title || "Meet Our Expert Faculty"}
          description={labels?.description || ""}
        />

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {dataLoading
            ? Array.from({ length: 4 }).map((_, index) => (
                <div
                  key={index}
                  className="bg-accent rounded-xl overflow-hidden border border-primary/5 p-5 space-y-4 h-[380px] flex flex-col"
                >
                  <Skeleton className="h-48 w-full rounded-lg" />
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <div className="space-y-2 pt-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-5/6" />
                  </div>
                </div>
              ))
            : facultyMembers.map((faculty, index) => (
                <motion.div
                  key={faculty.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className="group"
                >
                  <div className="bg-accent rounded-xl overflow-hidden border border-primary/5 hover:border-primary/10 hover:shadow-card transition-all duration-300">
                    <div className="relative h-48 sm:h-64 overflow-hidden">
                      {faculty.image ? (
                        <Image
                          src={faculty.image}
                          alt={faculty.name}
                          fill
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-primary/10 text-primary text-5xl font-bold">
                          {faculty.name?.charAt(0)?.toUpperCase() || "?"}
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-primary/60 via-transparent to-transparent" />
                      <div className="absolute bottom-4 left-4 right-4">
                        <h3 className="text-white font-semibold">{faculty.name}</h3>
                        <p className="text-white/70 text-sm">{faculty.role}</p>
                      </div>
                    </div>
                    <div className="p-5 space-y-3">
                      <div className="flex items-center gap-2 text-sm text-muted">
                        <Award className="w-4 h-4 text-secondary shrink-0" />
                        <span className="line-clamp-1">{faculty.qualification}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted">
                        <BookOpen className="w-4 h-4 text-secondary shrink-0" />
                        <span>{faculty.experience} Experience</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5 pt-2">
                        {faculty.subjects.map((subject) => (
                          <span
                            key={subject}
                            className="text-xs px-2 py-1 rounded-md bg-primary/5 text-primary font-medium"
                          >
                            {subject}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <Button size="lg" asChild>
            <Link href="/team">
              {btns.viewAllTeam || "View All Team"}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
}