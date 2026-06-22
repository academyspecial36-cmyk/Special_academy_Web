import { z } from "zod";
import { createServiceRoleSupabase } from "@/lib/supabase-server";
import type { AIToolDefinition } from "@/types/ai";

const svc = () => createServiceRoleSupabase();

export const approveEnrollmentTool: AIToolDefinition = {
  name: "approveEnrollment",
  description: "Approve a pending enrollment application. Creates a student record and sends approval email.",
  parameters: {
    type: "object",
    properties: {
      id: { type: "string", description: "Enrollment ID to approve" },
    },
    required: ["id"],
  },
  requiresConfirmation: false,
  handler: async (args, _userId) => {
    try {
      const { id } = z.object({ id: z.string() }).parse(args);

      const { data: enrollment, error: fetchError } = await svc()
        .from("enrollments").select("*").eq("id", id).single();
      if (fetchError || !enrollment) throw new Error(fetchError?.message || "Enrollment not found");

      const { error: updateError } = await svc()
        .from("enrollments").update({ status: "approved" }).eq("id", id);
      if (updateError) throw new Error(updateError.message);

      let qualificationId: string | null = enrollment.qualification_id ?? null;
      if (!qualificationId) {
        const { data: qual } = await svc()
          .from("qualifications").select("id").maybeSingle();
        if (qual) qualificationId = qual.id;
      }

      let enrolledCourseIds: string[] = [];
      if (enrollment.interested_course) {
        const { data: course } = await svc()
          .from("courses").select("id").eq("title", enrollment.interested_course).maybeSingle();
        enrolledCourseIds = course ? [course.id] : [enrollment.interested_course];
      }

      await svc().from("students").insert({
        name: enrollment.full_name,
        email: enrollment.email,
        phone: enrollment.phone,
        qualification_id: qualificationId,
        enrolled_courses: enrolledCourseIds,
        status: "active",
        join_date: new Date().toISOString(),
      });

      return { success: true, data: { id, status: "approved", studentName: enrollment.full_name } };
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : "Failed to approve enrollment" };
    }
  },
};

export const rejectEnrollmentTool: AIToolDefinition = {
  name: "rejectEnrollment",
  description: "Reject a pending enrollment with a reason. Requires confirmation.",
  parameters: {
    type: "object",
    properties: {
      id: { type: "string", description: "Enrollment ID to reject" },
      reason: { type: "string", description: "Rejection reason" },
    },
    required: ["id", "reason"],
  },
  requiresConfirmation: true,
  handler: async (args, _userId) => {
    try {
      const { id, reason } = z.object({ id: z.string(), reason: z.string() }).parse(args);
      const { error } = await svc()
        .from("enrollments").update({ status: "rejected", rejection_message: reason }).eq("id", id);
      if (error) throw new Error(error.message);
      return { success: true, data: { id, status: "rejected", reason } };
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : "Failed to reject enrollment" };
    }
  },
};
