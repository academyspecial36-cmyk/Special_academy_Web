import { NextResponse } from "next/server";
import { createServiceRoleSupabase } from "@/lib/supabase-server";
import { requireAdmin } from "@/lib/api/auth-guard";

export const dynamic = "force-dynamic";

export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;
  try {
    const supabase = createServiceRoleSupabase();
    const { data } = await supabase
      .from("communications")
      .select("*")
      .order("created_at", { ascending: false });
    return NextResponse.json(data ?? []);
  } catch {
    return NextResponse.json({ error: "Failed to fetch history" }, { status: 500 });
  }
}
