import { NextRequest, NextResponse } from "next/server";
import { createServiceRoleSupabase } from "@/lib/supabase-server";

export async function GET() {
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
    const body = await request.json();
    const supabase = createServiceRoleSupabase();
    const { data, error } = await supabase
      .from("communication_templates")
      .insert({
        name: body.name,
        type: body.type,
        subject: body.subject,
        body: body.body,
        variables: body.variables ?? [],
      })
      .select()
      .single();
    if (error) throw error;
    return NextResponse.json(data, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create template" }, { status: 500 });
  }
}
