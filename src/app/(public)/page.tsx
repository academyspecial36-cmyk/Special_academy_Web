import { Suspense } from "react";
import { LandingContent } from "@/components/landing/landing-content";
import { LandingLoader } from "@/components/landing/landing-loader";

export default function HomePage() {
  return (
    <Suspense fallback={<LandingLoader />}>
      <LandingContent />
    </Suspense>
  );
}
