import type { PageContext } from "@/types/ai";

const PAGE_MAP: Record<string, string> = {
  "/dashboard": "Analytics Dashboard",
  "/dashboard/courses": "Courses Management",
  "/dashboard/courses/": "Course Detail",
  "/dashboard/notices": "Notices Management",
  "/dashboard/blog": "Blog Management",
  "/dashboard/faqs": "FAQs Management",
  "/dashboard/gallery": "Gallery Management",
  "/dashboard/students": "Students Management",
  "/dashboard/enrollments": "Enrollments Management",
  "/dashboard/exams": "Exams Management",
  "/dashboard/communications": "Communications Hub",
  "/dashboard/media": "Media Manager",
  "/dashboard/notes": "Notes System",
  "/dashboard/contact-submissions": "Contact Submissions",
  "/dashboard/settings": "Settings",
  "/dashboard/categories": "Categories",
  "/dashboard/faculty": "Faculty Management",
  "/dashboard/testimonials": "Testimonials Management",
  "/dashboard/guide": "Admin Guide",
  "/dashboard/ai": "AI Command Center",
};

export function getPageName(pathname: string): string {
  for (const [prefix, name] of Object.entries(PAGE_MAP)) {
    if (pathname === prefix || pathname.startsWith(prefix)) return name;
  }
  return "Unknown";
}

export function buildContext(pathname: string, searchParams?: URLSearchParams): PageContext {
  const ctx: PageContext = {
    route: pathname,
    pageName: getPageName(pathname),
  };

  if (searchParams) {
    const search = searchParams.get("search");
    if (search) ctx.search = search;
  }

  const parts = pathname.split("/");
  if (parts.length >= 4) {
    const entityType = parts[2];
    const entityId = parts[3];
    if (entityId && entityId.length > 0 && entityId !== "new") {
      ctx.entityId = entityId;
      ctx.entityType = entityType;
    }
  }

  return ctx;
}

export function getContextSummary(ctx: PageContext): string {
  const parts = [`Current page: ${ctx.pageName}`];
  if (ctx.search) parts.push(`Search: "${ctx.search}"`);
  if (ctx.entityType && ctx.entityId) {
    parts.push(`Viewing ${ctx.entityType} ID: ${ctx.entityId}`);
  }
  return parts.join("\n");
}
