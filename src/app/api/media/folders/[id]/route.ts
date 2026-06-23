import { NextResponse } from "next/server";
import { createServiceRoleSupabase } from "@/lib/supabase-server";
import { extractStoragePath } from "@/lib/storage-cleanup";
import { requireAdmin } from "@/lib/api/auth-guard";

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireAdmin();
  if (error) return error;
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, parent_id } = body;
    if (!name?.trim()) {
      return NextResponse.json({ error: "Folder name is required" }, { status: 400 });
    }
    const supabase = createServiceRoleSupabase();
    const { data, error } = await supabase
      .from("media_folders")
      .update({ name: name.trim(), parent_id: parent_id || null })
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}

async function collectDescendantFolderIds(supabase: ReturnType<typeof createServiceRoleSupabase>, folderId: string): Promise<string[]> {
  const ids = [folderId];
  const queue = [folderId];
  while (queue.length > 0) {
    const currentId = queue.shift()!;
    const { data: children } = await supabase
      .from("media_folders")
      .select("id")
      .eq("parent_id", currentId);
    if (children) {
      for (const child of children) {
        ids.push(child.id);
        queue.push(child.id);
      }
    }
  }
  return ids;
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { error: authError } = await requireAdmin();
    if (authError) return authError;

    const { id } = await params;
    const supabase = createServiceRoleSupabase();

    const allFolderIds = await collectDescendantFolderIds(supabase, id);

    const { data: files } = await supabase
      .from("media")
      .select("id, url")
      .in("folder_id", allFolderIds);

    if (files) {
      for (const file of files) {
        if (file.url) {
          const info = extractStoragePath(file.url);
          if (info) {
            await supabase.storage.from(info.bucket).remove([info.path]);
          }
        }
      }
    }

    if (files && files.length > 0) {
      const fileIds = files.map((f) => f.id);
      await supabase.from("media").delete().in("id", fileIds);
    }

    const { error } = await supabase.from("media_folders").delete().in("id", allFolderIds);
    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
