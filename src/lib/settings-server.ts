import { createServiceRoleSupabase } from "./supabase-server";
import type { SocialLinks } from "./app-context";

export type SectionKey =
  | "hero" | "about" | "whyChoose" | "cadetOverview" | "stats"
  | "courses" | "freeResources" | "notices" | "testimonials" | "faculty"
  | "facilities" | "activities" | "gallery" | "enrollmentCta" | "faq"
  | "contact" | "blog";

export interface LandingConfig {
  hero: {
    title: string;
    subtitle: string;
    badge: string;
    image: string;
  };
  about: {
    title: string;
    description: string;
    image: string;
    values: { title: string; description: string }[];
  };
  stats: { label: string; value: string; suffix?: string; description?: string }[];
  seo?: { metaDescription: string; gaTrackingId: string };
  sections?: Record<SectionKey, boolean>;
  cta?: { title: string; subtitle: string; buttonText: string; buttonLink: string };
  footer?: { copyright: string; description: string };
}

export interface AppSettings {
  academyName: string;
  tagline: string;
  description: string;
  address: string;
  email: string;
  admissionEmail: string;
  phone: string;
  secondaryPhone: string;
  website: string;
  officeHours: string;
  holiday: string;
  appIcon: string;
  socialLinks: SocialLinks;
  enableBlog: boolean;
  maintenanceMode: boolean;
  config: LandingConfig;
  seo: { metaDescription: string; gaTrackingId: string };
}

const envDefaults: Partial<AppSettings> = {
  academyName: process.env.NEXT_PUBLIC_SITE_NAME || "Special Academy",
  email: process.env.ADMIN_EMAIL || "info@cadetacademy.edu",
  website: process.env.NEXT_PUBLIC_SITE_URL || "https://cadetacademy.edu",
};

const defaultLandingConfig: LandingConfig = {
  hero: {
    title: "Preparing Future Cadets Through Discipline & Excellence",
    subtitle:
      "We help students develop academic excellence, leadership skills, confidence, and discipline for cadet entrance success. Join Nepal's most trusted cadet preparation academy.",
    badge: "Admission Open for 2026-27 Session",
    image:
      "https://images.unsplash.com/photo-1763656443687-c3de11b68813?q=80&w=687&auto=format&fit=crop",
  },
  about: {
    title: "Building Future Leaders Since 2010",
    description:
      "Special academy has been the trusted choice for parents and students aspiring for cadet college admissions. Our holistic approach combines academic rigor with character building.",
    image:
      "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800&q=80",
    values: [
      {
        title: "Mission",
        description:
          "To prepare disciplined, academically excellent, and morally upright future leaders through comprehensive cadet preparation programs.",
      },
      {
        title: "Discipline",
        description:
          "We instill military-grade discipline, punctuality, and self-control that forms the foundation of successful cadet life.",
      },
      {
        title: "Excellence",
        description:
          "Pursuit of academic and personal excellence is at the core of everything we teach, ensuring our students stand out.",
      },
      {
        title: "Character",
        description:
          "Building strong character, integrity, and leadership qualities that last a lifetime beyond cadet college admission.",
      },
    ],
  },
  stats: [
    { label: "Students Enrolled", value: "2500", suffix: "+", description: "Since 2010" },
    { label: "Success Rate", value: "94", suffix: "%", description: "College admission" },
    { label: "Expert Faculty", value: "35", suffix: "+", description: "Qualified instructors" },
    { label: "Years Experience", value: "15", suffix: "+", description: "In education" },
  ],
  sections: {
    hero: true, about: true, whyChoose: true, cadetOverview: true,
    stats: true, courses: true, freeResources: true, notices: true,
    testimonials: true, faculty: true, facilities: true, activities: true,
    gallery: true, enrollmentCta: true, faq: true, contact: true, blog: true,
  },
  cta: {
    title: "Start Your Cadet Journey Today",
    subtitle: "Join Nepal's most trusted cadet preparation academy and take the first step toward a disciplined, successful future.",
    buttonText: "Enroll Now",
    buttonLink: "/enroll",
  },
  footer: {
    copyright: "© 2026 Special Academy. All rights reserved.",
    description: "Special Academy is Nepal's premier cadet preparation institution, dedicated to shaping disciplined, academically excellent, and morally upright future leaders.",
  },
};

