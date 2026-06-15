import { NextResponse } from "next/server";
import { createServiceRoleSupabase } from "@/lib/supabase-server";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const supabase = createServiceRoleSupabase();
    const { data, error } = await supabase.from("media").select("*").eq("id", id).single();
    if (error) throw error;
    if (!data) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const supabase = createServiceRoleSupabase();
    const { name, alt_text, folder_id } = body;
    const updates: Record<string, unknown> = {};
    if (name !== undefined) updates.name = name;
    if (alt_text !== undefined) updates.alt_text = alt_text;
    if (folder_id !== undefined) updates.folder_id = folder_id;
    updates.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from("media")
      .update(updates)
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const supabase = createServiceRoleSupabase();

    const { data: record } = await supabase.from("media").select("url").eq("id", id).single();
    if (record?.url) {
      const urlPath = record.url.split("/").pop();
      if (urlPath) {
        await supabase.storage.from("media").remove([urlPath]);
      }
    }

    const { error } = await supabase.from("media").delete().eq("id", id);
    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
