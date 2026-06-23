import { NextResponse } from "next/server";
import { createServiceRoleSupabase } from "@/lib/supabase-server";
import sharp from "sharp";
import { PDFDocument } from "pdf-lib";
import { requireAdmin } from "@/lib/api/auth-guard";

export async function GET(request: Request) {
  const { error } = await requireAdmin();
  if (error) return error;
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

async function optimizeBuffer(buffer: Buffer, mime: string): Promise<Buffer> {
  if (mime.startsWith("image/")) {
    const pipeline = sharp(buffer);
    if (mime === "image/jpeg" || mime === "image/jpg") {
      return pipeline.jpeg({ quality: 100, mozjpeg: true }).toBuffer() as Promise<Buffer>;
    }
    if (mime === "image/png") {
      return pipeline.png({ compressionLevel: 9, palette: true }).toBuffer() as Promise<Buffer>;
    }
    if (mime === "image/webp") {
      return pipeline.webp({ lossless: true }).toBuffer() as Promise<Buffer>;
    }
    if (mime === "image/avif") {
      return pipeline.avif({ lossless: true }).toBuffer() as Promise<Buffer>;
    }
    if (mime === "image/gif") {
      return pipeline.gif().toBuffer() as Promise<Buffer>;
    }
    if (mime === "image/tiff") {
      return pipeline.tiff({ compression: "lzw" }).toBuffer() as Promise<Buffer>;
    }
  }
  if (mime === "application/pdf") {
    try {
      const doc = await PDFDocument.load(buffer, { ignoreEncryption: true });
      doc.setTitle("");
      doc.setAuthor("");
      doc.setSubject("");
      doc.setKeywords([]);
      doc.setProducer("");
      doc.setCreator("");
      const saved = await doc.save({ useObjectStreams: true });
      if (saved.length < buffer.length) return Buffer.from(saved);
    } catch {
      // If PDF optimization fails, return original
    }
  }
  return buffer;
}

export async function POST(request: Request) {
  try {
    const { error } = await requireAdmin();
    if (error) return error;

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

    const raw = await file.arrayBuffer();
    let buffer = Buffer.from(raw);
    let mimeType = file.type;

    if (file.type.startsWith("image/") || file.type === "application/pdf") {
      buffer = Buffer.from(await optimizeBuffer(buffer, file.type));
    }

    const { error: uploadError } = await supabase.storage
      .from("media")
      .upload(uniqueName, buffer, {
        contentType: mimeType,
        upsert: false,
      });
    if (uploadError) throw uploadError;

    const { data: urlData } = supabase.storage.from("media").getPublicUrl(uniqueName);
    const publicUrl = urlData.publicUrl;

    const isImage = mimeType.startsWith("image/");
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
        file_size: buffer.length,
        mime_type: mimeType,
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
