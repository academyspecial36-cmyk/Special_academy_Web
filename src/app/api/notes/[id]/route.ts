import { NextResponse } from "next/server";
import { createServiceRoleSupabase } from "@/lib/supabase-server";
import { requireAuth } from "@/lib/api/auth-guard";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { user, error } = await requireAuth();
    if (error) return error;

    const { id } = await params;
    const supabase = createServiceRoleSupabase();
    const { data, error: fetchError } = await supabase.from("notes").select("*").eq("id", id).eq("created_by", user.id).single();
    if (fetchError) throw fetchError;
    if (!data) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { user, error } = await requireAuth();
    if (error) return error;

    const { id } = await params;
    const body = await request.json();
    const { title, content, tags, color, is_pinned } = body;

    const supabase = createServiceRoleSupabase();
    const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (title !== undefined) updates.title = title.trim();
    if (content !== undefined) updates.content = content.trim();
    if (tags !== undefined) updates.tags = tags;
    if (color !== undefined) updates.color = color;
    if (is_pinned !== undefined) updates.is_pinned = is_pinned;

    const { data, error: updateError } = await supabase
      .from("notes")
      .update(updates)
      .eq("id", id)
      .eq("created_by", user.id)
      .select()
      .single();

    if (updateError) throw updateError;
    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { user, error } = await requireAuth();
    if (error) return error;

    const { id } = await params;
    const supabase = createServiceRoleSupabase();
    const { error: deleteError } = await supabase.from("notes").delete().eq("id", id).eq("created_by", user.id);
    if (deleteError) throw deleteError;
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
