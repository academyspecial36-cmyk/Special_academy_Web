import { createServiceRoleSupabase } from "@/lib/supabase-server";
import { getSupabase } from "@/lib/supabase";

function getClient() {
  try {
    return createServiceRoleSupabase();
  } catch {
    return getSupabase();
  }
}

const BUCKET = process.env.NEXT_PUBLIC_BUCKET_NAME || "my-bucket";

export function extractStoragePath(url: string): { bucket: string; path: string } | null {
  try {
    const parsed = new URL(url);
    const match = parsed.pathname.match(/\/storage\/v1\/object\/public\/([^/]+)\/(.+)/);
    if (match) {
      return { bucket: match[1], path: match[2] };
    }
    if (!url.startsWith("http")) {
      return { bucket: BUCKET, path: url };
    }
    return null;
  } catch {
    return null;
  }
}

export async function deleteStorageFile(url: string | null | undefined): Promise<void> {
  if (!url) return;
  const info = extractStoragePath(url);
  if (!info) return;
  try {
    const sb = getClient();
    if (sb) await sb.storage.from(info.bucket).remove([info.path]);
  } catch {
    // Storage deletion should never break the main flow
  }
}

export async function deleteStorageFiles(urls: (string | null | undefined)[]): Promise<void> {
  await Promise.all(urls.map((u) => deleteStorageFile(u)));
}

const TABLES_WITH_MEDIA: Record<string, string[]> = {
  courses: ["image"],
  subcategories: ["thumbnail"],
  items: ["url"],
  notices: ["image"],
  faculty_members: ["image"],
  testimonials: ["image"],
  gallery_images: ["src"],
  blog_posts: ["image", "thumbnail"],
};

export function getMediaFields(table: string): string[] {
  return TABLES_WITH_MEDIA[table] ?? [];
}

export async function cleanupTableRecordMedia(table: string, record: Record<string, unknown>): Promise<void> {
  const fields = getMediaFields(table);
  if (fields.length === 0) return;
  const urls = fields.map((f) => (record[f] ?? record[f.replace(/([A-Z])/g, "_$1").toLowerCase()]) as string | null | undefined);
  await deleteStorageFiles(urls);

  if (table === "courses") {
    try {
      const sb = getClient();
      if (!sb) return;
      const courseId = record.id as string;

      const { data: subs } = await sb.from("subcategories").select("id, thumbnail").eq("course_id", courseId);
      for (const sub of subs ?? []) {
        await deleteStorageFile(sub.thumbnail as string | null | undefined);
      }

      const subIds = (subs ?? []).map((s: Record<string, unknown>) => s.id as string);
      if (subIds.length > 0) {
        const { data: itemRows } = await sb.from("items").select("url").in("subcategory_id", subIds);
        await deleteStorageFiles((itemRows ?? []).map((r: Record<string, unknown>) => r.url as string | null | undefined));
      }
    } catch {
      // Cascade cleanup should not break
    }
  }
}
