"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Pin, Calendar } from "lucide-react";
import { SectionHeader } from "@/components/ui/section-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAppContext } from "@/lib/app-context";
import { formatShortDate } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

export function NoticesSection() {
  const { notices, noticeCategories, settings, dataLoading } = useAppContext();
  const featuredNotices = notices.slice(0, 4);
  const labels = settings.config.sectionLabels?.notices;
  const btns = settings.config.buttonLabels || {} as Record<string, string>;

  const getCategoryStyle = (category: string) => {
    const cat = noticeCategories.find((c) => c.value === category);
    return cat?.color || "bg-slate-100 text-slate-800";
  };

  return (
    <section className="py-20 md:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          label={labels?.label || "Updates"}
          title={labels?.title || "Latest Notices & Announcements"}
          description={labels?.description || ""}
        />

        <div className="grid md:grid-cols-2 gap-5">
          {dataLoading
            ? Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="p-6 rounded-xl bg-accent border border-primary/5 space-y-3 flex flex-col h-[180px]">
                  <div className="flex justify-between items-center">
                    <Skeleton className="h-5 w-20 rounded-full" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <div className="mt-auto flex justify-between items-center pt-2">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                </div>
              ))
            : featuredNotices.map((notice, index) => (
                <motion.div
                  key={notice.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.4, delay: index * 0.08 }}
                  className="group p-6 rounded-xl bg-accent border border-primary/5 hover:border-primary/10 hover:shadow-soft transition-all duration-300"
                >
                  {notice.image && (
                    <div className="w-full h-40 rounded-lg overflow-hidden bg-accent mb-3">
                      <Image src={notice.image} alt="" width={400} height={160} className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex items-center gap-2">
                      <Badge className={getCategoryStyle(notice.category)}>
                        {noticeCategories.find((c) => c.value === notice.category)?.label}
                      </Badge>
                      {notice.isPinned && (
                        <Pin className="w-3.5 h-3.5 text-secondary fill-secondary" />
                      )}
                    </div>
                    <span className="text-xs text-muted flex items-center gap-1 shrink-0">
                      <Calendar className="w-3 h-3" />
                      {formatShortDate(notice.date)}
                    </span>
                  </div>
                  <h3 className="text-sm sm:text-base font-semibold text-primary mb-2 group-hover:text-secondary transition-colors line-clamp-1">
                    {notice.title}
                  </h3>
                  <p className="text-sm text-muted line-clamp-2 mb-4">
                    {notice.content}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted">By {notice.author}</span>
                    <Link
                      href="/notices"
                      className="text-sm text-secondary hover:text-secondary/80 font-medium inline-flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      Read More <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </motion.div>
              ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mt-10"
        >
          <Button variant="outline" asChild>
            <Link href="/notices">
              {btns.viewAllNotices || "View All Notices"}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
