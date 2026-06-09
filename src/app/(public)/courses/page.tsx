"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import {
  Search,
  Clock,
  Users,
  Star,
  CheckCircle2,
  ArrowRight,
  X,
  Filter,
} from "lucide-react";
import { PageWrapper } from "@/components/shared/page-wrapper";
import { SectionHeader } from "@/components/ui/section-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useAppContext } from "@/lib/app-context";
import { Course } from "@/types";

export default function CoursesPage() {
  const { courses, courseCategories } = useAppContext();
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);

  const filtered = useMemo(() => {
    return courses.filter((c) => {
      const matchesSearch =
        c.title.toLowerCase().includes(search.toLowerCase()) ||
        c.description.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = activeCategory === "All" || c.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [search, activeCategory, courses]);

  return (
    <PageWrapper>
      {/* Hero */}
      <section className="bg-primary py-16 md:py-24 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Our Courses</h1>
            <p className="text-lg text-white/70">
              Comprehensive preparation programs designed to help students excel in cadet college admissions and beyond.
            </p>
          </div>
        </div>
      </section>

      {/* Courses */}
      <section className="py-16 md:py-24 bg-accent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Search & Filter */}
          <div className="flex flex-col md:flex-row gap-4 mb-10">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
              <Input
                placeholder="Search courses..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 bg-white"
              />
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <Filter className="w-4 h-4 text-muted" />
              {["All", ...courseCategories].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                    activeCategory === cat
                      ? "bg-primary text-white"
                      : "bg-white text-muted hover:bg-primary/5"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence mode="popLayout">
              {filtered.map((course, index) => (
                <motion.div
                  key={course.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="group bg-white rounded-xl overflow-hidden border border-primary/5 hover:shadow-card transition-all duration-300 cursor-pointer"
                  onClick={() => setSelectedCourse(course)}
                >
                  <div className="relative h-48 overflow-hidden">
                    <Image
                      src={course.image}
                      alt={course.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                    {course.isPopular && (
                      <Badge className="absolute top-3 left-3 bg-secondary text-white border-0">
                        <Star className="w-3 h-3 mr-1 fill-white" />
                        Popular
                      </Badge>
                    )}
                    <Badge className="absolute bottom-3 left-3 bg-white/90 text-primary border-0">
                      {course.category}
                    </Badge>
                  </div>
                  <div className="p-5">
                    <h3 className="font-semibold text-primary mb-2 group-hover:text-secondary transition-colors">
                      {course.title}
                    </h3>
                    <p className="text-sm text-muted line-clamp-2 mb-4">
                      {course.description}
                    </p>
                    <div className="flex items-center justify-between text-xs text-muted mb-4">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {course.duration}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="w-3.5 h-3.5" />
                        {course.classLevel}
                      </span>
                    </div>
                    <div className="flex items-center justify-between pt-3 border-t border-primary/5">
                      <span className="text-lg font-bold text-primary">{course.price}</span>
                      <span className="text-sm text-secondary font-medium inline-flex items-center gap-1 group-hover:gap-2 transition-all">
                        View Details <ArrowRight className="w-4 h-4" />
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {filtered.length === 0 && (
            <div className="text-center py-20">
              <p className="text-muted">No courses found matching your criteria.</p>
            </div>
          )}
        </div>
      </section>

      {/* Course Detail Modal */}
      <AnimatePresence>
        {selectedCourse && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedCourse(null)}
          >
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              transition={{ type: "spring", damping: 25 }}
              className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-elevated"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative h-56">
                <Image
                  src={selectedCourse.image}
                  alt={selectedCourse.title}
                  fill
                  className="object-cover rounded-t-2xl"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent rounded-t-2xl" />
                <button
                  onClick={() => setSelectedCourse(null)}
                  className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/30 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
                <div className="absolute bottom-4 left-6 right-6">
                  <Badge className="bg-secondary text-white border-0 mb-2">
                    {selectedCourse.category}
                  </Badge>
                  <h2 className="text-2xl font-bold text-white">
                    {selectedCourse.title}
                  </h2>
                </div>
              </div>
              <div className="p-6 space-y-6">
                <p className="text-muted leading-relaxed">
                  {selectedCourse.description}
                </p>
                <div className="grid grid-cols-3 gap-4">
                  <div className="p-3 bg-accent rounded-lg text-center">
                    <Clock className="w-5 h-5 text-secondary mx-auto mb-1" />
                    <p className="text-xs text-muted">Duration</p>
                    <p className="font-semibold text-primary text-sm">{selectedCourse.duration}</p>
                  </div>
                  <div className="p-3 bg-accent rounded-lg text-center">
                    <Users className="w-5 h-5 text-secondary mx-auto mb-1" />
                    <p className="text-xs text-muted">Class Level</p>
                    <p className="font-semibold text-primary text-sm">{selectedCourse.classLevel}</p>
                  </div>
                  <div className="p-3 bg-accent rounded-lg text-center">
                    <Star className="w-5 h-5 text-secondary mx-auto mb-1" />
                    <p className="text-xs text-muted">Fee</p>
                    <p className="font-semibold text-primary text-sm">{selectedCourse.price}</p>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-primary mb-3">Course Features</h4>
                  <div className="space-y-2">
                    {selectedCourse.features.map((f) => (
                      <div key={f} className="flex items-center gap-2 text-sm text-muted">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                        {f}
                      </div>
                    ))}
                  </div>
                </div>
                <Button className="w-full" size="lg" asChild>
                  <a href="/enrollment">Enroll Now</a>
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </PageWrapper>
  );
}
