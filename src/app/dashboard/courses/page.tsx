"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { Search, Plus, Pencil, Trash2, Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { courses } from "@/mock";

export default function DashboardCoursesPage() {
  const [search, setSearch] = useState("");

  const filtered = courses.filter((c) =>
    c.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-primary">Courses</h1>
          <p className="text-sm text-muted">Manage courses and programs.</p>
        </div>
        <Button size="sm">
          <Plus className="w-4 h-4 mr-2" />
          Add Course
        </Button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
        <Input
          placeholder="Search courses..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((course, i) => (
          <motion.div
            key={course.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Card className="overflow-hidden">
              <div className="relative h-40">
                <Image src={course.image} alt={course.title} fill className="object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                <div className="absolute top-3 left-3 flex gap-2">
                  {course.isPopular && (
                    <Badge className="bg-secondary text-white border-0 text-[10px]">
                      <Star className="w-3 h-3 mr-1 fill-white" />
                      Popular
                    </Badge>
                  )}
                </div>
                <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
                  <Badge className="bg-white/90 text-primary border-0 text-[10px]">{course.category}</Badge>
                  <span className="text-white font-bold text-sm">{course.price}</span>
                </div>
              </div>
              <CardContent className="p-4">
                <h3 className="font-semibold text-primary text-sm mb-1">{course.title}</h3>
                <p className="text-xs text-muted line-clamp-2 mb-3">{course.description}</p>
                <div className="flex items-center justify-between">
                  <div className="text-xs text-muted">
                    <span className="font-medium text-primary">{course.duration}</span> · {course.classLevel}
                  </div>
                  <div className="flex gap-1">
                    <button className="p-1.5 rounded-md hover:bg-primary/5 text-muted hover:text-primary transition-colors">
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button className="p-1.5 rounded-md hover:bg-red-50 text-muted hover:text-red-600 transition-colors">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
