"use client";

import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

interface ThinkingIndicatorProps {
  status?: string;
  className?: string;
}

const STATUS_MESSAGES: Record<string, string> = {
  thinking: "Thinking",
  searching: "Searching",
  generating: "Generating",
  executing: "Executing",
};

const STATUS_SUBTEXT: Record<string, string> = {
  thinking: "Analyzing your request and gathering context",
  searching: "Looking through academy data for the best answer",
  generating: "Crafting a structured response",
  executing: "Performing actions on the dashboard",
};

function useTypingEffect(text: string, speed = 40) {
  const [displayed, setDisplayed] = useState("");
  const [showCursor, setShowCursor] = useState(true);

  useEffect(() => {
    setDisplayed("");
    let i = 0;
    const interval = setInterval(() => {
      i++;
      setDisplayed(text.slice(0, i));
      if (i >= text.length) clearInterval(interval);
    }, speed);
    return () => clearInterval(interval);
  }, [text, speed]);

  useEffect(() => {
    const cursor = setInterval(() => {
      setShowCursor((p) => !p);
    }, 530);
    return () => clearInterval(cursor);
  }, []);

  return { displayed, showCursor };
}

const dotVariants = {
  animate: (i: number) => ({
    y: [0, -10, 0],
    scale: [1, 1.15, 1],
    transition: {
      duration: 0.7,
      repeat: Infinity,
      delay: i * 0.2,
      ease: "easeInOut",
    },
  }),
};

const GRADIENT_DOTS = [
  "from-violet-400 to-purple-500",
  "from-purple-400 to-pink-500",
  "from-pink-400 to-rose-500",
];

function Dot({ i }: { i: number }) {
  return (
    <motion.span
      custom={i}
      variants={dotVariants}
      animate="animate"
      className={cn(
        "w-3 h-3 rounded-full bg-gradient-to-br shadow-lg",
        GRADIENT_DOTS[i],
      )}
      style={{
        boxShadow: `0 0 12px -2px hsla(var(--primary) / ${0.2 + i * 0.1})`,
      }}
    />
  );
}

export function ThinkingIndicator({ status, className }: ThinkingIndicatorProps) {
  const message = status ? STATUS_MESSAGES[status] ?? status : "Thinking";
  const subtext = status ? STATUS_SUBTEXT[status] ?? "" : "Analyzing your request and gathering context";
  const { displayed, showCursor } = useTypingEffect(subtext, 50);

  return (
    <div className={cn("flex flex-col items-center gap-4 py-6", className)}>
      {/* Outer pulsing ring */}
      <div className="relative flex items-center justify-center">
        <motion.div
          className="absolute inset-0 rounded-full bg-gradient-to-r from-violet-400/15 via-purple-400/15 to-pink-400/15 blur-xl"
          animate={{
            scale: [1, 1.25, 1],
            opacity: [0.4, 0.7, 0.4],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <div className="relative flex items-center gap-2">
          {[0, 1, 2].map((i) => (
            <Dot key={i} i={i} />
          ))}
        </div>
      </div>

      {/* Status message */}
      <div className="flex flex-col items-center gap-1">
        <motion.p
          key={message}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-sm font-medium text-primary"
        >
          {message}
          <span className="inline-flex ml-0.5">
            <AnimatePresence mode="wait">
              {showCursor ? (
                <motion.span
                  key="cursor"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.1 }}
                  className="text-primary"
                >
                  .
                </motion.span>
              ) : null}
            </AnimatePresence>
            <motion.span
              key={`dot2-${showCursor}`}
              initial={{ opacity: showCursor ? 0 : 1 }}
              animate={{ opacity: showCursor ? 0 : 1 }}
              className="text-primary"
            >
              .
            </motion.span>
            <motion.span
              key={`dot3-${showCursor}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: showCursor ? 0 : 1 }}
              transition={{ duration: 0.2 }}
              className="text-primary"
            >
              .
            </motion.span>
          </span>
        </motion.p>
        <motion.p
          initial={{ opacity: 0, y: 2 }}
          animate={{ opacity: 1, y: 0 }}
          key={subtext}
          className="text-xs text-muted h-4"
        >
          {displayed}
          <motion.span
            animate={{ opacity: [1, 0] }}
            transition={{ duration: 0.5, repeat: Infinity, repeatType: "reverse" }}
            className="inline-block w-[2px] h-3 bg-muted ml-0.5 align-middle"
          />
        </motion.p>
      </div>
    </div>
  );
}
