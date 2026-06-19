"use client";

import { motion } from "framer-motion";

function Skel({ w = "100%", h = 8, r = 4, opacity = 0.22, delay = 0 }: {
  w?: string | number; h?: number; r?: number; opacity?: number; delay?: number;
}) {
  return (
    <motion.div
      animate={{ opacity: [opacity * 0.5, opacity, opacity * 0.5] }}
      transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut", delay }}
      style={{
        width: w, height: h, borderRadius: r,
        background: "currentColor", color: "rgba(128,128,128,0.45)",
        flexShrink: 0,
      }}
    />
  );
}

function AK47Soldier() {
  return (
    <motion.div
      animate={{ x: [0, 28, 0] }}
      transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
      style={{ position: "relative" }}
    >
      <svg
        viewBox="0 0 240 200"
        width={220}
        height={200}
        xmlns="http://www.w3.org/2000/svg"
        style={{ overflow: "visible" }}
      >
        {/* Shadow */}
        <ellipse cx="110" cy="194" rx="52" ry="5" fill="rgba(128,128,128,0.12)" />

        {/* Helmet */}
        <ellipse cx="110" cy="22" rx="18" ry="10" fill="rgba(128,128,128,0.30)" />
        <rect x="92" y="29" width="36" height="4" rx="2" fill="rgba(128,128,128,0.25)" />

        {/* Head */}
        <ellipse cx="110" cy="40" rx="13" ry="14" fill="rgba(128,128,128,0.28)" />

        {/* Torso */}
        <rect x="94" y="54" width="32" height="36" rx="5" fill="rgba(128,128,128,0.28)" />
        {/* Belt */}
        <rect x="94" y="86" width="32" height="5" rx="2" fill="rgba(128,128,128,0.20)" />

        {/* Left arm */}
        <rect x="80" y="58" width="14" height="8" rx="3" fill="rgba(128,128,128,0.25)" />
        <rect x="72" y="64" width="12" height="7" rx="3" fill="rgba(128,128,128,0.22)" />

        {/* Right arm (trigger hand) */}
        <motion.g
          animate={{ rotate: [0, -1.5, 0.5, 0] }}
          transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut", times: [0, 0.88, 0.92, 1] }}
          style={{ transformOrigin: "126px 66px" }}
        >
          <rect x="124" y="60" width="12" height="8" rx="3" fill="rgba(128,128,128,0.25)" />
        </motion.g>

        {/* ── AK-47 rifle group ── */}
        <motion.g
          animate={{ x: [0, -5, 2, 0], rotate: [0, -1.5, 0.5, 0] }}
          transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut", times: [0, 0.88, 0.92, 1] }}
          style={{ transformOrigin: "98px 68px" }}
        >
          {/* Stock */}
          <rect x="130" y="65" width="26" height="7" rx="2" fill="rgba(128,128,128,0.30)" />
          {/* Receiver */}
          <rect x="88" y="63" width="44" height="9" rx="2" fill="rgba(128,128,128,0.35)" />
          {/* Barrel */}
          <rect x="46" y="64" width="42" height="5" rx="1.5" fill="rgba(128,128,128,0.30)" />
          {/* Muzzle brake */}
          <rect x="38" y="63" width="10" height="7" rx="1" fill="rgba(128,128,128,0.25)" />
          {/* Banana magazine */}
          <path
            d="M100 72 Q98 88 104 90 Q112 90 114 88 Q118 76 118 72 Z"
            fill="rgba(128,128,128,0.28)"
          />
          {/* Gas tube */}
          <rect x="60" y="61" width="28" height="3" rx="1" fill="rgba(128,128,128,0.20)" />
          {/* Front sight */}
          <rect x="92" y="61" width="6" height="4" rx="1" fill="rgba(128,128,128,0.20)" />

          {/* Muzzle flash */}
          <motion.g
            animate={{ opacity: [0, 0, 1, 0], scale: [0.5, 0.5, 1.2, 0.8] }}
            transition={{ duration: 2.8, repeat: Infinity, times: [0, 0.84, 0.87, 0.92] }}
            style={{ transformOrigin: "34px 67px" }}
          >
            <ellipse cx="30" cy="67" rx="9" ry="5" fill="rgba(128,128,128,0.55)" />
            <ellipse cx="26" cy="67" rx="4" ry="3" fill="rgba(128,128,128,0.40)" />
          </motion.g>

          {/* Shell casing */}
          <motion.g
            animate={{ opacity: [0, 0, 1, 0], x: [0, 0, 22], y: [0, 0, -18], rotate: [0, 0, 120] }}
            transition={{ duration: 2.8, repeat: Infinity, times: [0, 0.84, 0.87, 1] }}
            style={{ transformOrigin: "120px 68px" }}
          >
            <rect x="118" y="66" width="6" height="3" rx="1" fill="rgba(128,128,128,0.45)" />
          </motion.g>
        </motion.g>

        {/* Pelvis */}
        <rect x="96" y="91" width="28" height="8" rx="3" fill="rgba(128,128,128,0.22)" />

        {/* Left leg */}
        <rect x="96" y="99" width="11" height="30" rx="4" fill="rgba(128,128,128,0.25)" />
        <rect x="93" y="128" width="13" height="28" rx="4" fill="rgba(128,128,128,0.22)" />
        <rect x="89" y="153" width="19" height="8" rx="3" fill="rgba(128,128,128,0.28)" />

        {/* Right leg */}
        <rect x="113" y="99" width="11" height="28" rx="4" fill="rgba(128,128,128,0.25)" />
        <rect x="114" y="126" width="12" height="26" rx="4" fill="rgba(128,128,128,0.22)" />
        <rect x="112" y="149" width="18" height="8" rx="3" fill="rgba(128,128,128,0.28)" />
      </svg>
    </motion.div>
  );
}

