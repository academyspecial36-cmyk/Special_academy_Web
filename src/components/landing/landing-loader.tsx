"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GraduationCap, Sparkles } from "lucide-react";

const loaderQuotes = [
  "Discipline is the bridge between goals and accomplishment.",
  "The only way to do great work is to love what you do.",
  "Success is not final, failure is not fatal: it is the courage to continue that counts.",
  "Leadership is not about being in charge. It is about taking care of those in your charge.",
  "The future belongs to those who believe in the beauty of their dreams.",
  "Excellence is not a skill. It is an attitude.",
  "Strive not to be a success, but rather to be of value.",
  "Perseverance is the hard work you do after you get tired of doing the hard work.",
  "A leader is one who knows the way, goes the way, and shows the way.",
  "The difference between ordinary and extraordinary is that little extra.",
];

export function LandingLoader() {
  const [quoteIndex, setQuoteIndex] = useState(() => Math.floor(Math.random() * loaderQuotes.length));

  useEffect(() => {
    const interval = setInterval(() => {
      setQuoteIndex((prev) => (prev + 1) % loaderQuotes.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-primary via-primary/95 to-primary">
      <div className="text-center max-w-md px-4">
        <motion.div
          animate={{ scale: [1, 1.08, 1], opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
          className="mb-8"
        >
          <div className="w-24 h-24 mx-auto rounded-3xl bg-white/10 backdrop-blur-sm flex items-center justify-center ring-1 ring-white/20">
            <GraduationCap className="w-12 h-12 text-white" />
          </div>
        </motion.div>

        <div className="relative mx-auto mb-8 w-48 sm:w-56">
          <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-white/80 via-white to-white/80 rounded-full"
              animate={{ x: ["-100%", "200%"] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            />
          </div>
        </div>

        <div className="h-16 flex items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.p
              key={quoteIndex}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.4 }}
              className="text-white/80 text-sm leading-relaxed italic flex items-start gap-2"
            >
              <Sparkles className="w-3.5 h-3.5 text-white/40 mt-0.5 shrink-0" />
              <span>&ldquo;{loaderQuotes[quoteIndex]}&rdquo;</span>
            </motion.p>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
