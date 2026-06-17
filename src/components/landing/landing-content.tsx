"use client";

import dynamic from "next/dynamic";
import { useAppContext } from "@/lib/app-context";
import { LandingLoader } from "./landing-loader";
import { HeroSection } from "./hero-section";
import { AboutSection } from "./about-section";
import { WhyChooseSection } from "./why-choose-section";
import { CadetOverviewSection } from "./cadet-overview-section";

const StatsSection = dynamic(() => import("./stats-section").then((m) => m.StatsSection), {
  loading: () => <div className="py-20 bg-primary/5 h-48 animate-pulse" />,
});
const CoursesSection = dynamic(() => import("./courses-section").then((m) => m.CoursesSection), {
  loading: () => <div className="py-20 bg-accent h-[600px] animate-pulse" />,
});
const FreeResourcesSection = dynamic(() => import("./free-resources-section").then((m) => m.FreeResourcesSection), {
  loading: () => <div className="py-20 bg-white h-[400px] animate-pulse" />,
});
const NoticesSection = dynamic(() => import("./notices-section").then((m) => m.NoticesSection), {
  loading: () => <div className="py-20 bg-accent h-[500px] animate-pulse" />,
});
const TestimonialsSection = dynamic(() => import("./testimonials-section").then((m) => m.TestimonialsSection), {
  loading: () => <div className="py-20 bg-white h-[400px] animate-pulse" />,
});
const FacultySection = dynamic(() => import("./faculty-section").then((m) => m.FacultySection), {
  loading: () => <div className="py-20 bg-accent h-[500px] animate-pulse" />,
});
const FacilitiesSection = dynamic(() => import("./facilities-section").then((m) => m.FacilitiesSection), {
  loading: () => <div className="py-20 bg-white h-[600px] animate-pulse" />,
});
const ActivitiesSection = dynamic(() => import("./activities-section").then((m) => m.ActivitiesSection), {
  loading: () => <div className="py-20 bg-accent h-[500px] animate-pulse" />,
});
const BlogSection = dynamic(() => import("./blog-section").then((m) => m.BlogSection), {
  loading: () => <div className="py-20 bg-white h-[500px] animate-pulse" />,
});
const GalleryPreviewSection = dynamic(() => import("./gallery-preview-section").then((m) => m.GalleryPreviewSection), {
  loading: () => <div className="py-20 bg-accent h-[500px] animate-pulse" />,
});
const EnrollmentCtaSection = dynamic(() => import("./enrollment-cta-section").then((m) => m.EnrollmentCtaSection), {
  loading: () => <div className="py-20 bg-primary h-[300px] animate-pulse" />,
});
const FaqSection = dynamic(() => import("./faq-section").then((m) => m.FaqSection), {
  loading: () => <div className="py-20 bg-white h-[500px] animate-pulse" />,
});
const ContactSection = dynamic(() => import("./contact-section").then((m) => m.ContactSection), {
  loading: () => <div className="py-20 bg-accent h-[600px] animate-pulse" />,
});

export function LandingContent() {
  const { loading, settings } = useAppContext();
  const s = (settings.config?.sections || {}) as Record<string, boolean>;

  if (loading) return <LandingLoader />;

  return (
    <>
      {(s.hero ?? true) && <HeroSection />}
      {(s.about ?? true) && <AboutSection />}
      {(s.whyChoose ?? true) && <WhyChooseSection />}
      {(s.cadetOverview ?? true) && <CadetOverviewSection />}
      {(s.stats ?? true) && <StatsSection />}
      {(s.courses ?? true) && <CoursesSection />}
      {(s.freeResources ?? true) && <FreeResourcesSection />}
      {(s.notices ?? true) && <NoticesSection />}
      {(s.testimonials ?? true) && <TestimonialsSection />}
      {(s.faculty ?? true) && <FacultySection />}
      {(s.facilities ?? true) && <FacilitiesSection />}
      {(s.activities ?? true) && <ActivitiesSection />}
      {(s.blog ?? true) && <BlogSection />}
      {(s.gallery ?? true) && <GalleryPreviewSection />}
      {(s.enrollmentCta ?? true) && <EnrollmentCtaSection />}
      {(s.faq ?? true) && <FaqSection />}
      {(s.contact ?? true) && <ContactSection />}
    </>
  );
}
