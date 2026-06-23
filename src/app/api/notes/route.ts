import { NextResponse } from "next/server";
import { createServiceRoleSupabase } from "@/lib/supabase-server";
import { requireAuth } from "@/lib/api/auth-guard";

export async function GET(request: Request) {
  try {
    const { user, error } = await requireAuth();
    if (error) return error;

    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q") || "";
    const tag = searchParams.get("tag") || "";

    const supabase = createServiceRoleSupabase();
    let query = supabase
      .from("notes")
      .select("*")
      .eq("created_by", user.id)
      .order("is_pinned", { ascending: false })
      .order("updated_at", { ascending: false });

    if (q) {
      query = query.or(`title.ilike.%${q}%,content.ilike.%${q}%`);
    }
    if (tag) {
      query = query.contains("tags", [tag]);
    }

    const { data, error: fetchError } = await query;
    if (fetchError) throw fetchError;
    return NextResponse.json(data ?? []);
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { user, error } = await requireAuth();
    if (error) return error;

    const body = await request.json();
    const { title, content, tags, color } = body;

    if (!title?.trim() && !content?.trim()) {
      return NextResponse.json({ error: "Title or content required" }, { status: 400 });
    }

    const supabase = createServiceRoleSupabase();
    const { data, error: insertError } = await supabase
      .from("notes")
      .insert({
        title: title?.trim() || "",
        content: content?.trim() || "",
        tags: tags || [],
        color: color || "#FFFFFF",
        created_by: user.id,
      })
      .select()
      .single();

    if (insertError) throw insertError;
    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
