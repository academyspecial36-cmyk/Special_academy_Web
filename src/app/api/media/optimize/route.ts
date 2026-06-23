import { NextResponse } from "next/server";
import { createServiceRoleSupabase } from "@/lib/supabase-server";
import { extractStoragePath } from "@/lib/storage-cleanup";
import sharp from "sharp";
import { requireAdmin } from "@/lib/api/auth-guard";

export async function POST(request: Request) {
  const { error } = await requireAdmin();
  if (error) return error;
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

    const info = extractStoragePath(record.url);
    if (!info) {
      return NextResponse.json({ error: "Invalid file URL" }, { status: 400 });
    }

    const { data: fileData, error: dlError } = await supabase.storage
      .from(info.bucket)
      .download(info.path);

    if (dlError || !fileData) {
      return NextResponse.json({ error: "Failed to download file" }, { status: 500 });
    }

    const buffer = Buffer.from(await fileData.arrayBuffer() as ArrayBuffer);
    const mime = record.mime_type as string;
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

    let optimized: Buffer;
    let contentType: string;
    let ext: string;

    if (mime === "image/jpeg" || mime === "image/jpg") {
      optimized = await pipeline.jpeg({ quality: 100, mozjpeg: true }).toBuffer();
      contentType = "image/jpeg";
      ext = "jpg";
    } else if (mime === "image/png") {
      optimized = await pipeline.png({ compressionLevel: 9, palette: true }).toBuffer();
      contentType = "image/png";
      ext = "png";
    } else if (mime === "image/webp") {
      optimized = await pipeline.webp({ lossless: true }).toBuffer();
      contentType = "image/webp";
      ext = "webp";
    } else if (mime === "image/avif") {
      optimized = await pipeline.avif({ lossless: true }).toBuffer();
      contentType = "image/avif";
      ext = "avif";
    } else if (mime === "image/gif") {
      optimized = await pipeline.gif().toBuffer();
      contentType = "image/gif";
      ext = "gif";
    } else if (mime === "image/tiff") {
      optimized = await pipeline.tiff({ compression: "lzw" }).toBuffer();
      contentType = "image/tiff";
      ext = "tiff";
    } else {
      optimized = await pipeline.jpeg({ quality: 100, mozjpeg: true }).toBuffer();
      contentType = "image/jpeg";
      ext = "jpg";
    }

    const oldPath = info.path;
    const newPath = oldPath.replace(/\.[^/.]+$/, "") + "." + ext;

    const { error: removeError } = await supabase.storage.from(info.bucket).remove([oldPath]);
    if (removeError) throw removeError;

    const { error: uploadError } = await supabase.storage
      .from(info.bucket)
      .upload(newPath, optimized, { contentType, upsert: false });
    if (uploadError) throw uploadError;

    const { data: urlData } = supabase.storage.from(info.bucket).getPublicUrl(newPath);
    const meta = await sharp(optimized).metadata();

    const { data: updated, error: updateError } = await supabase
      .from("media")
      .update({
        url: urlData.publicUrl,
        file_name: record.file_name,
        file_size: optimized.length,
        mime_type: contentType,
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
