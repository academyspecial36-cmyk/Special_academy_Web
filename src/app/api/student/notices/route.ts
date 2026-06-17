import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase-server";
import { transformKeys } from "@/lib/api/table-config";

export async function GET() {
  try {
    const supabase = await createServerSupabase();
    const { data, error } = await supabase
      .from("notices")
      .select("*")
      .order("is_pinned", { ascending: false })
      .order("date", { ascending: false });

    if (error) {
      return NextResponse.json([]);
    }

    const notices = (data || []).map((d: Record<string, unknown>) =>
      transformKeys(d, "notices", false)
    );

    return NextResponse.json(notices);
  } catch {
    return NextResponse.json([]);
  }
}
