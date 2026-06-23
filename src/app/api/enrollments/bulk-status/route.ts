import { NextResponse } from "next/server";
import { createServerSupabase, createServiceRoleSupabase } from "@/lib/supabase-server";
import { sendRejectionEmail, sendApprovalEmail } from "@/lib/email";

export async function POST(request: Request) {
  try {
    const { ids, action, rejectionMessage } = await request.json();

    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: "No IDs provided" }, { status: 400 });
    }

    if (!action || !["approved", "rejected"].includes(action)) {
      return NextResponse.json(
        { error: "Action must be 'approved' or 'rejected'" },
        { status: 400 }
      );
    }

    if (action === "rejected" && !rejectionMessage) {
      return NextResponse.json(
        { error: "Rejection message is required" },
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

    const { data: enrollments, error: fetchError } = await svc
      .from("enrollments")
      .select("*")
      .in("id", ids);

    if (fetchError) {
      return NextResponse.json({ error: fetchError.message }, { status: 500 });
    }

    if (!enrollments || enrollments.length === 0) {
      return NextResponse.json({ error: "No enrollments found" }, { status: 404 });
    }

    const nonPending = enrollments.filter((e) => e.status !== "pending");
    if (nonPending.length > 0) {
      return NextResponse.json(
        { error: `${nonPending.length} enrollment(s) are not in pending status` },
        { status: 400 }
      );
    }

    const results: { id: string; success: boolean; error?: string }[] = [];

    for (const enrollment of enrollments) {
      try {
        if (action === "approved") {
          const { error: updateError } = await svc
            .from("enrollments")
            .update({ status: "approved" })
            .eq("id", enrollment.id);

          if (updateError) {
            results.push({ id: enrollment.id, success: false, error: updateError.message });
            continue;
          }

          let qualificationName: string | null = null;
          let qualificationId: string | null = enrollment.qualification_id ?? null;
          if (qualificationId) {
            const { data: qual } = await svc
              .from("qualifications")
              .select("name")
              .eq("id", qualificationId)
              .maybeSingle();
            qualificationName = qual?.name ?? null;
          } else {
            const { data: qual } = await svc
              .from("qualifications")
              .select("id, name")
              .maybeSingle();
            if (qual) {
              qualificationId = qual.id;
              qualificationName = qual.name;
            }
          }

          let enrolledCourseIds: string[] = [];
          if (enrollment.interested_course) {
            const { data: course } = await svc
              .from("courses")
              .select("id")
              .eq("title", enrollment.interested_course)
              .maybeSingle();
            enrolledCourseIds = course ? [course.id] : [enrollment.interested_course];
          }

          const { error: studentError } = await svc.from("students").insert({
            name: enrollment.full_name,
            email: enrollment.email,
            phone: enrollment.phone,
            qualification_id: qualificationId,
            enrolled_courses: enrolledCourseIds,
          });

          if (studentError) {
            results.push({ id: enrollment.id, success: false, error: studentError.message });
            continue;
          }

          if (enrollment.auth_user_id) {
            const { error: profileError } = await svc
              .from("profiles")
              .update({
                name: enrollment.full_name,
                email: enrollment.email,
                phone: enrollment.phone,
                role: "student",
              })
              .eq("id", enrollment.auth_user_id);

            if (profileError) {
              console.error("Failed to update profile for", enrollment.auth_user_id, profileError);
            }
          }

          try {
            await sendApprovalEmail(enrollment.email, enrollment.full_name);
          } catch {
            console.error("Failed to send approval email to", enrollment.email);
          }

          results.push({ id: enrollment.id, success: true });
        } else {
          const { error: updateError } = await svc
            .from("enrollments")
            .update({
              status: "rejected",
              rejection_message: rejectionMessage,
            })
            .eq("id", enrollment.id);

          if (updateError) {
            results.push({ id: enrollment.id, success: false, error: updateError.message });
            continue;
          }

          try {
            await sendRejectionEmail(enrollment.email, enrollment.full_name, rejectionMessage);
          } catch {
            console.error("Failed to send rejection email to", enrollment.email);
          }

          results.push({ id: enrollment.id, success: true });
        }
      } catch (e) {
        results.push({ id: enrollment.id, success: false, error: (e as Error).message });
      }
    }

    const succeeded = results.filter((r) => r.success).length;
    const failed = results.filter((r) => !r.success).length;

    return NextResponse.json({
      success: true,
      results,
      summary: `${succeeded} enrollment(s) ${action}, ${failed} failed`,
    });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
