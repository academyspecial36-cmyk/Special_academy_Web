import { createServiceRoleSupabase } from "./supabase-server";

export interface BackupEntry {
  id: string;
  timestamp: string;
  type: "manual" | "auto";
  destination: "local" | "cloud";
  status: "success" | "failed";
  fileSize: number | null;
  errorMessage: string | null;
  fileName: string | null;
}

const BACKUP_TABLES = [
  "settings", "courses", "subcategories", "items",
  "faqs", "faculty_members", "notices", "testimonials",
  "gallery_images", "enrollments", "students",
  "exam_categories", "questions", "exam_attempts",
  "course_categories", "notice_categories", "progress",
  "blog_posts", "contact_submissions",
];

export async function exportAllData(): Promise<Record<string, unknown[]>> {
  const svc = createServiceRoleSupabase();
  const result: Record<string, unknown[]> = {};

  for (const table of BACKUP_TABLES) {
    const { data } = await svc.from(table).select("*");
    result[table] = (data as unknown[]) || [];
  }

  return result;
}

export async function importAllData(data: Record<string, unknown[]>) {
  const svc = createServiceRoleSupabase();
  const results: { table: string; imported: number; errors: string }[] = [];

  for (const table of BACKUP_TABLES) {
    const rows = data[table];
    if (!rows || !Array.isArray(rows) || rows.length === 0) {
      results.push({ table, imported: 0, errors: "" });
      continue;
    }

    try {
      const { error } = await svc.from(table).upsert(rows as never, { onConflict: "id" });
      if (error) {
        results.push({ table, imported: 0, errors: error.message });
      } else {
        results.push({ table, imported: rows.length, errors: "" });
      }
    } catch (e) {
      results.push({ table, imported: 0, errors: String(e) });
    }
  }

  return results;
}

export async function uploadToSupabaseStorage(
  jsonData: Record<string, unknown[]>,
): Promise<{ fileName: string; fileSize: number }> {
  const svc = createServiceRoleSupabase();

  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const fileName = `backup-${timestamp}.json`;
  const content = JSON.stringify(jsonData, null, 2);
  const fileSize = new Blob([content]).size;

  const { error: bucketError } = await svc.storage.getBucket("backups");
  if (bucketError?.message?.includes("does not exist") || bucketError?.message?.includes("not found")) {
    await svc.storage.createBucket("backups", { public: false });
  }

  const { error: uploadError } = await svc.storage.from("backups").upload(fileName, content, {
    contentType: "application/json",
    upsert: false,
  });

  if (uploadError) throw uploadError;

  return { fileName, fileSize };
}

export function generateBackupId(): string {
  return crypto.randomUUID();
}

export function isBackupDue(lastBackup: string | null): boolean {
  if (!lastBackup) return true;
  const last = new Date(lastBackup).getTime();
  const week = 7 * 24 * 60 * 60 * 1000;
  return Date.now() - last >= week;
}
