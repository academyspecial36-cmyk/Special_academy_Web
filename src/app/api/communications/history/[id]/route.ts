import { NextResponse } from "next/server";
import { createServiceRoleSupabase } from "@/lib/supabase-server";
import { requireAdmin } from "@/lib/api/auth-guard";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { error } = await requireAdmin();
    if (error) return error;

    const { id } = await params;
    const supabase = createServiceRoleSupabase();

    const { data: comm } = await supabase
      .from("communications")
      .select("*")
      .eq("id", id)
      .single();

    if (!comm) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const { data: recipients } = await supabase
      .from("communication_recipients")
      .select("*")
      .eq("communication_id", id)
      .order("status", { ascending: true });

    return NextResponse.json({ ...comm, recipients: recipients ?? [] });
  } catch {
    return NextResponse.json({ error: "Failed to fetch details" }, { status: 500 });
  }
}
