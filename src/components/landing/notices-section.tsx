"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Pin, Calendar } from "lucide-react";
import { SectionHeader } from "@/components/ui/section-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { notices } from "@/mock";
import { NOTICE_CATEGORIES } from "@/constants";
import { formatShortDate } from "@/lib/utils";

export function NoticesSection() {
  const featuredNotices = notices.slice(0, 4);

  const getCategoryStyle = (category: string) => {
    const cat = NOTICE_CATEGORIES.find((c) => c.value === category);
    return cat?.color || "bg-slate-100 text-slate-800";
  };

  return (
    <section className="py-20 md:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          label="Updates"
          title="Latest Notices & Announcements"
          description="Stay informed with the latest updates, admission notices, exam schedules, and important announcements from Special academy."
        />

        <div className="grid md:grid-cols-2 gap-5">
          {featuredNotices.map((notice, index) => (
            <motion.div
              key={notice.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.4, delay: index * 0.08 }}
              className="group p-6 rounded-xl bg-accent border border-primary/5 hover:border-primary/10 hover:shadow-soft transition-all duration-300"
            >
              <div className="flex items-start justify-between gap-4 mb-3">
                <div className="flex items-center gap-2">
                  <Badge className={getCategoryStyle(notice.category)}>
                    {NOTICE_CATEGORIES.find((c) => c.value === notice.category)?.label}
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
              <h3 className="font-semibold text-primary mb-2 group-hover:text-secondary transition-colors line-clamp-1">
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
              View All Notices
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
