// Server-side cache helper for bootstrap and settings data
import { fetchSettings, clearSettingsCache } from "./settings-server";
import { handleGet } from "./api-helpers";

let cachedBootstrap: any = null;
let cacheExpiry = 0;
const CACHE_TTL_MS = 30_000; // 30 seconds cache

export function clearBootstrapCache() {
  cachedBootstrap = null;
  cacheExpiry = 0;
  clearSettingsCache();
}

export async function getBootstrapData() {
  const now = Date.now();
  if (cachedBootstrap && now < cacheExpiry) {
    return cachedBootstrap;
  }

  // Fetch settings and all public tables in parallel
  const [
    settings,
    faqRes,
    facultyRes,
    courseRes,
    noticeRes,
    testimonialRes,
    galleryRes,
    catRes,
    noticeCatRes,
    subRes,
    itemsRes,
    examCatRes,
    examSubRes,
    qRes,
    qualificationRes,
  ] = await Promise.all([
    fetchSettings(),
    handleGet("faqs").then((r) => r.json()),
    handleGet("faculty_members").then((r) => r.json()),
    handleGet("courses").then((r) => r.json()),
    handleGet("notices").then((r) => r.json()),
    handleGet("testimonials").then((r) => r.json()),
    handleGet("gallery_images").then((r) => r.json()),
    handleGet("course_categories").then((r) => r.json()),
    handleGet("notice_categories").then((r) => r.json()),
    handleGet("subcategories").then((r) => r.json()),
    handleGet("items").then((r) => r.json()),
    handleGet("exam_categories").then((r) => r.json()),
    handleGet("exam_subcategories").then((r) => r.json()),
    handleGet("questions").then((r) => r.json()),
    handleGet("qualifications").then((r) => r.json()),
  ]);

  cachedBootstrap = {
    settings,
    faqs: faqRes,
    facultyMembers: facultyRes,
    courses: courseRes,
    notices: noticeRes,
    testimonials: testimonialRes,
    galleryImages: galleryRes,
    courseCategories: catRes,
    noticeCategories: noticeCatRes,
    subcategories: subRes,
    items: itemsRes,
    examCategories: examCatRes,
    examSubcategories: examSubRes,
    questions: qRes,
    qualifications: qualificationRes,
  };

  cacheExpiry = Date.now() + CACHE_TTL_MS;
  return cachedBootstrap;
}
