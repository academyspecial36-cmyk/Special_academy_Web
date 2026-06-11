"use client";

import { useAppContext } from "@/lib/app-context";
import { LandingLoader } from "./landing-loader";
import { HeroSection } from "./hero-section";
import { AboutSection } from "./about-section";
import { WhyChooseSection } from "./why-choose-section";
import { CadetOverviewSection } from "./cadet-overview-section";
import { StatsSection } from "./stats-section";
import { CoursesSection } from "./courses-section";
import { FreeResourcesSection } from "./free-resources-section";
import { NoticesSection } from "./notices-section";
import { TestimonialsSection } from "./testimonials-section";
import { FacultySection } from "./faculty-section";
import { FacilitiesSection } from "./facilities-section";
import { ActivitiesSection } from "./activities-section";
import { GalleryPreviewSection } from "./gallery-preview-section";
import { EnrollmentCtaSection } from "./enrollment-cta-section";
import { BlogSection } from "./blog-section";
import { FaqSection } from "./faq-section";
import { ContactSection } from "./contact-section";

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
