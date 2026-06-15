"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import {
  Search,
  Pin,
  Calendar,
  X,
  ArrowRight,
  Filter,
} from "lucide-react";
import { PageWrapper } from "@/components/shared/page-wrapper";
import { SectionHeader } from "@/components/ui/section-header";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useAppContext } from "@/lib/app-context";
import { Notice } from "@/types";
import { formatDate } from "@/lib/utils";

export default function NoticesPage() {
  const { notices, noticeCategories } = useAppContext();
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [selectedNotice, setSelectedNotice] = useState<Notice | null>(null);

  const filtered = useMemo(() => {
    return notices
      .filter((n) => {
        const matchesSearch =
          n.title.toLowerCase().includes(search.toLowerCase()) ||
          n.content.toLowerCase().includes(search.toLowerCase());
        const matchesCategory = activeCategory === "all" || n.category === activeCategory;
        return matchesSearch && matchesCategory;
      })
      .sort((a, b) => {
        if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      });
  }, [search, activeCategory, notices]);

  const getCategoryStyle = (category: string) => {
    const cat = noticeCategories.find((c) => c.value === category);
    return cat?.color || "bg-slate-100 text-slate-800";
  };

  return (
    <PageWrapper>
      <section className="bg-primary py-16 md:py-24 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Notice Board</h1>
            <p className="text-lg text-white/70">
              Stay updated with the latest announcements, admission notices, exam schedules, and events.
            </p>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-accent">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Search & Filter */}
          <div className="flex flex-col md:flex-row gap-4 mb-10">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
              <Input
                placeholder="Search notices..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 bg-white"
              />
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <Filter className="w-4 h-4 text-muted" />
              <button
                onClick={() => setActiveCategory("all")}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  activeCategory === "all" ? "bg-primary text-white" : "bg-white text-muted hover:bg-primary/5"
                }`}
              >
                All
              </button>
              {noticeCategories.map((cat) => (
                <button
                  key={cat.value}
                  onClick={() => setActiveCategory(cat.value)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                    activeCategory === cat.value ? "bg-primary text-white" : "bg-white text-muted hover:bg-primary/5"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Notices List */}
          <div className="space-y-4">
            <AnimatePresence mode="popLayout">
              {filtered.map((notice, index) => (
                <motion.div
                  key={notice.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3, delay: index * 0.03 }}
                  className="bg-white rounded-xl p-6 border border-primary/5 hover:border-primary/10 hover:shadow-soft transition-all cursor-pointer group"
                  onClick={() => setSelectedNotice(notice)}
                >
                  <div className="flex items-start gap-4">
                    {notice.image && (
                      <div className="w-20 h-20 shrink-0 rounded-lg overflow-hidden bg-accent hidden sm:block">
                        <Image src={notice.image} alt="" width={80} height={80} className="w-full h-full object-cover" unoptimized />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className={getCategoryStyle(notice.category)}>
                          {noticeCategories.find((c) => c.value === notice.category)?.label}
                        </Badge>
                        {notice.isPinned && (
                          <Pin className="w-3.5 h-3.5 text-secondary fill-secondary" />
                        )}
                      </div>
                      <h3 className="font-semibold text-primary mb-2 group-hover:text-secondary transition-colors">
                        {notice.title}
                      </h3>
                      <p className="text-sm text-muted line-clamp-2">
                        {notice.content}
                      </p>
                      <div className="mt-2 flex items-center gap-3 text-xs text-muted">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formatDate(notice.date)}
                        </span>
                        <span>By {notice.author}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {filtered.length === 0 && (
            <div className="text-center py-20">
              <p className="text-muted">No notices found matching your criteria.</p>
            </div>
          )}
        </div>
      </section>

      {/* Detail Drawer */}
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
              className="absolute right-0 top-0 h-full w-full max-w-lg bg-white shadow-elevated overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
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
                  <div className="w-full h-48 rounded-lg overflow-hidden bg-accent mb-4">
                    <Image src={selectedNotice.image} alt="" width={500} height={200} className="w-full h-full object-cover" unoptimized />
                  </div>
                )}
                <h2 className="text-xl font-bold text-primary mb-4">
                  {selectedNotice.title}
                </h2>
                <div className="flex items-center gap-4 text-sm text-muted mb-6">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {formatDate(selectedNotice.date)}
                  </span>
                  <span>By {selectedNotice.author}</span>
                </div>
                <div className="prose prose-sm max-w-none text-muted leading-relaxed">
                  <p>{selectedNotice.content}</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </PageWrapper>
  );
}
