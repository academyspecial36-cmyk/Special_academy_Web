import { NextResponse } from "next/server";
import { createServiceRoleSupabase } from "@/lib/supabase-server";

export async function GET() {
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
