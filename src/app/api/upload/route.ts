import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase-server";
import { validateUploadFile } from "@/lib/rate-limit";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const files = formData.getAll("files") as File[];
    const singleFile = formData.get("file") as File | null;
    const folder = (formData.get("folder") as string) || "images";

    if (!files.length && !singleFile) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const allFiles = files.length > 0 ? files : [singleFile!];
    for (const file of allFiles) {
      const validation = validateUploadFile(file);
      if (!validation.valid) {
        return NextResponse.json({ error: validation.error }, { status: 400 });
      }
    }

    const bucket = process.env.NEXT_PUBLIC_BUCKET_NAME || "my-bucket";

    const supabase = await createServerSupabase();
    const urls: string[] = [];

    for (const file of allFiles) {
      const ext = file.name.split(".").pop();
      const path = `${folder}/${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`;

      const { error: uploadError } = await supabase.storage.from(bucket).upload(path, file);
      if (uploadError) {
        return NextResponse.json({ error: uploadError.message }, { status: 500 });
      }

      const { data } = supabase.storage.from(bucket).getPublicUrl(path);
      urls.push(data.publicUrl);
    }

    if (singleFile && files.length === 0) {
      return NextResponse.json({ url: urls[0] });
    }

    return NextResponse.json({ urls });
  } catch {
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
