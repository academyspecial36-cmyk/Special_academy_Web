"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { Award, BookOpen, Users } from "lucide-react";
import { PageWrapper } from "@/components/shared/page-wrapper";
import { useAppContext } from "@/lib/app-context";

export default function TeamPage() {
  const { facultyMembers } = useAppContext();
  return (
    <PageWrapper>
      <section className="bg-primary py-16 md:py-24 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Our Team</h1>
            <p className="text-lg text-white/70">
              Meet our dedicated faculty and staff committed to shaping the leaders of tomorrow.
            </p>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-accent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {facultyMembers.length === 0 ? (
            <div className="text-center py-20">
              <Users className="w-12 h-12 text-muted mx-auto mb-4" />
              <p className="text-muted">No team members found.</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {facultyMembers.map((faculty, index) => (
                <motion.div
                  key={faculty.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className="group"
                >
                  <div className="bg-white rounded-xl overflow-hidden border border-primary/5 hover:border-primary/10 hover:shadow-card transition-all duration-300">
                    <div className="relative h-64 overflow-hidden">
                      <Image
                        src={faculty.image}
                        alt={faculty.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
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
          )}
        </div>
      </section>
    </PageWrapper>
  );
}
