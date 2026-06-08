"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Search, Plus, Pin, Pencil, Trash2, Calendar } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { notices } from "@/mock";
import { NOTICE_CATEGORIES } from "@/constants";
import { formatShortDate } from "@/lib/utils";

export default function DashboardNoticesPage() {
  const [search, setSearch] = useState("");

  const filtered = notices.filter((n) =>
    n.title.toLowerCase().includes(search.toLowerCase())
  );

  const getCategoryStyle = (category: string) => {
    const cat = NOTICE_CATEGORIES.find((c) => c.value === category);
    return cat?.color || "bg-slate-100 text-slate-800";
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-primary">Notices</h1>
          <p className="text-sm text-muted">Publish and manage academy notices.</p>
        </div>
        <Button size="sm">
          <Plus className="w-4 h-4 mr-2" />
          Publish Notice
        </Button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
        <Input
          placeholder="Search notices..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="space-y-3">
        {filtered.map((notice, i) => (
          <motion.div
            key={notice.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.03 }}
          >
            <Card>
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className={getCategoryStyle(notice.category)}>
                        {NOTICE_CATEGORIES.find((c) => c.value === notice.category)?.label}
                      </Badge>
                      {notice.isPinned && (
                        <Pin className="w-3.5 h-3.5 text-secondary fill-secondary" />
                      )}
                    </div>
                    <h3 className="font-semibold text-primary text-sm mb-1">{notice.title}</h3>
                    <p className="text-xs text-muted line-clamp-2 mb-2">{notice.content}</p>
                    <div className="flex items-center gap-3 text-xs text-muted">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatShortDate(notice.date)}
                      </span>
                      <span>By {notice.author}</span>
                    </div>
                  </div>
                  <div className="flex gap-1 shrink-0">
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
