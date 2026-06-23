import { NextResponse } from "next/server";
import { createServiceRoleSupabase } from "@/lib/supabase-server";
import { extractStoragePath } from "@/lib/storage-cleanup";
import { requireAdmin } from "@/lib/api/auth-guard";

export async function POST(request: Request) {
  const { error } = await requireAdmin();
  if (error) return error;
  try {
    const { ids } = await request.json();
    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: "No IDs provided" }, { status: 400 });
    }

    const supabase = createServiceRoleSupabase();

    const { data: records } = await supabase.from("media").select("id, url").in("id", ids);
    if (records) {
      for (const record of records) {
        if (record.url) {
          const info = extractStoragePath(record.url);
          if (info) {
            await supabase.storage.from(info.bucket).remove([info.path]);
          }
        }
      }
    }

    const { error } = await supabase.from("media").delete().in("id", ids);
    if (error) throw error;

    return NextResponse.json({ success: true, deleted: ids.length });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
