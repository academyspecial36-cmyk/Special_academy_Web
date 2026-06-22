import { NextResponse } from "next/server";
import { createServiceRoleSupabase } from "@/lib/supabase-server";

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const svc = createServiceRoleSupabase();

    const { error } = await svc.from("enrollments").delete().eq("id", id);
    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
