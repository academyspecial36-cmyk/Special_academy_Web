import { NextResponse } from "next/server";
import { createServerSupabase, createServiceRoleSupabase } from "@/lib/supabase-server";

export async function GET() {
  try {
    const supabase = await createServerSupabase();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    const role = profile?.role ?? "student";

    if (role === "admin") {
      return NextResponse.json({ status: "approved", role: "admin" });
    }

    const svc = createServiceRoleSupabase();

    const { data: enrollment } = await svc
      .from("enrollments")
      .select("status, rejection_message")
      .eq("auth_user_id", user.id)
      .maybeSingle();

    if (!enrollment) {
      const { data: existingStudent } = await svc
        .from("students")
        .select("id")
        .eq("email", user.email)
        .maybeSingle();

      if (existingStudent) {
        return NextResponse.json({ status: "approved", role: "student" });
      }

      return NextResponse.json({ status: "unknown", role: "student" });
    }

    return NextResponse.json({
      status: enrollment.status,
      rejectionMessage: enrollment.rejection_message || null,
      role: "student",
    });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
