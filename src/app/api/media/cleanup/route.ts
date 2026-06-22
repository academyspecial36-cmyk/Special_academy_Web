import { NextResponse } from "next/server";
import { createServiceRoleSupabase } from "@/lib/supabase-server";

export async function POST() {
  try {
    const supabase = createServiceRoleSupabase();

    const { data: files } = await supabase.from("media").select("url");
    const trackedUrls = new Set((files ?? []).map((f) => f.url).filter(Boolean));

    const BUCKET = process.env.NEXT_PUBLIC_BUCKET_NAME || "my-bucket";
    const orphans: { name: string; path: string }[] = [];

    async function listPath(prefix: string = "") {
      const { data: entries, error } = await supabase.storage.from(BUCKET).list(prefix);
      if (error) return;
      for (const entry of entries ?? []) {
        if (entry.id === null) {
          await listPath(prefix ? `${prefix}/${entry.name}` : entry.name);
        } else {
          const fullPath = prefix ? `${prefix}/${entry.name}` : entry.name;
          const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(fullPath);
          if (!trackedUrls.has(urlData.publicUrl)) {
            orphans.push({ name: entry.name, path: fullPath });
          }
        }
      }
    }

    await listPath();

    return NextResponse.json({ orphans, count: orphans.length });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const body = await request.json();
    const { paths, bucket } = body;
    if (!Array.isArray(paths) || paths.length === 0) {
      return NextResponse.json({ error: "No paths provided" }, { status: 400 });
    }

    const BUCKET = bucket || process.env.NEXT_PUBLIC_BUCKET_NAME || "my-bucket";
    const supabase = createServiceRoleSupabase();

    const { error } = await supabase.storage.from(BUCKET).remove(paths);
    if (error) throw error;

    return NextResponse.json({ success: true, deleted: paths.length });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
