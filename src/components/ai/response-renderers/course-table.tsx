"use client";

import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, BookOpen, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface CourseItem {
  id?: string;
  title?: string;
  description?: string;
  duration?: string;
  category?: string;
  price?: string;
  features?: string[];
  image?: string;
  is_popular?: boolean;
}

interface CourseTableData {
  title?: string;
  courses: CourseItem[];
}

export function CourseTableRenderer({ data }: { data: CourseTableData }) {
  const courses = data.courses ?? [];

  if (courses.length === 0) {
    return (
      <Card className="border-primary/5">
        <CardContent className="p-6 text-center text-sm text-muted">No courses found</CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-primary/5">
      <CardHeader>
        <CardTitle className="text-base">{data.title ?? "Courses"}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 sm:grid-cols-2">
          {courses.map((course, i) => (
            <div
              key={course.id ?? i}
              className="rounded-xl border border-primary/5 bg-white overflow-hidden hover:shadow-md transition-shadow"
            >
              {course.image && (
                <div className="aspect-video w-full overflow-hidden bg-accent/30 relative">
                  <Image
                    src={course.image}
                    alt={course.title ?? ""}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
              )}
              <div className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold text-sm leading-tight">{course.title ?? "Untitled"}</h3>
                  {course.is_popular && (
                    <Badge variant="default" className="shrink-0 text-[10px] gap-1">
                      <Star className="w-3 h-3" />
                      Popular
                    </Badge>
                  )}
                </div>

                <p className="text-xs text-muted leading-relaxed line-clamp-2">{course.description}</p>

                <div className="flex flex-wrap gap-2 text-xs text-muted">
                  {course.duration && (
                    <span className="inline-flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {course.duration}
                    </span>
                  )}
                  {course.category && (
                    <span className="inline-flex items-center gap-1">
                      <BookOpen className="w-3 h-3" />
                      {course.category}
                    </span>
                  )}
                </div>

                {course.price && (
                  <div className="text-sm font-semibold text-primary">{course.price}</div>
                )}

                {course.features && course.features.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {course.features.slice(0, 3).map((f, fi) => (
                      <Badge key={fi} variant="secondary" className="text-[10px]">{f}</Badge>
                    ))}
                    {course.features.length > 3 && (
                      <Badge variant="secondary" className="text-[10px]">+{course.features.length - 3}</Badge>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
