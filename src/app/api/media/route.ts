import { NextResponse } from "next/server";
import { createServiceRoleSupabase } from "@/lib/supabase-server";
import sharp from "sharp";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const folderId = searchParams.get("folder_id");
    const mime = searchParams.get("mime_type");
    const search = searchParams.get("search");

    const supabase = createServiceRoleSupabase();
    let query = supabase.from("media").select("*").order("created_at", { ascending: false });

    if (folderId === "root") {
      query = query.is("folder_id", null);
    } else if (folderId) {
      query = query.eq("folder_id", folderId);
    }
    if (mime) {
      if (mime.endsWith("/")) {
        query = query.ilike("mime_type", `${mime}%`);
      } else {
        query = query.eq("mime_type", mime);
      }
    }
    if (search) {
      query = query.ilike("name", `%${search}%`);
    }

    const { data, error } = await query;
    if (error) throw error;
    return NextResponse.json(data ?? []);
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const supabase = createServiceRoleSupabase();
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const folder_id = formData.get("folder_id") as string | null;
    const alt_text = formData.get("alt_text") as string | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const ext = file.name.split(".").pop()?.toLowerCase() || "bin";
    const uniqueName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`;

    const buffer = Buffer.from(await file.arrayBuffer());
    const { error: uploadError } = await supabase.storage
      .from("media")
      .upload(uniqueName, buffer, {
        contentType: file.type,
        upsert: false,
      });
    if (uploadError) throw uploadError;

    const { data: urlData } = supabase.storage.from("media").getPublicUrl(uniqueName);
    const publicUrl = urlData.publicUrl;

    const isImage = file.type.startsWith("image/");
    let width: number | null = null;
    let height: number | null = null;

    if (isImage) {
      try {
        const img = await sharp(buffer).metadata();
        width = img.width ?? null;
        height = img.height ?? null;
      } catch {
        // ignore metadata errors
      }
    }

    const { data: record, error: dbError } = await supabase
      .from("media")
      .insert({
        name: file.name.replace(/\.[^/.]+$/, ""),
        file_name: file.name,
        file_size: file.size,
        mime_type: file.type,
        url: publicUrl,
        thumbnail_url: null,
        folder_id: folder_id || null,
        alt_text: alt_text || null,
        width,
        height,
      })
      .select()
      .single();

    if (dbError) throw dbError;
    return NextResponse.json(record);
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
