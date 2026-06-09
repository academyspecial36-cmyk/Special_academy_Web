"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import {
  Menu,
  X,
  LogIn,
  ChevronRight,
} from "lucide-react";
import { NAV_ITEMS } from "@/constants";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useAppContext } from "@/lib/app-context";

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
   const { settings } = useAppContext();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  return (
    <>
      {/* Announcement Bar */}
      <div className="bg-primary text-white text-center py-2 px-4 text-xs md:text-sm font-medium">
        <span className="inline-flex items-center gap-2">
          <span className="bg-white/20 px-2 py-0.5 rounded text-[10px] uppercase tracking-wider">
            Admission Open
          </span>
          Session 2026-27 enrollment is now open. Apply today and get 10% early bird discount.
          <Link href="/enrollment" className="underline underline-offset-2 hover:text-secondary transition-colors inline-flex items-center gap-1">
            Apply Now <ChevronRight className="w-3 h-3" />
          </Link>
        </span>
      </div>

      {/* Navbar */}
      <header
        className={cn(
          "sticky top-0 z-50 transition-all duration-300",
          scrolled
            ? "bg-white/90 backdrop-blur-lg shadow-soft border-b border-primary/5"
            : "bg-white"
        )}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-18">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 relative">
                <Image src="/icon-image.png" alt="Special academy" width={36} height={36} className="object-contain" />
              </div>
              <div className="flex flex-col">
                <span className="text-primary font-bold text-lg leading-tight tracking-tight">
                 {settings?.academyName}
                </span>
                <span className="text-[10px] text-muted leading-tight tracking-wide uppercase">
                 {settings?.tagline}
                </span>
              </div>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden lg:flex items-center gap-1">
              {NAV_ITEMS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "px-3 py-2 text-sm font-medium rounded-md transition-all duration-200",
                    pathname === item.href
                      ? "text-primary bg-primary/5"
                      : "text-muted hover:text-primary hover:bg-primary/5"
                  )}
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            {/* Desktop Actions */}
            <div className="hidden lg:flex items-center gap-3">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/login">
                  <LogIn className="w-4 h-4 mr-1.5" />
                  Login
                </Link>
              </Button>
              <Button size="sm" asChild>
                <Link href="/enrollment">Apply Now</Link>
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="lg:hidden p-2 rounded-md text-primary hover:bg-primary/5 transition-colors"
            >
              {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 lg:hidden"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 h-full w-[280px] bg-white shadow-elevated z-50 lg:hidden flex flex-col"
            >
              <div className="flex items-center justify-between p-4 border-b">
                <span className="font-bold text-primary">Menu</span>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 rounded-md hover:bg-primary/5"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <nav className="flex-1 p-4 space-y-1">
                {NAV_ITEMS.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                      pathname === item.href
                        ? "bg-primary text-white"
                        : "text-muted hover:bg-primary/5 hover:text-primary"
                    )}
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
              <div className="p-4 border-t space-y-2">
                <Button className="w-full" asChild>
                  <Link href="/enrollment">Apply for Admission</Link>
                </Button>
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/login">Login</Link>
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
