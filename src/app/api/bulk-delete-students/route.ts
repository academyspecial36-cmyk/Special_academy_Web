import { NextResponse } from "next/server";
import { createServiceRoleSupabase } from "@/lib/supabase-server";

export async function POST(request: Request) {
  try {
    const { ids } = await request.json();
    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: "No IDs provided" }, { status: 400 });
    }

    const svc = createServiceRoleSupabase();
    const { error } = await svc.from("students").delete().in("id", ids);
    if (error) throw error;

    return NextResponse.json({ success: true, deleted: ids.length });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
