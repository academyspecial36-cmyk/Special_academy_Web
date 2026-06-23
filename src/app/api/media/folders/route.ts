import { NextResponse } from "next/server";
import { createServiceRoleSupabase } from "@/lib/supabase-server";
import { requireAdmin } from "@/lib/api/auth-guard";

export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;
  try {
    const supabase = createServiceRoleSupabase();
    const { data, error } = await supabase
      .from("media_folders")
      .select("*")
      .order("name");
    if (error) throw error;
    return NextResponse.json(data ?? []);
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { error: authError } = await requireAdmin();
    if (authError) return authError;

    const body = await request.json();
    const { name, parent_id } = body;
    if (!name?.trim()) {
      return NextResponse.json({ error: "Folder name is required" }, { status: 400 });
    }
    const supabase = createServiceRoleSupabase();
    const { data, error } = await supabase
      .from("media_folders")
      .insert({ name: name.trim(), parent_id: parent_id || null })
      .select()
      .single();
    if (error) throw error;
    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
