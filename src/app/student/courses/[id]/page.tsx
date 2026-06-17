"use client";

import { useState, useMemo } from "react";
import { useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Play, FileText, Clock, BookOpen, CheckCircle, Circle, Image as ImageIcon, ChevronRight, ListChecks } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PreviewModal } from "@/components/ui/preview-modal";
import { useAuth } from "@/lib/auth-context";
import { useAppContext } from "@/lib/app-context";

export default function StudentCourseDetailPage() {
  const params = useParams();
  const courseId = params.id as string;
  const { user } = useAuth();
  const { subcategories, completedItems, toggleItemComplete, courses } = useAppContext();
  const course = courses.find((c) => c.id === courseId);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewItem, setPreviewItem] = useState<{ type: "video" | "pdf" | "image"; title: string; url: string; images?: string[] } | null>(null);

  const courseSubs = useMemo(
    () => subcategories.filter((s) => s.courseId === courseId && !s.hidden),
    [subcategories, courseId]
  );

  const [activeSubId, setActiveSubId] = useState<string | null>(
    courseSubs.length > 0 ? courseSubs[0].id : null
  );

  const activeSub = useMemo(
    () => courseSubs.find((s) => s.id === activeSubId) || null,
    [courseSubs, activeSubId]
  );

  const activeItems = useMemo(
    () => (activeSub ? activeSub.items.filter((item) => !item.hidden).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()) : []),
    [activeSub]
  );

  const allItems = useMemo(
    () => courseSubs.flatMap((s) => s.items.filter((item) => !item.hidden)),
    [courseSubs]
  );

  const totalItems = allItems.length;
  const completedCount = allItems.filter((item) => completedItems.includes(item.id)).length;
  const progress = totalItems > 0 ? Math.round((completedCount / totalItems) * 100) : 0;

  const subCompletedCount = (subId: string) => {
    const sub = courseSubs.find((s) => s.id === subId);
    if (!sub) return 0;
    return sub.items.filter((item) => !item.hidden && completedItems.includes(item.id)).length;
  };

  const subTotalItems = (subId: string) => {
    const sub = courseSubs.find((s) => s.id === subId);
    if (!sub) return 0;
    return sub.items.filter((item) => !item.hidden).length;
  };

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
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 sm:gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/student/courses">
            <ArrowLeft className="w-5 h-5" />
          </Link>
        </Button>
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl font-bold text-primary truncate">{course.title}</h1>
          <p className="text-xs sm:text-sm text-muted truncate">{course.category} · {course.duration} · {course.qualification}</p>
        </div>
      </div>

      {/* Progress Bar */}
      {totalItems > 0 && (
        <Card>
          <CardContent className="p-3 sm:p-4">
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
        <div className="flex flex-col lg:flex-row gap-5">
          {/* Mobile subcategory selector */}
          <div className="lg:hidden">
            <label className="text-xs font-semibold text-muted uppercase tracking-wider mb-2 block">Chapter</label>
            <select
              value={activeSubId || ""}
              onChange={(e) => setActiveSubId(e.target.value)}
              className="w-full h-10 rounded-xl border border-primary/10 bg-white px-3 py-2 text-sm text-primary outline-none focus:border-primary/30"
            >
              {courseSubs.map((sub) => {
                const completed = subCompletedCount(sub.id);
                const total = subTotalItems(sub.id);
                return (
                  <option key={sub.id} value={sub.id}>
                    {sub.title} ({completed}/{total} completed)
                  </option>
                );
              })}
            </select>
          </div>

          {/* Sidebar — Chapters */}
          <div className="hidden lg:flex w-64 shrink-0 flex-col">
            <span className="text-xs font-semibold text-muted uppercase tracking-wider mb-3 block">Chapters</span>
            <div className="flex-1 overflow-y-auto space-y-1 pr-2">
              {courseSubs.map((sub) => {
                const completed = subCompletedCount(sub.id);
                const total = subTotalItems(sub.id);
                const isActive = activeSubId === sub.id;
                const allDone = total > 0 && completed === total;
                return (
                  <button
                    key={sub.id}
                    onClick={() => setActiveSubId(sub.id)}
                    className={`w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      isActive
                        ? "bg-primary text-white shadow-sm"
                        : "text-muted hover:bg-accent hover:text-primary"
                    }`}
                  >
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold ${
                      isActive ? "bg-white/20 text-white" : allDone ? "bg-emerald-50 text-emerald-600" : "bg-primary/5 text-primary"
                    }`}>
                      {allDone ? <CheckCircle className="w-3.5 h-3.5" /> : <BookOpen className="w-3.5 h-3.5" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="truncate">{sub.title}</div>
                      <div className={`text-[10px] mt-0.5 ${isActive ? "text-white/70" : "text-muted"}`}>
                        {completed}/{total} completed
                      </div>
                    </div>
                    <ChevronRight className={`w-3.5 h-3.5 shrink-0 transition-transform ${isActive ? "rotate-90" : ""}`} />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Main Content — Items Area */}
          <div className="flex-1 min-w-0">
            <AnimatePresence mode="wait">
              {activeSub ? (
                <motion.div
                  key={activeSub.id}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="space-y-4"
                >
                  {/* Subcategory Header */}
                  <Card className="overflow-hidden border-none shadow-sm bg-gradient-to-br from-primary/[0.02] to-transparent">
                    <CardContent className="p-4 sm:p-5">
                      <div className="flex items-start gap-4">
                        {activeSub.thumbnail ? (
                          <div className="w-14 h-14 sm:w-20 sm:h-20 rounded-xl overflow-hidden shrink-0 relative shadow-sm">
                            <Image src={activeSub.thumbnail} alt={activeSub.title} fill className="object-cover" unoptimized />
                          </div>
                        ) : (
                          <div className="w-14 h-14 sm:w-20 sm:h-20 rounded-xl bg-gradient-to-br from-primary/5 to-primary/10 flex items-center justify-center shrink-0">
                            <BookOpen className="w-6 h-6 sm:w-7 sm:h-7 text-primary/40" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <h2 className="text-lg font-bold text-primary">{activeSub.title}</h2>
                          <p className="text-sm text-muted mt-0.5">{activeSub.shortDescription}</p>
                          <div className="flex items-center gap-3 mt-2 text-xs text-muted">
                            <span className="flex items-center gap-1">
                              <ListChecks className="w-3 h-3" />
                              {subCompletedCount(activeSub.id)}/{activeItems.length} completed
                            </span>
                            <span className="text-muted/30">·</span>
                            <span>{activeSub.status === "free" ? "Free" : "Available"}</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Items List */}
                  {activeItems.length === 0 ? (
                    <div className="text-center py-12 bg-accent/30 rounded-xl border border-dashed border-primary/10">
                      <BookOpen className="w-10 h-10 text-muted mx-auto mb-3" />
                      <h3 className="font-semibold text-primary mb-1">No items in this chapter</h3>
                      <p className="text-sm text-muted">Check back later for new content.</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {activeItems.map((item) => {
                        const isCompleted = completedItems.includes(item.id);
                        return (
                          <div
                            key={item.id}
                            className="group flex items-center gap-3 p-3 rounded-xl border transition-all hover:shadow-sm border-primary/5 hover:border-primary/20 hover:bg-primary/[0.02]"
                          >
                            <button
                              onClick={() => toggleItemComplete(item.id)}
                              className={`shrink-0 w-6 h-6 rounded-full flex items-center justify-center transition-colors ${
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
                              className="flex-1 flex items-center gap-3 min-w-0"
                            >
                              <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                                item.type === "video" ? "bg-blue-50 text-blue-600"
                                : item.type === "image" ? "bg-purple-50 text-purple-600"
                                : "bg-amber-50 text-amber-600"
                              }`}>
                                {item.type === "video" ? <Play className="w-4 h-4" />
                                  : item.type === "image" ? <ImageIcon className="w-4 h-4" />
                                  : <FileText className="w-4 h-4" />}
                              </div>
                              <div className="flex-1 min-w-0 text-left">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className={`text-sm font-medium truncate max-w-full ${
                                    isCompleted ? "text-emerald-700" : "text-primary"
                                  }`}>{item.title}</span>
                                  <Badge variant="outline" className="text-[8px] uppercase px-1.5 shrink-0">{item.type}</Badge>
                                </div>
                                {item.duration && (
                                  <span className="text-[10px] text-muted flex items-center gap-0.5 mt-0.5">
                                    <Clock className="w-3 h-3" /> {item.duration}
                                  </span>
                                )}
                              </div>
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
                              className="shrink-0 w-8 h-8 rounded-lg bg-accent flex items-center justify-center text-muted hover:text-secondary hover:bg-accent/80 transition-colors"
                              title="View content"
                            >
                              <Play className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </motion.div>
              ) : (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16">
                  <BookOpen className="w-12 h-12 text-muted mx-auto mb-3" />
                  <h3 className="font-semibold text-primary mb-1">Select a chapter</h3>
                  <p className="text-sm text-muted">Choose a chapter from the sidebar to view its content.</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      )}

      <PreviewModal
        open={previewOpen}
        onClose={() => { setPreviewOpen(false); setPreviewItem(null); }}
        type={previewItem?.type || "video"}
        title={previewItem?.title || ""}
        url={previewItem?.url || ""}
        images={previewItem?.images}
        studentName={user?.name}
      />
    </div>
  );
}
