import { NextResponse } from "next/server";
import { createServerSupabase, createServiceRoleSupabase } from "@/lib/supabase-server";
import { sendRejectionEmail, sendApprovalEmail } from "@/lib/email";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { action, rejectionMessage } = await request.json();

    if (!action || !["approved", "rejected"].includes(action)) {
      return NextResponse.json(
        { success: false, error: "Action must be 'approved' or 'rejected'" },
        { status: 400 }
      );
    }

    if (action === "rejected" && !rejectionMessage) {
      return NextResponse.json(
        { success: false, error: "Rejection message is required" },
        { status: 400 }
      );
    }

    const auth = await createServerSupabase();

    const { data: { user } } = await auth.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: profile } = await auth
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (!profile || profile.role !== "admin") {
      return NextResponse.json(
        { error: "Forbidden: admin access required" },
        { status: 403 }
      );
    }

    const svc = createServiceRoleSupabase();

    const { data: enrollment, error: fetchError } = await svc
      .from("enrollments")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchError || !enrollment) {
      return NextResponse.json(
        { error: "Enrollment not found" },
        { status: 404 }
      );
    }

    if (enrollment.status !== "pending") {
      return NextResponse.json(
        { error: "Only pending enrollments can be reviewed" },
        { status: 400 }
      );
    }

    if (action === "approved") {
      const { error: updateError } = await svc
        .from("enrollments")
        .update({ status: "approved" })
        .eq("id", id);

      if (updateError) {
        return NextResponse.json({ error: updateError.message }, { status: 500 });
      }

      let qualificationName: string | null = enrollment.current_class ?? null;
      if (enrollment.qualification_id) {
        const { data: qual } = await svc
          .from("qualifications")
          .select("name")
          .eq("id", enrollment.qualification_id)
          .maybeSingle();
        qualificationName = qual?.name ?? null;
      }

      await svc.from("students").insert({
        name: enrollment.full_name,
        email: enrollment.email,
        phone: enrollment.phone,
        class: qualificationName,
        enrolled_courses: enrollment.interested_course
          ? [enrollment.interested_course]
          : [],
      });

      try {
        await sendApprovalEmail(enrollment.email, enrollment.full_name);
      } catch {
        console.error("Failed to send approval email to", enrollment.email);
      }

      return NextResponse.json({ success: true, message: "Enrollment approved" });
    }

    const { error: updateError } = await svc
      .from("enrollments")
      .update({
        status: "rejected",
        rejection_message: rejectionMessage,
      })
      .eq("id", id);

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    try {
      await sendRejectionEmail(enrollment.email, enrollment.full_name, rejectionMessage);
    } catch {
      console.error("Failed to send rejection email to", enrollment.email);
    }

    return NextResponse.json({ success: true, message: "Enrollment rejected" });
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid request" },
      { status: 400 }
    );
  }
}
