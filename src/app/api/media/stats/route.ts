import { NextResponse } from "next/server";
import { createServiceRoleSupabase } from "@/lib/supabase-server";

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
    });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
