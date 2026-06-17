"use client";

import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { Pin, Calendar, X, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAppContext } from "@/lib/app-context";
import { Notice } from "@/types";
import { formatDate } from "@/lib/utils";

export default function StudentNoticesPage() {
  const { notices: contextNotices, noticeCategories } = useAppContext();
  const [selectedNotice, setSelectedNotice] = useState<Notice | null>(null);
  const [realNotices, setRealNotices] = useState<Notice[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/student/notices")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setRealNotices(data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const notices = realNotices ?? contextNotices;

  const sorted = useMemo(() => {
    return [...notices].sort((a, b) => {
      if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });
  }, [notices]);

  const getCategoryStyle = (category: string) => {
    const cat = noticeCategories.find((c) => c.value === category);
    return cat?.color || "bg-slate-100 text-slate-800";
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-primary">Notices</h1>
        <p className="text-sm text-muted">Stay updated with academy announcements.</p>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-5 h-5 animate-spin text-muted" />
        </div>
      )}

      <div className="space-y-3">
        {sorted.map((notice, i) => (
          <motion.div
            key={notice.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.03 }}
          >
            <Card
              className="cursor-pointer hover:shadow-soft transition-all"
              onClick={() => setSelectedNotice(notice)}
            >
              <CardContent className="p-4 sm:p-5">
                <div className="flex items-start gap-3 sm:gap-4">
                  {notice.image && (
                    <div className="hidden sm:block w-16 h-16 shrink-0 rounded-lg overflow-hidden bg-accent">
                      <Image src={notice.image} alt="" width={64} height={64} className="w-full h-full object-cover" unoptimized />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5 sm:mb-2">
                      <Badge className={getCategoryStyle(notice.category) + " text-[10px] sm:text-xs"}>
                        {noticeCategories.find((c) => c.value === notice.category)?.label}
                      </Badge>
                      {notice.isPinned && (
                        <Pin className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-secondary fill-secondary" />
                      )}
                    </div>
                    <h3 className="text-sm sm:text-base font-semibold text-primary mb-1 sm:mb-2">{notice.title}</h3>
                    <p className="text-xs sm:text-sm text-muted line-clamp-2">{notice.content}</p>
                    <div className="flex items-center gap-3 mt-2 sm:mt-3 text-[10px] sm:text-xs text-muted">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDate(notice.date)}
                      </span>
                      <span>By {notice.author}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {selectedNotice && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
            onClick={() => setSelectedNotice(null)}
          >
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="absolute right-0 top-0 h-full w-full sm:max-w-lg bg-white shadow-elevated overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-5 sm:p-6">
                <div className="flex items-center justify-between mb-5 sm:mb-6">
                  <Badge className={getCategoryStyle(selectedNotice.category)}>
                    {noticeCategories.find((c) => c.value === selectedNotice.category)?.label}
                  </Badge>
                  <button
                    onClick={() => setSelectedNotice(null)}
                    className="w-8 h-8 rounded-full bg-accent flex items-center justify-center hover:bg-primary/5 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                {selectedNotice.image && (
                  <div className="w-full h-40 sm:h-48 rounded-lg overflow-hidden bg-accent mb-4">
                    <Image src={selectedNotice.image} alt="" width={500} height={200} className="w-full h-full object-cover" unoptimized />
                  </div>
                )}
                <h2 className="text-lg sm:text-xl font-bold text-primary mb-3 sm:mb-4">{selectedNotice.title}</h2>
                <div className="flex items-center gap-3 sm:gap-4 text-xs sm:text-sm text-muted mb-4 sm:mb-6">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {formatDate(selectedNotice.date)}
                  </span>
                  <span>By {selectedNotice.author}</span>
                </div>
                <p className="text-sm sm:text-base text-muted leading-relaxed">{selectedNotice.content}</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
