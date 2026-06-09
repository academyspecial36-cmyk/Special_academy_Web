import { HeroSection } from "@/components/landing/hero-section";
import { AboutSection } from "@/components/landing/about-section";
import { WhyChooseSection } from "@/components/landing/why-choose-section";
import { CadetOverviewSection } from "@/components/landing/cadet-overview-section";
import { StatsSection } from "@/components/landing/stats-section";
import { CoursesSection } from "@/components/landing/courses-section";
import { FreeResourcesSection } from "@/components/landing/free-resources-section";
import { NoticesSection } from "@/components/landing/notices-section";
import { TestimonialsSection } from "@/components/landing/testimonials-section";
import { FacultySection } from "@/components/landing/faculty-section";
import { FacilitiesSection } from "@/components/landing/facilities-section";
import { ActivitiesSection } from "@/components/landing/activities-section";
import { GalleryPreviewSection } from "@/components/landing/gallery-preview-section";
import { EnrollmentCtaSection } from "@/components/landing/enrollment-cta-section";
import { FaqSection } from "@/components/landing/faq-section";
import { ContactSection } from "@/components/landing/contact-section";

export default function HomePage() {
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
      <GalleryPreviewSection />
      <EnrollmentCtaSection />
      <FaqSection />
      <ContactSection />
    </>
  );
}
