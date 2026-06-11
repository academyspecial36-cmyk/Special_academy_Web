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
  const { loading } = useAppContext();

  if (loading) return <LandingLoader />;

  return (
    <>
      <HeroSection />
      <AboutSection />
      <WhyChooseSection />
      <CadetOverviewSection />
      <StatsSection />
      <CoursesSection />
      <FreeResourcesSection />
      <NoticesSection />
      <TestimonialsSection />
      <FacultySection />
      <FacilitiesSection />
      <ActivitiesSection />
      <BlogSection />
      <GalleryPreviewSection />
      <EnrollmentCtaSection />
      <FaqSection />
      <ContactSection />
    </>
  );
}
