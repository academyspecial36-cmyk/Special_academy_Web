"use client";

import { motion } from "framer-motion";
import { Bot} from "lucide-react";
import { cn } from "@/lib/utils";

interface FloatingActionButtonProps {
  onClick: () => void;
  className?: string;
}

export function FloatingActionButton({ onClick, className }: FloatingActionButtonProps) {
  return (
    <motion.button
      onClick={onClick}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0, opacity: 0 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      className={cn(
        "hidden md:flex fixed bottom-6 right-6 z-50 items-center justify-center w-12 h-12 rounded-full bg-primary text-white shadow-elevated hover:bg-primary-600 transition-colors",
        className
      )}
    >
      <Bot className="w-5 h-5" />
      <span className="absolute inset-0 rounded-full animate-ping bg-primary/30 pointer-events-none" />
    </motion.button>
  );
}
