"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { Search, Plus, Pencil, Trash2, Star } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FormModal, type FieldConfig } from "@/components/ui/form-modal";
import { DeleteModal } from "@/components/ui/delete-modal";
import { courses as initialCourses } from "@/mock";
import type { Course } from "@/types";

const fields: FieldConfig[] = [
  { name: "title", label: "Course Title", type: "text", required: true, placeholder: "e.g. Cadet Entrance Preparation" },
  { name: "slug", label: "Slug", type: "text", required: true, placeholder: "e.g. cadet-entrance-preparation" },
  { name: "description", label: "Description", type: "textarea", required: true, placeholder: "Course description..." },
  { name: "duration", label: "Duration", type: "text", required: true, placeholder: "e.g. 6 Months" },
  { name: "classLevel", label: "Class Level", type: "text", required: true, placeholder: "e.g. Class 8-10" },
  { name: "category", label: "Category", type: "select", required: true, options: [
    { label: "Entrance Preparation", value: "Entrance Preparation" },
    { label: "Scholarship Preparation", value: "Scholarship Preparation" },
    { label: "Foundation", value: "Foundation" },
    { label: "Language", value: "Language" },
    { label: "Leadership", value: "Leadership" },
  ]},
  { name: "price", label: "Price", type: "text", placeholder: "e.g. NPR 15,000" },
  { name: "image", label: "Image URL", type: "url", placeholder: "https://..." },
];

export default function DashboardCoursesPage() {
  const [courses, setCourses] = useState<Course[]>(initialCourses);
  const [search, setSearch] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selected, setSelected] = useState<Course | null>(null);

  const filtered = courses.filter((c) =>
    c.title.toLowerCase().includes(search.toLowerCase())
  );

  function handleAdd(data: Record<string, string>) {
    const newCourse: Course = {
      id: `course-${Date.now()}`,
      title: data.title,
      slug: data.slug,
      description: data.description,
      duration: data.duration,
      classLevel: data.classLevel,
      category: data.category,
      price: data.price || undefined,
      image: data.image || "/placeholder.jpg",
      features: [],
      isPopular: false,
    };
    setCourses((prev) => [newCourse, ...prev]);
    setAddOpen(false);
    console.log("Course added:", newCourse);
    toast.success("Course added successfully");
  }

  function handleEdit(data: Record<string, string>) {
    if (!selected) return;
    const updated: Course = {
      ...selected,
      title: data.title,
      slug: data.slug,
      description: data.description,
      duration: data.duration,
      classLevel: data.classLevel,
      category: data.category,
      price: data.price || undefined,
      image: data.image || selected.image,
    };
    setCourses((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
    setEditOpen(false);
    setSelected(null);
    console.log("Course updated:", updated);
    toast.success("Course updated successfully");
  }

  function handleDelete() {
    if (!selected) return;
    setCourses((prev) => prev.filter((c) => c.id !== selected.id));
    setDeleteOpen(false);
    setSelected(null);
    console.log("Course deleted:", selected.id);
    toast.success("Course deleted successfully");
  }

  function openEdit(course: Course) {
    setSelected(course);
    setEditOpen(true);
  }

  function openDelete(course: Course) {
    setSelected(course);
    setDeleteOpen(true);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-primary">Courses</h1>
          <p className="text-sm text-muted">Manage courses and programs.</p>
        </div>
        <Button size="sm" onClick={() => setAddOpen(true)}>
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
                    <button
                      onClick={() => openEdit(course)}
                      className="p-1.5 rounded-md hover:bg-primary/5 text-muted hover:text-primary transition-colors"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => openDelete(course)}
                      className="p-1.5 rounded-md hover:bg-red-50 text-muted hover:text-red-600 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <FormModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        title="Add Course"
        fields={fields}
        onSubmit={handleAdd}
        submitLabel="Add Course"
      />

      <FormModal
        open={editOpen}
        onClose={() => { setEditOpen(false); setSelected(null); }}
        title="Edit Course"
        fields={fields}
        initialValues={selected ? {
          title: selected.title,
          slug: selected.slug,
          description: selected.description,
          duration: selected.duration,
          classLevel: selected.classLevel,
          category: selected.category,
          price: selected.price || "",
          image: selected.image,
        } : undefined}
        onSubmit={handleEdit}
        submitLabel="Update Course"
      />

      <DeleteModal
        open={deleteOpen}
        onClose={() => { setDeleteOpen(false); setSelected(null); }}
        onConfirm={handleDelete}
        title="Delete Course?"
        message={`Are you sure you want to delete "${selected?.title}"? This action cannot be undone.`}
      />
    </div>
  );
}
