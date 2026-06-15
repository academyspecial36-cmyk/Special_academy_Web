"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, GraduationCap, Clock, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAppContext } from "@/lib/app-context";

export function EnrollmentCtaSection() {
  const { settings } = useAppContext();
  const cta = settings.config.enrollmentCta;
  const btns = settings.config.buttonLabels || {} as Record<string, string>;

  if (!cta) return null;

  return (
    <section className="py-20 md:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative bg-primary rounded-2xl overflow-hidden"
        >
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute inset-0" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }} />
          </div>

          <div className="relative grid lg:grid-cols-2 gap-10 p-10 md:p-16 items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5 text-sm text-white">
                <GraduationCap className="w-4 h-4" />
                <span>{cta.badge || "Admissions Open"}</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-white leading-tight">
                {cta.heading || "Begin Your Journey Today"}
              </h2>
              <p className="text-white/70 text-lg leading-relaxed max-w-lg">
                {cta.description || ""}
              </p>
              <div className="flex flex-wrap gap-4">
                <Button
                  size="lg"
                  className="bg-white text-primary hover:bg-white/90 shadow-lg"
                  asChild
                >
                  <Link href={cta.buttonLink || "/enrollment"}>
                    {cta.buttonText || btns.applyNow || "Apply for Admission"}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white/30 text-white hover:bg-white/10"
                  asChild
                >
                  <Link href="/contact">{btns.contactUs || "Contact Us"}</Link>
                </Button>
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-5 flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                  <Clock className="w-5 h-5 text-secondary" />
                </div>
                <div>
                  <h4 className="text-white font-semibold mb-1">{cta.offerTitle || "Limited Time Offer"}</h4>
                  <p className="text-sm text-white/60">
                    {cta.offerText || ""}
                  </p>
                </div>
              </div>
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-5 flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                  <Phone className="w-5 h-5 text-secondary" />
                </div>
                <div>
                  <h4 className="text-white font-semibold mb-1">Need Help?</h4>
                  <p className="text-sm text-white/60">
                    Call us at {settings.phone} or visit our campus for a free consultation and campus tour.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
