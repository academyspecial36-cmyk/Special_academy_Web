"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { GraduationCap } from "lucide-react";
import { useAppContext } from "@/lib/app-context";

const defaultQuotes = [
  "Discipline is the bridge between goals and accomplishment.",
];

export function LandingLoader() {
  const { settings } = useAppContext();
  const quotes = settings.config.loaderQuotes || defaultQuotes;
  const [quote, setQuote] = useState("");

  useEffect(() => {
    setQuote(quotes[Math.floor(Math.random() * quotes.length)] || quotes[0] || "");
  }, [quotes]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-primary via-primary to-primary-800">
      <div className="text-center max-w-md px-4">
        <motion.div
          animate={{ scale: [1, 1.1, 1], opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="mb-6"
        >
          <div className="w-20 h-20 mx-auto rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center">
            <GraduationCap className="w-10 h-10 text-white" />
          </div>
        </motion.div>

        <motion.div
          initial={{ width: 0 }}
          animate={{ width: 200 }}
          transition={{ duration: 2, repeat: Infinity }}
          className="h-1 bg-white/20 rounded-full mx-auto mb-6 overflow-hidden"
        >
          <motion.div
            className="h-full bg-white rounded-full"
            animate={{ x: ["-100%", "200%"] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          />
        </motion.div>

        {quote && (
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-white/70 text-sm leading-relaxed italic"
          >
            &ldquo;{quote}&rdquo;
          </motion.p>
        )}
      </div>
    </div>
  );
}
