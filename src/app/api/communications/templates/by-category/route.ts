import { NextRequest, NextResponse } from "next/server";
import { createServiceRoleSupabase } from "@/lib/supabase-server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");

    if (!category) {
      return NextResponse.json(
        { error: "Category query parameter is required" },
        { status: 400 }
      );
    }

    const supabase = createServiceRoleSupabase();
    const { data, error } = await supabase
      .from("communication_templates")
      .select("*")
      .eq("category", category)
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) throw error;

    return NextResponse.json(data ?? null);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch template by category" },
      { status: 500 }
    );
  }
}
