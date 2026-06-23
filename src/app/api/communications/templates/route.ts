import { NextRequest, NextResponse } from "next/server";
import { createServiceRoleSupabase } from "@/lib/supabase-server";
import { requireAdmin } from "@/lib/api/auth-guard";

export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;
  try {
    const supabase = createServiceRoleSupabase();
    const { data } = await supabase
      .from("communication_templates")
      .select("*")
      .order("updated_at", { ascending: false });
    return NextResponse.json(data ?? []);
  } catch {
    return NextResponse.json({ error: "Failed to fetch templates" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { error: authError } = await requireAdmin();
    if (authError) return authError;

    let parsed: Record<string, unknown>;
    try {
      parsed = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }
    const supabase = createServiceRoleSupabase();
    const insertPayload = {
      name: parsed.name,
      type: parsed.type,
      subject: parsed.subject,
      body: parsed.body,
      variables: parsed.variables ?? [],
      category: parsed.category || "custom",
      config: parsed.config ?? {},
    };
    const { data, error } = await supabase
      .from("communication_templates")
      .insert(insertPayload)
      .select()
      .single();
    if (error) {
      console.error("Supabase insert error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json(data, { status: 201 });
  } catch (e) {
    console.error("POST /api/communications/templates unexpected error:", e);
    return NextResponse.json({ error: "Failed to create template" }, { status: 500 });
  }
}
