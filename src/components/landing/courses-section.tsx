"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Clock, Users, Star, CheckCircle2 } from "lucide-react";
import { SectionHeader } from "@/components/ui/section-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAppContext } from "@/lib/app-context";

export function CoursesSection() {
  const { courses } = useAppContext();
  const featuredCourses = courses.slice(0, 3);

  return (
    <section className="py-20 md:py-28 bg-accent">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          label="Our Programs"
          title="Popular Preparation Courses"
          description="Choose from our range of specialized courses designed to prepare you for cadet college admissions and academic excellence."
        />

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {featuredCourses.map((course, index) => (
            <motion.div
              key={course.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="group bg-white rounded-xl overflow-hidden border border-primary/5 hover:border-primary/10 hover:shadow-elevated transition-all duration-300 flex flex-col"
            >
              {/* Image */}
              <div className="relative h-52 overflow-hidden">
                <Image
                  src={course.image}
                  alt={course.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                {course.isPopular && (
                  <Badge className="absolute top-4 left-4 bg-secondary text-white border-0">
                    <Star className="w-3 h-3 mr-1 fill-white" />
                    Popular
                  </Badge>
                )}
                <div className="absolute bottom-4 left-4 right-4">
                  <Badge variant="outline" className="bg-white/90 text-primary border-0 backdrop-blur-sm">
                    {course.category}
                  </Badge>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 flex-1 flex flex-col">
                <h3 className="text-lg font-bold text-primary mb-2 group-hover:text-secondary transition-colors">
                  {course.title}
                </h3>
                <p className="text-sm text-muted mb-4 line-clamp-2">
                  {course.description}
                </p>

                <div className="flex items-center gap-4 text-xs text-muted mb-4">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {course.duration}
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5" />
                    {course.classLevel}
                  </span>
                </div>

                <div className="space-y-2 mb-6">
                  {course.features.slice(0, 3).map((feature) => (
                    <div key={feature} className="flex items-center gap-2 text-sm text-muted">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-auto flex items-center justify-between pt-4 border-t border-primary/5">
                  <span className="text-lg font-bold text-primary">{course.price}</span>
                  <Button variant="ghost" size="sm" className="text-secondary hover:text-secondary hover:bg-secondary/5" asChild>
                    <Link href={`/courses`}>
                      Learn More
                      <ArrowRight className="w-4 h-4 ml-1" />
                    </Link>
                  </Button>
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
            <Link href="/courses">
              View All Courses
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
