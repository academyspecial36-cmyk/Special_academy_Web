"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { X, Pin, Calendar, User } from "lucide-react";
import { useAppContext } from "@/lib/app-context";

export function PinnedNoticePopup() {
  const { notices, settings, loading } = useAppContext();
  const [open, setOpen] = useState(false);

  const enabled = settings.config?.enablePinnedPopup !== false;
  const pinned = notices.filter((n) => n.isPinned);
  const latest = pinned.length > 0 ? pinned.reduce((a, b) => (a.date > b.date ? a : b)) : null;

  useEffect(() => {
    if (loading || !enabled || !latest) return;
    const timer = setTimeout(() => setOpen(true), 800);
    return () => clearTimeout(timer);
  }, [loading, enabled, latest]);

  function handleClose() {
    setOpen(false);
  }

  if (!latest) return null;

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm"
            onClick={handleClose}
          />
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-lg bg-white rounded-2xl shadow-elevated border border-primary/5 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between p-5 pb-3">
                <div className="flex items-center gap-2">
                  <Pin className="w-4 h-4 text-secondary fill-secondary" />
                  <h2 className="text-lg font-bold text-primary">Pinned Notice</h2>
                </div>
                <button
                  onClick={handleClose}
                  className="p-1.5 rounded-md hover:bg-accent text-muted hover:text-primary transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="px-5 pb-5 space-y-4">
                {latest.image && (
                  <div className="w-full h-48 rounded-lg overflow-hidden bg-accent">
                    <Image src={latest.image} alt="" width={500} height={200} className="w-full h-full object-cover" unoptimized />
                  </div>
                )}
                <div>
                  <span className="inline-block text-xs font-medium px-2 py-0.5 rounded-full bg-primary/10 text-primary capitalize mb-2">
                    {latest.category}
                  </span>
                  <h3 className="text-base font-semibold text-primary leading-snug">
                    {latest.title}
                  </h3>
                </div>
                <div className="text-sm text-muted leading-relaxed whitespace-pre-wrap">
                  {latest.content}
                </div>
                <div className="flex items-center gap-4 text-xs text-muted pt-2 border-t border-primary/5">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {latest.date}
                  </span>
                  {latest.author && (
                    <span className="flex items-center gap-1">
                      <User className="w-3.5 h-3.5" />
                      {latest.author}
                    </span>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
