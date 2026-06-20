import { NextResponse } from "next/server";
import { createServiceRoleSupabase } from "@/lib/supabase-server";

const STORAGE_LIMIT = Number(process.env.NEXT_PUBLIC_STORAGE_LIMIT_BYTES) || 1073741824; // 1GB default

export async function GET() {
  try {
    const supabase = createServiceRoleSupabase();
    const { data, error } = await supabase
      .from("media")
      .select("file_size");

    if (error) throw error;

    const totalBytes = (data ?? []).reduce((sum, f) => sum + (f.file_size || 0), 0);
    const totalFiles = (data ?? []).length;

    return NextResponse.json({
      totalBytes,
      totalFiles,
      limit: STORAGE_LIMIT,
      usedPercent: STORAGE_LIMIT > 0 ? Math.round((totalBytes / STORAGE_LIMIT) * 100) : 0,
    });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
