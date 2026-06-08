import type { Metadata } from "next";
import Image from "next/image";
import { Target, Eye, Shield, Award, Heart, Users } from "lucide-react";
import { SectionHeader } from "@/components/ui/section-header";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "Learn about Special academy's mission, vision, and commitment to preparing future leaders through discipline and academic excellence.",
};

const milestones = [
  { year: "2010", title: "Founded", description: "Special academy established with a vision to prepare future leaders." },
  { year: "2013", title: "First Batch Success", description: "95% of our first batch secured cadet college admissions." },
  { year: "2016", title: "Expanded Programs", description: "Added scholarship preparation and leadership development courses." },
  { year: "2019", title: "New Campus", description: "Moved to our modern campus with state-of-the-art facilities." },
  { year: "2022", title: "Digital Platform", description: "Launched online learning portal for hybrid education model." },
  { year: "2025", title: "2,500+ Students", description: "Celebrated enrolling over 2,500 students with a 94% success rate." },
];

export default function AboutPage() {
  return (
    <main>
      {/* Hero */}
      <section className="bg-primary py-20 md:py-28 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">About Special academy</h1>
            <p className="text-lg text-white/70 leading-relaxed">
              Since 2010, we have been dedicated to preparing young minds for the rigors of cadet college life. 
              Our holistic approach combines academic excellence with character building and physical fitness.
            </p>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20 md:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-10">
            <div className="p-8 rounded-2xl bg-accent border border-primary/5">
              <div className="w-12 h-12 rounded-xl bg-primary/5 flex items-center justify-center mb-6">
                <Target className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-2xl font-bold text-primary mb-4">Our Mission</h3>
              <p className="text-muted leading-relaxed">
                To prepare disciplined, academically excellent, and morally upright future leaders through 
                comprehensive cadet preparation programs that nurture both mind and character. We strive to 
                instill values of integrity, courage, and service that define true leadership.
              </p>
            </div>
            <div className="p-8 rounded-2xl bg-accent border border-primary/5">
              <div className="w-12 h-12 rounded-xl bg-primary/5 flex items-center justify-center mb-6">
                <Eye className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-2xl font-bold text-primary mb-4">Our Vision</h3>
              <p className="text-muted leading-relaxed">
                To be Nepal&apos;s most trusted and respected cadet preparation institution, recognized for 
                producing leaders who excel in academics, physical fitness, and character. We envision a future 
                where every aspiring cadet has access to world-class preparation.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 md:py-28 bg-accent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            label="Core Values"
            title="The Principles That Guide Us"
          />
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: Shield, title: "Discipline", desc: "Military-grade discipline forms the foundation of everything we teach." },
              { icon: Award, title: "Excellence", desc: "We pursue the highest standards in academics, physical fitness, and character." },
              { icon: Heart, title: "Integrity", desc: "Honesty and moral uprightness are non-negotiable values for our students." },
              { icon: Users, title: "Teamwork", desc: "We believe in collective success and collaborative learning environments." },
              { icon: Target, title: "Commitment", desc: "Unwavering dedication to every student's success journey." },
              { icon: Eye, title: "Innovation", desc: "Continuously evolving our methods to deliver the best preparation." },
            ].map((v) => (
              <div key={v.title} className="p-6 bg-white rounded-xl border border-primary/5">
                <v.icon className="w-6 h-6 text-secondary mb-4" />
                <h4 className="font-semibold text-primary mb-2">{v.title}</h4>
                <p className="text-sm text-muted">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-20 md:py-28 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            label="Our Journey"
            title="Milestones of Excellence"
          />
          <div className="relative">
            <div className="absolute left-6 md:left-8 top-0 bottom-0 w-px bg-primary/10" />
            <div className="space-y-10">
              {milestones.map((m) => (
                <div key={m.year} className="relative flex gap-6 md:gap-8">
                  <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm md:text-base shrink-0 z-10">
                    {m.year}
                  </div>
                  <div className="pt-2">
                    <h4 className="text-lg font-semibold text-primary mb-1">{m.title}</h4>
                    <p className="text-sm text-muted">{m.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
