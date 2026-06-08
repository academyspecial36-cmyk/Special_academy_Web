"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Search, Plus, Star, Pencil, Trash2, Trophy } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { testimonials } from "@/mock";

export default function DashboardTestimonialsPage() {
  const [search, setSearch] = useState("");

  const filtered = testimonials.filter((t) =>
    t.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-primary">Testimonials</h1>
          <p className="text-sm text-muted">Manage student and parent testimonials.</p>
        </div>
        <Button size="sm">
          <Plus className="w-4 h-4 mr-2" />
          Add Testimonial
        </Button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
        <Input placeholder="Search testimonials..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {filtered.map((t, i) => (
          <motion.div key={t.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
            <Card>
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`w-3.5 h-3.5 ${i < t.rating ? "text-amber-400 fill-amber-400" : "text-gray-200"}`} />
                    ))}
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
                <p className="text-sm text-muted leading-relaxed mb-4 line-clamp-3">&ldquo;{t.content}&rdquo;</p>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-primary">{t.name}</p>
                    <p className="text-xs text-muted capitalize">{t.role} {t.class && `· ${t.class}`}</p>
                  </div>
                  <Badge variant="outline" className="text-[10px] capitalize">{t.role}</Badge>
                </div>
                {t.achievement && (
                  <div className="mt-3 p-2 bg-amber-50 rounded-lg border border-amber-100">
                    <p className="text-xs text-amber-800 font-medium flex items-center gap-1">
                      <Trophy className="w-3 h-3" /> {t.achievement}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
