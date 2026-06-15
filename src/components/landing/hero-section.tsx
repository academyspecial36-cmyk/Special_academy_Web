"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  Star,
  ChevronRight,
  Trophy,
  Users,
  BookOpen,
  Dumbbell,
  ClipboardCheck,
  TrendingUp,
  HeadphonesIcon,
  School,
  Monitor,
  FlaskConical,
  UtensilsCrossed,
  Sunrise,
  Lightbulb,
  GraduationCap,
  Phone,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAppContext } from "@/lib/app-context";

const heroIconMap: Record<string, React.ElementType> = {
  Trophy, Users, BookOpen, Dumbbell, ClipboardCheck, TrendingUp, HeadphonesIcon,
};

export function HeroSection() {
  const { settings } = useAppContext();
  const hero = settings.config.hero;
  const cards = settings.config.heroCards || [];
  const trust = settings.config.trustIndicators || { studentsCount: "2,500+", rating: "4.9" };
  const btns = settings.config.buttonLabels || {} as Record<string, string>;
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-primary via-primary to-primary-800 text-white min-h-[90vh] flex items-center">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      {/* Floating Elements */}
      <motion.div
        animate={{ y: [0, -15, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-20 right-[15%] w-20 h-20 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hidden lg:block"
      />
      <motion.div
        animate={{ y: [0, 20, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="absolute bottom-32 right-[25%] w-14 h-14 rounded-xl bg-secondary/20 backdrop-blur-sm hidden lg:block"
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-0">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7 }}
            className="space-y-8"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5 text-sm"
            >
              <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
              <span>{hero.badge}</span>
              <ChevronRight className="w-3 h-3" />
            </motion.div>

            <div className="space-y-6">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.1] tracking-tight">
                {hero.title}
              </h1>
              <p className="text-lg text-white/70 max-w-xl leading-relaxed">
                {hero.subtitle}
              </p>
            </div>

            <div className="flex flex-wrap gap-4">
              <Button
                size="lg"
                className="bg-white text-primary hover:bg-white/90 shadow-lg"
                asChild
              >
                <Link href="/enrollment">
                  {btns.applyNow || "Apply for Admission"}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white/30 text-white hover:bg-white/10 backdrop-blur-sm"
                asChild
              >
                <Link href="/courses">{btns.exploreCourses || "Explore Courses"}</Link>
              </Button>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap items-center gap-6 pt-4">
              <div className="flex items-center gap-2">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="w-8 h-8 rounded-full border-2 border-primary bg-white/20 flex items-center justify-center text-[10px] font-bold"
                    >
                      {String.fromCharCode(64 + i)}
                    </div>
                  ))}
                </div>
                <span className="text-sm text-white/60">
                  <strong className="text-white">{trust.studentsCount}</strong> students enrolled
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star
                      key={i}
                      className="w-4 h-4 text-amber-400 fill-amber-400"
                    />
                  ))}
                </div>
                <span className="text-sm text-white/60">
                  <strong className="text-white">{trust.rating}</strong> rating
                </span>
              </div>
            </div>
          </motion.div>

          {/* Visual */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="relative hidden lg:block"
          >
            <div className="relative">
              <div className="relative rounded-2xl overflow-hidden shadow-elevated border border-white/10">
                <Image
                  src={hero.image}
                  alt="Special academy Students"
                  width={600}
                  height={500}
                  className="w-full h-[500px] object-cover"
                  priority
                  unoptimized
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/60 via-transparent to-transparent" />
              </div>

              {/* Floating Achievement Cards */}
              {cards.map((card, idx) => {
                const CardIcon = heroIconMap[card.icon] || Trophy;
                const positions = [
                  "absolute -left-8 top-1/4",
                  "absolute -right-4 bottom-1/4",
                  "absolute left-1/4 -bottom-6",
                ];
                const delays = [0.6, 0.8, 1];
                const colors = ["bg-emerald-50 text-emerald-600", "bg-secondary/10 text-secondary", "bg-amber-50 text-amber-600"];
                return idx < 3 ? (
                  <motion.div
                    key={card.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: delays[idx] || 0.6 }}
                    className={`${positions[idx] || positions[0]} bg-white rounded-xl p-4 shadow-elevated border border-primary/5`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg ${colors[idx] || colors[0]} flex items-center justify-center`}>
                        <CardIcon className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-lg font-bold text-primary">{card.value}</p>
                        <p className="text-xs text-muted">{card.label}</p>
                      </div>
                    </div>
                  </motion.div>
                ) : null;
              })}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
