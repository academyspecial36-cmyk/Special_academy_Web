import { NextResponse } from "next/server";
import { createServerSupabase, createServiceRoleSupabase } from "@/lib/supabase-server";

export async function GET() {
  try {
    const supabase = await createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const svc = createServiceRoleSupabase();

    const { data: student } = await svc
      .from("students")
      .select("*")
      .eq("email", user.email)
      .maybeSingle();

    const { data: enrollment } = await svc
      .from("enrollments")
      .select("*")
      .eq("auth_user_id", user.id)
      .maybeSingle();

    return NextResponse.json({
      student: student || null,
      enrollment: enrollment || null,
    });
  } catch {
    return NextResponse.json({ error: "Failed to fetch profile" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const svc = createServiceRoleSupabase();

    if (body.name) {
      const { error } = await svc
        .from("students")
        .update({ name: body.name })
        .eq("email", user.email);
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });

      await svc
        .from("profiles")
        .update({ name: body.name })
        .eq("id", user.id);
    }

    if (body.phone) {
      const { error } = await svc
        .from("students")
        .update({ phone: body.phone })
        .eq("email", user.email);
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const enrollmentData: Record<string, unknown> = {};
    if (body.guardianName) enrollmentData.guardian_name = body.guardianName;
    if (body.guardianContact) enrollmentData.guardian_contact = body.guardianContact;
    if (body.address) enrollmentData.address = body.address;

    if (Object.keys(enrollmentData).length > 0) {
      const { error } = await svc
        .from("enrollments")
        .update(enrollmentData)
        .eq("auth_user_id", user.id);
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }
}
