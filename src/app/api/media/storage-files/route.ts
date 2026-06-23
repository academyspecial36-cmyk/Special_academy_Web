import { NextResponse } from "next/server";
import { createServiceRoleSupabase } from "@/lib/supabase-server";
import { requireAdmin } from "@/lib/api/auth-guard";

const CONTENT_TABLES: Record<string, string[]> = {
  courses: ["image"],
  subcategories: ["thumbnail"],
  items: ["url"],
  notices: ["image"],
  faculty_members: ["image"],
  testimonials: ["image"],
  gallery_images: ["src"],
  blog_posts: ["image", "thumbnail"],
};

export interface StorageFileItem {
  bucket: string;
  name: string;
  path: string;
  url: string;
  file_size: number;
  mime_type: string;
  created_at: string;
  updated_at: string;
  in_use: boolean;
  tracked: boolean;
  refs: { table: string; field: string }[];
}

export interface StorageStats {
  totalBytes: number;
  totalFiles: number;
  buckets: { name: string; files: number; bytes: number }[];
}

interface BucketInfo {
  name: string;
  files: number;
  bytes: number;
}

export async function GET() {
  try {
    const { error } = await requireAdmin();
    if (error) return error;

    const svc = createServiceRoleSupabase();

    // 1. Collect all referenced URLs from content tables
    const referencedUrls = new Set<string>();
    const refMap = new Map<string, { table: string; field: string }[]>();

    for (const [table, fields] of Object.entries(CONTENT_TABLES)) {
      const { data: rows } = await svc.from(table).select(fields.map((f) => f).join(", "));
      if (rows) {
        for (const row of rows as unknown as Record<string, unknown>[]) {
          for (const field of fields) {
            const val = row[field];
            if (typeof val === "string" && val.startsWith("http")) {
              referencedUrls.add(val);
              if (!refMap.has(val)) refMap.set(val, []);
              refMap.get(val)!.push({ table, field });
            }
          }
        }
      }
    }

    // 2. Also check the media table
    const { data: mediaRows } = await svc.from("media").select("url");
    const trackedUrls = new Set((mediaRows ?? []).map((r) => r.url).filter(Boolean));

    // 3. List all storage buckets
    const { data: buckets, error: bucketError } = await svc.storage.listBuckets();
    if (bucketError) throw bucketError;
    if (!buckets || buckets.length === 0) {
      return NextResponse.json({ files: [], total: 0, inUse: 0, orphaned: 0, stats: { totalBytes: 0, totalFiles: 0, buckets: [] } });
    }

    const allFiles: StorageFileItem[] = [];
    const bucketStats: BucketInfo[] = [];

    for (const bucket of buckets) {
      let bucketFiles = 0;
      let bucketBytes = 0;

      async function listPath(prefix: string = "") {
        const { data: entries, error } = await svc.storage.from(bucket.name).list(prefix);
        if (error) return;
        for (const entry of entries ?? []) {
          if (entry.id === null) {
            await listPath(prefix ? `${prefix}/${entry.name}` : entry.name);
          } else {
            const path = prefix ? `${prefix}/${entry.name}` : entry.name;
            const { data: urlData } = svc.storage.from(bucket.name).getPublicUrl(path);
            const url = urlData.publicUrl;
            const size = entry.metadata?.size ?? 0;
            const mime = entry.metadata?.mimetype ?? "application/octet-stream";
            const inUse = referencedUrls.has(url);
            const tracked = trackedUrls.has(url);
            allFiles.push({
              bucket: bucket.name,
              name: entry.name,
              path,
              url,
              file_size: size,
              mime_type: mime,
              created_at: entry.created_at ?? new Date().toISOString(),
              updated_at: entry.updated_at ?? entry.created_at ?? new Date().toISOString(),
              in_use: inUse || tracked,
              tracked,
              refs: refMap.get(url) ?? [],
            });
            bucketFiles++;
            bucketBytes += size;
          }
        }
      }

      await listPath();
      bucketStats.push({ name: bucket.name, files: bucketFiles, bytes: bucketBytes });
    }

    allFiles.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    const totalBytes = bucketStats.reduce((s, b) => s + b.bytes, 0);
    const totalFiles = allFiles.length;

    return NextResponse.json({
      files: allFiles,
      total: totalFiles,
      inUse: allFiles.filter((f) => f.in_use).length,
      orphaned: allFiles.filter((f) => !f.in_use).length,
      stats: { totalBytes, totalFiles, buckets: bucketStats },
    });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
