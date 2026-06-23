import { NextResponse } from "next/server";
import { createServiceRoleSupabase } from "@/lib/supabase-server";
import { PassThrough } from "stream";
import { requireAdmin } from "@/lib/api/auth-guard";

export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;
  const { ZipArchive } = await import("archiver");
  try {
    const supabase = createServiceRoleSupabase();

    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    if (bucketsError) throw bucketsError;
    if (!buckets || buckets.length === 0) {
      return NextResponse.json({ error: "No storage buckets found" }, { status: 404 });
    }

    const zip = new ZipArchive({ zlib: { level: 6 } });
    const pass = new PassThrough();
    const chunks: Buffer[] = [];

    pass.on("data", (chunk: Buffer) => chunks.push(chunk));

    const zipDone = new Promise<void>((resolve, reject) => {
      pass.on("end", () => resolve());
      zip.on("error", (err: Error) => reject(err));
    });

    zip.pipe(pass);

    for (const bucket of buckets) {
      async function listBucket(prefix: string = "") {
        const { data: entries, error } = await supabase.storage.from(bucket.name).list(prefix);
        if (error) return;
        for (const entry of entries ?? []) {
          if (entry.id === null) {
            await listBucket(prefix ? `${prefix}/${entry.name}` : entry.name);
          } else {
            const fullPath = prefix ? `${prefix}/${entry.name}` : entry.name;
            const { data: fileData, error: dlError } = await supabase.storage
              .from(bucket.name)
              .download(fullPath);
            if (dlError || !fileData) continue;
            const buf = Buffer.from(await fileData.arrayBuffer());
            zip.append(buf, { name: `${bucket.name}/${fullPath}` });
          }
        }
      }
      await listBucket();
    }

    zip.finalize();
    await zipDone;

    const total = Buffer.concat(chunks);

    return new NextResponse(total, {
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="media-backup-${new Date().toISOString().split("T")[0]}.zip"`,
        "Content-Length": String(total.length),
      },
    });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
