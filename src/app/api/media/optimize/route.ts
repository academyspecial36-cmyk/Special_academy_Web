import { NextResponse } from "next/server";
import { createServiceRoleSupabase } from "@/lib/supabase-server";
import sharp from "sharp";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { id, crop } = body;

    if (!id) {
      return NextResponse.json({ error: "Media ID required" }, { status: 400 });
    }

    const supabase = createServiceRoleSupabase();
    const { data: record, error: fetchError } = await supabase
      .from("media")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchError || !record) {
      return NextResponse.json({ error: "Media not found" }, { status: 404 });
    }

    const urlPath = record.url.split("/").pop();
    if (!urlPath) {
      return NextResponse.json({ error: "Invalid file URL" }, { status: 400 });
    }

    const { data: fileData, error: dlError } = await supabase.storage
      .from("media")
      .download(urlPath);

    if (dlError || !fileData) {
      return NextResponse.json({ error: "Failed to download file" }, { status: 500 });
    }

    const buffer = Buffer.from(await fileData.arrayBuffer());
    let pipeline = sharp(buffer);

    if (crop) {
      const { left, top, width, height } = crop;
      if (left !== undefined && top !== undefined && width && height) {
        pipeline = pipeline.extract({
          left: Math.round(left),
          top: Math.round(top),
          width: Math.round(width),
          height: Math.round(height),
        });
      }
    }

    const optimized = await pipeline
      .resize(1200, 1200, { fit: "inside", withoutEnlargement: true })
      .jpeg({ quality: 80, mozjpeg: true })
      .toBuffer();

    const uniqueName = `opt-${Date.now()}-${Math.random().toString(36).substring(2, 8)}.jpg`;
    const { error: uploadError } = await supabase.storage
      .from("media")
      .upload(uniqueName, optimized, { contentType: "image/jpeg", upsert: false });

    if (uploadError) throw uploadError;

    const { data: urlData } = supabase.storage.from("media").getPublicUrl(uniqueName);
    const meta = await sharp(optimized).metadata();

    const { data: updated, error: updateError } = await supabase
      .from("media")
      .update({
        url: urlData.publicUrl,
        file_name: `optimized-${record.file_name}`,
        file_size: optimized.length,
        mime_type: "image/jpeg",
        width: meta.width ?? null,
        height: meta.height ?? null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (updateError) throw updateError;
    return NextResponse.json(updated);
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