export function getDefaultSettings(): AppSettings {
  return {
    academyName: "Special Academy",
    tagline: "Preparing Future Leaders Through Discipline & Excellence",
    description: "Nepal's premier cadet preparation academy.",
    address: "Kathmandu, Nepal",
    email: "info@cadetacademy.edu",
    admissionEmail: "admission@cadetacademy.edu",
    phone: "986-0302036",
    secondaryPhone: "986-0302036",
    website: "https://cadetacademy.edu",
    officeHours: "Sun-Thu: 9:00 AM - 5:00 PM",
    holiday: "Friday & Public Holidays",
    appIcon: "/icon-image.png",
    socialLinks: {
      facebook: "",
      instagram: "",
      tiktok: "",
      youtube: "",
    },
    enableBlog: true,
    maintenanceMode: false,
    config: defaultLandingConfig,
    seo: { metaDescription: "", gaTrackingId: "" },
  };
}

export async function fetchSettings(): Promise<AppSettings> {
  try {
    const svc = createServiceRoleSupabase();
    const { data } = await svc.from("settings").select("*").maybeSingle();
    if (!data) return { ...getDefaultSettings(), ...envDefaults };

    const row = data as Record<string, unknown>;
    const rawConfig = (row.config as Record<string, unknown>) || {};
    const config: LandingConfig = {
      hero: { ...defaultLandingConfig.hero, ...((rawConfig.hero as Record<string, unknown>) || {}) },
      about: { ...defaultLandingConfig.about, ...((rawConfig.about as Record<string, unknown>) || {}) },
      stats: Array.isArray(rawConfig.stats) ? (rawConfig.stats as typeof defaultLandingConfig.stats) : defaultLandingConfig.stats,
      sections: { ...defaultLandingConfig.sections, ...(rawConfig.sections || {}) as Record<string, boolean> } as Record<SectionKey, boolean>,
      cta: { ...defaultLandingConfig.cta, ...(rawConfig.cta || {}) as Record<string, string> } as { title: string; subtitle: string; buttonText: string; buttonLink: string },
      footer: { ...defaultLandingConfig.footer, ...(rawConfig.footer || {}) as Record<string, string> } as { copyright: string; description: string },
    };
    const socialLinks = (row.social_links as SocialLinks) || getDefaultSettings().socialLinks;

    return {
      academyName:
        String(row.academy_name || row.academyName || envDefaults.academyName || getDefaultSettings().academyName),
      tagline: String(row.tagline || getDefaultSettings().tagline),
      description: String(row.description || getDefaultSettings().description),
      address: String(row.address || getDefaultSettings().address),
      email: String(row.email || envDefaults.email || getDefaultSettings().email),
      admissionEmail: String(row.admission_email || row.admissionEmail || getDefaultSettings().admissionEmail),
      phone: String(row.phone || getDefaultSettings().phone),
      secondaryPhone: String(row.secondary_phone || row.secondaryPhone || getDefaultSettings().secondaryPhone),
      website: String(row.website || envDefaults.website || getDefaultSettings().website),
      officeHours: String(row.office_hours || row.officeHours || getDefaultSettings().officeHours),
      holiday: String(row.holiday || getDefaultSettings().holiday),
      appIcon: String(row.app_icon || row.appIcon || getDefaultSettings().appIcon),
      socialLinks,
      enableBlog: row.enable_blog !== false,
      maintenanceMode: row.maintenance_mode === true,
      config,
      seo: {
        metaDescription: String(config.seo?.metaDescription || ""),
        gaTrackingId: String(config.seo?.gaTrackingId || ""),
      },
    };
  } catch {
    return { ...getDefaultSettings(), ...envDefaults };
  }
}
