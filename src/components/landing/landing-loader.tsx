"use client";

import { motion } from "framer-motion";

function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      className={`rounded-md bg-slate-200/80 animate-pulse ${className}`}
    />
  );
}

function CadetSkeleton() {
  return (
    <motion.div
      animate={{
        x: [0, 30, 0],
      }}
      transition={{
        duration: 1.4,
        repeat: Infinity,
        ease: "easeInOut",
      }}
      className="relative h-32 w-32"
    >
      {/* Head */}
      <Skeleton className="absolute left-12 top-0 h-6 w-6 rounded-full" />

      {/* Body */}
      <Skeleton className="absolute left-[22px] top-8 h-2 w-12 rotate-45" />

      {/* Rifle */}
      <Skeleton className="absolute left-[42px] top-[38px] h-1.5 w-16" />

      {/* Arm */}
      <Skeleton className="absolute left-[35px] top-[34px] h-1.5 w-12 rotate-12" />

      {/* Legs */}
      <Skeleton className="absolute left-[22px] top-[58px] h-1.5 w-14 rotate-45" />
      <Skeleton className="absolute left-[42px] top-[62px] h-1.5 w-14 -rotate-45" />

      {/* Foot */}
      <Skeleton className="absolute left-[12px] top-[78px] h-1.5 w-8" />
      <Skeleton className="absolute left-[62px] top-[82px] h-1.5 w-8" />
    </motion.div>
  );
}

function TrainingFlow() {
  const items = ["Run", "Aim", "Shoot", "Graduate"];

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="flex items-center justify-between">
        {items.map((item, index) => (
          <div
            key={item}
            className="flex items-center"
          >
            <motion.div
              animate={{
                opacity: [0.4, 1, 0.4],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                delay: index * 0.2,
              }}
              className="h-5 w-5 rounded-full bg-slate-200"
            />

            {index < items.length - 1 && (
              <div className="mx-2 sm:mx-4 h-1 w-10 sm:w-20 bg-slate-200 rounded-full" />
            )}
          </div>
        ))}
      </div>

      <div className="mt-4 flex items-center justify-between">
        {items.map((item) => (
          <Skeleton
            key={item}
            className="h-3 w-10 sm:w-14"
          />
        ))}
      </div>
    </div>
  );
}

export function LandingLoader() {
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-background">
      {/* Navbar */}
      <header className="border-b">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Skeleton className="h-10 w-40" />

          <div className="hidden md:flex gap-6">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-16" />
          </div>

          <Skeleton className="h-10 w-28" />
        </div>
      </header>

      {/* Hero */}
      <section className="py-12 md:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-2 items-center">
            <div>
              <Skeleton className="h-5 w-32 mb-4" />

              <Skeleton className="h-14 w-full max-w-xl mb-3" />
              <Skeleton className="h-14 w-4/5 mb-6" />

              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-11/12 mb-2" />
              <Skeleton className="h-4 w-4/5 mb-8" />

              <div className="flex gap-4">
                <Skeleton className="h-12 w-40" />
                <Skeleton className="h-12 w-32" />
              </div>
            </div>

            {/* Military Skeleton */}
            <div className="flex flex-col items-center justify-center">
              <CadetSkeleton />

              <div className="mt-8 w-full max-w-md">
                <TrainingFlow />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="rounded-xl border p-6"
              >
                <Skeleton className="mx-auto h-8 w-20" />
                <Skeleton className="mx-auto mt-3 h-4 w-16" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Training Programs */}
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <Skeleton className="mx-auto h-5 w-28 mb-4" />
            <Skeleton className="mx-auto h-10 w-72 mb-4" />
            <Skeleton className="mx-auto h-4 w-96 max-w-full" />
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="rounded-2xl border p-6"
              >
                <Skeleton className="h-16 w-16 rounded-xl mb-5" />

                <Skeleton className="h-6 w-40 mb-4" />

                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-5/6 mb-2" />
                <Skeleton className="h-4 w-4/6" />

                <Skeleton className="mt-6 h-10 w-full" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Courses */}
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-6 md:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="overflow-hidden rounded-2xl border"
              >
                <Skeleton className="h-52 w-full rounded-none" />

                <div className="p-5">
                  <Skeleton className="h-6 w-3/4 mb-3" />
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-5/6 mb-5" />

                  <Skeleton className="h-10 w-full" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-6 md:grid-cols-3">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="rounded-2xl border p-6"
              >
                <div className="flex items-center gap-3 mb-4">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div>
                    <Skeleton className="h-4 w-24 mb-2" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                </div>

                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-4/5" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="pb-20">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl border p-10">
            <Skeleton className="mx-auto h-10 w-80 max-w-full mb-4" />
            <Skeleton className="mx-auto h-4 w-[500px] max-w-full mb-8" />
            <Skeleton className="mx-auto h-12 w-48" />
          </div>
        </div>
      </section>
    </div>
  );
}