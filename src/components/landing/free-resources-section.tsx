"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { Play, FileText, Lock, Unlock, ExternalLink } from "lucide-react";
import { SectionHeader } from "@/components/ui/section-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PreviewModal } from "@/components/ui/preview-modal";
import { useAppContext } from "@/lib/app-context";
import { courses } from "@/mock";

export function FreeResourcesSection() {
  const { subcategories } = useAppContext();
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewItem, setPreviewItem] = useState<{ type: "video" | "pdf"; title: string; url: string } | null>(null);

  const freeSubs = subcategories.filter((s) => s.status === "free" && !s.hidden);

  if (freeSubs.length === 0) return null;

  return (
    <section className="py-20 md:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          label="Free Resources"
          title="Try Free Sample Classes"
          description="Explore our free learning materials. No registration required."
        />

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {freeSubs.map((sub, i) => {
            const course = courses.find((c) => c.id === sub.courseId);
            const freeItems = sub.items.filter((item) => item.status === "free" && !item.hidden);
            return (
              <motion.div
                key={sub.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="group bg-accent rounded-xl overflow-hidden border border-primary/5 hover:border-secondary/20 hover:shadow-elevated transition-all"
              >
                <div className="relative h-36">
                  <Image
                    src={sub.thumbnail || "https://images.unsplash.com/photo-1544717305-2782549b5136?w=400&q=80"}
                    alt={sub.title}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                  <Badge className="absolute top-3 left-3 bg-white/90 text-primary border-0 text-[10px]">
                    {course?.title || "Course"}
                  </Badge>
                  <Badge className="absolute top-3 right-3 bg-emerald-500 text-white border-0 text-[10px]">
                    <Unlock className="w-3 h-3 mr-1" />
                    Free
                  </Badge>
                </div>
                <div className="p-5">
                  <h3 className="font-semibold text-primary mb-1">{sub.title}</h3>
                  <p className="text-xs text-muted line-clamp-2 mb-3">{sub.shortDescription}</p>
                  <div className="space-y-2">
                    {freeItems.slice(0, 3).map((item) => (
                      <button
                        key={item.id}
                        onClick={() => {
                          setPreviewItem({ type: item.type, title: item.title, url: item.url });
                          setPreviewOpen(true);
                        }}
                        className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-white transition-colors text-left group/item"
                      >
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                          item.type === "video" ? "bg-blue-50 text-blue-600" : "bg-amber-50 text-amber-600"
                        }`}>
                          {item.type === "video" ? <Play className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-primary truncate group-hover/item:text-secondary transition-colors">
                            {item.title}
                          </p>
                          {item.duration && (
                            <p className="text-[10px] text-muted">{item.duration}</p>
                          )}
                        </div>
                        <ExternalLink className="w-3 h-3 text-muted shrink-0 opacity-0 group-hover/item:opacity-100 transition-opacity" />
                      </button>
                    ))}
                    {freeItems.length > 3 && (
                      <p className="text-xs text-muted text-center">+{freeItems.length - 3} more items</p>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        <PreviewModal
          open={previewOpen}
          onClose={() => { setPreviewOpen(false); setPreviewItem(null); }}
          type={previewItem?.type || "video"}
          title={previewItem?.title || ""}
          url={previewItem?.url || ""}
        />
      </div>
    </section>
  );
}