function TrainingSteps() {
  const steps = ["Run", "Aim", "Shoot", "Graduate"];
  return (
    <div className="flex items-center w-full max-w-xs mx-auto">
      {steps.map((_, i) => (
        <div key={i} className="flex items-center flex-1 last:flex-none">
          <div className="flex flex-col items-center gap-1.5">
            <motion.div
              animate={{ opacity: [0.25, 0.65, 0.25] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.25, ease: "easeInOut" }}
              className="w-2.5 h-2.5 rounded-full"
              style={{ background: "rgba(128,128,128,0.55)" }}
            />
            <Skel w={36} h={7} opacity={0.20} delay={i * 0.1} />
          </div>
          {i < steps.length - 1 && (
            <div className="flex-1 h-px mx-1" style={{ background: "rgba(128,128,128,0.18)" }} />
          )}
        </div>
      ))}
    </div>
  );
}

export function LandingLoader() {
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-background">

      {/* Navbar */}
      <header className="border-b">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-6">
          <Skel w={120} h={10} />
          <div className="hidden md:flex gap-5">
            {[52, 68, 52, 80, 52].map((w, i) => <Skel key={i} w={w} h={8} delay={i * 0.1} />)}
          </div>
          <Skel w={90} h={34} r={6} />
        </div>
      </header>

      {/* Hero */}
      <section className="py-12">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid gap-10 lg:grid-cols-2 items-center">

            {/* Left: text */}
            <div className="flex flex-col gap-3">
              <Skel w={100} h={9} />
              <Skel w="90%" h={36} r={6} delay={0.1} />
              <Skel w="72%" h={36} r={6} delay={0.2} />
              <div className="mt-1 flex flex-col gap-1.5">
                <Skel h={8} opacity={0.16} delay={0.3} />
                <Skel w="88%" h={8} opacity={0.16} delay={0.35} />
                <Skel w="74%" h={8} opacity={0.16} delay={0.4} />
              </div>
              <div className="mt-4 flex gap-3">
                <Skel w={130} h={40} r={6} delay={0.5} />
                <Skel w={100} h={40} r={6} opacity={0.16} delay={0.6} />
              </div>
            </div>

            {/* Right: soldier */}
            <div className="flex flex-col items-center gap-6">
              <AK47Soldier />
              <TrainingSteps />
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="pb-8">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="rounded-xl border p-5 flex flex-col items-center gap-2">
                <Skel w={60} h={22} delay={i * 0.1} />
                <Skel w={48} h={7} opacity={0.16} delay={i * 0.1 + 0.05} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Program cards */}
      <section className="pb-10">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid gap-5 md:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="rounded-2xl border p-6 flex flex-col gap-3">
                <Skel w={40} h={40} r={8} delay={i * 0.1} />
                <Skel w="70%" h={14} delay={i * 0.1 + 0.05} />
                <div className="flex flex-col gap-1.5">
                  <Skel h={8} opacity={0.16} />
                  <Skel w="82%" h={8} opacity={0.16} />
                  <Skel w="65%" h={8} opacity={0.16} />
                </div>
                <Skel h={34} r={5} opacity={0.20} delay={0.4} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="pb-16">
        <div className="mx-auto max-w-4xl px-6">
          <div className="rounded-3xl border p-10 flex flex-col items-center gap-4">
            <Skel w={260} h={22} delay={0.1} />
            <Skel w={380} h={8} opacity={0.16} delay={0.2} />
            <Skel w={140} h={40} r={6} delay={0.3} />
          </div>
        </div>
      </section>

    </div>
  );
}