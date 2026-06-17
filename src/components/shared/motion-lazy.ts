"use client";

import dynamic from "next/dynamic";
import type { ComponentType } from "react";

// Lazy-loaded framer-motion components to reduce initial bundle size.
// Framer Motion is ~30KB gzipped; this defers loading until first use.

export const MotionDiv = dynamic(
  () => import("framer-motion").then((mod) => mod.motion.div),
  { ssr: false },
) as ComponentType<Parameters<typeof import("framer-motion")["motion"]["div"]>[0]>;

export const MotionSpan = dynamic(
  () => import("framer-motion").then((mod) => mod.motion.span),
  { ssr: false },
) as ComponentType<Parameters<typeof import("framer-motion")["motion"]["span"]>[0]>;

export const AnimatePresence = dynamic(
  () => import("framer-motion").then((mod) => mod.AnimatePresence),
  { ssr: false },
) as ComponentType<React.PropsWithChildren<Parameters<typeof import("framer-motion")["AnimatePresence"]>[0]>>;
