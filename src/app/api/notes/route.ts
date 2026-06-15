import { NextResponse } from "next/server";
import { createServiceRoleSupabase } from "@/lib/supabase-server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q") || "";
    const tag = searchParams.get("tag") || "";

    const supabase = createServiceRoleSupabase();
    let query = supabase
      .from("notes")
      .select("*")
      .order("is_pinned", { ascending: false })
      .order("updated_at", { ascending: false });

    if (q) {
      query = query.or(`title.ilike.%${q}%,content.ilike.%${q}%`);
    }
    if (tag) {
      query = query.contains("tags", [tag]);
    }

    const { data, error } = await query;
    if (error) throw error;
    return NextResponse.json(data ?? []);
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, content, tags, color } = body;

    if (!title?.trim() && !content?.trim()) {
      return NextResponse.json({ error: "Title or content required" }, { status: 400 });
    }

    const supabase = createServiceRoleSupabase();
    const { data, error } = await supabase
      .from("notes")
      .insert({
        title: title?.trim() || "",
        content: content?.trim() || "",
        tags: tags || [],
        color: color || "#FFFFFF",
      })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
