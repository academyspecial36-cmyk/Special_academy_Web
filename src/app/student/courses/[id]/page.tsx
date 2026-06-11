"use client";

import { useState, useMemo } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Play, FileText, Clock, BookOpen, CheckCircle, Circle, Image as ImageIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PreviewModal } from "@/components/ui/preview-modal";
import { useAppContext } from "@/lib/app-context";

export default function StudentCourseDetailPage() {
  const params = useParams();
  const courseId = params.id as string;
  const { subcategories, completedItems, toggleItemComplete, courses } = useAppContext();
  const course = courses.find((c) => c.id === courseId);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewItem, setPreviewItem] = useState<{ type: "video" | "pdf" | "image"; title: string; url: string; images?: string[] } | null>(null);

  const courseSubs = subcategories.filter((s) => s.courseId === courseId && !s.hidden);

  const allItems = useMemo(
    () => courseSubs.flatMap((s) => s.items.filter((item) => !item.hidden)),
    [courseSubs]
  );

  const totalItems = allItems.length;
  const completedCount = allItems.filter((item) => completedItems.includes(item.id)).length;
  const progress = totalItems > 0 ? Math.round((completedCount / totalItems) * 100) : 0;

  if (!course) {
    return (
      <div className="text-center py-20">
        <h2 className="text-xl font-bold text-primary mb-2">Course not found</h2>
        <Button variant="outline" asChild>
          <Link href="/student/courses">Back to Courses</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
            <div className="flex items-center gap-3 sm:gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/student/courses">
            <ArrowLeft className="w-5 h-5" />
          </Link>
        </Button>
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl font-bold text-primary truncate">{course.title}</h1>
          <p className="text-xs sm:text-sm text-muted truncate">{course.category} · {course.duration} · {course.classLevel}</p>
        </div>
      </div>

      {totalItems > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2 gap-2">
              <span className="text-sm font-medium text-primary">Course Progress</span>
              <span className="text-xs sm:text-sm text-muted shrink-0">{completedCount}/{totalItems} items · {progress}%</span>
            </div>
            <div className="w-full h-2.5 bg-accent rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-secondary rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {courseSubs.length === 0 ? (
        <div className="text-center py-12 sm:py-16">
          <BookOpen className="w-12 h-12 text-muted mx-auto mb-3" />
          <h3 className="font-semibold text-primary mb-1">No content available yet</h3>
          <p className="text-sm text-muted">Course content is being prepared. Check back later.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-5">
          {courseSubs.map((sub, i) => (
            <motion.div
              key={sub.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card className="overflow-hidden">
                <div className="relative h-28 sm:h-36">
                  <Image
                    src={sub.thumbnail || "https://images.unsplash.com/photo-1544717305-2782549b5136?w=400&q=80"}
                    alt={sub.title}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                  <div className="absolute top-2 sm:top-3 left-2 sm:left-3">
                    <Badge variant="secondary" className="text-[9px] sm:text-[10px]">
                      <BookOpen className="w-3 h-3 mr-1" /> {sub.status === "free" ? "Free" : "Available"}
                    </Badge>
                  </div>
                  <div className="absolute bottom-2 sm:bottom-3 left-2 sm:left-3 right-2 sm:right-3">
                    <h3 className="text-white font-bold text-base sm:text-lg drop-shadow-sm truncate">{sub.title}</h3>
                  </div>
                </div>
                <CardContent className="p-3 sm:p-4">
                  <p className="text-xs text-muted mb-3 line-clamp-2">{sub.shortDescription}</p>
                  <div className="space-y-2">
                    {sub.items.filter((item) => !item.hidden).map((item) => {
                      const isCompleted = completedItems.includes(item.id);
                      return (
                        <div
                          key={item.id}
                          className="flex items-center gap-2"
                        >
                          <button
                            onClick={() => toggleItemComplete(item.id)}
                            className={`shrink-0 w-5 h-5 rounded-full flex items-center justify-center transition-colors ${
                              isCompleted
                                ? "text-emerald-500"
                                : "text-muted hover:text-secondary"
                            }`}
                            title={isCompleted ? "Mark as incomplete" : "Mark as complete"}
                          >
                            {isCompleted ? <CheckCircle className="w-5 h-5" /> : <Circle className="w-5 h-5" />}
                          </button>
                          <button
                            onClick={() => {
                              setPreviewItem({
                                type: item.type,
                                title: item.title,
                                url: item.url,
                                images: item.images,
                              });
                              setPreviewOpen(true);
                            }}
                            className={`flex-1 flex items-center gap-2 sm:gap-3 p-2 sm:p-2.5 rounded-lg transition-colors text-left ${
                              isCompleted
                                ? "bg-emerald-50 hover:bg-emerald-100 cursor-pointer"
                                : "bg-accent hover:bg-primary/5 cursor-pointer"
                            }`}
                          >
                            <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center shrink-0 ${
                              item.type === "video" ? "bg-blue-50 text-blue-600"
                              : item.type === "image" ? "bg-purple-50 text-purple-600"
                              : "bg-amber-50 text-amber-600"
                            }`}>
                              {item.type === "video" ? <Play className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                : item.type === "image" ? <ImageIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                : <FileText className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                                <span className={`text-xs sm:text-sm font-medium truncate max-w-full ${
                                  isCompleted ? "text-emerald-700" : "text-primary"
                                }`}>{item.title}</span>
                                <Badge variant="outline" className="text-[7px] sm:text-[8px] uppercase px-1 shrink-0">{item.type}</Badge>
                              </div>
                              <div className="flex items-center gap-2 mt-0.5">
                                {item.duration && (
                                  <span className="text-[10px] text-muted flex items-center gap-0.5">
                                    <Clock className="w-3 h-3" /> {item.duration}
                                  </span>
                                )}
                              </div>
                            </div>
                            <Play className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-secondary shrink-0" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      <PreviewModal
        open={previewOpen}
        onClose={() => { setPreviewOpen(false); setPreviewItem(null); }}
        type={previewItem?.type || "video"}
        title={previewItem?.title || ""}
        url={previewItem?.url || ""}
        images={previewItem?.images}
      />
    </div>
  );
}
