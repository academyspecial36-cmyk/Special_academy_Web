import { NextResponse } from "next/server";
import { createServerSupabase, createServiceRoleSupabase } from "@/lib/supabase-server";

function toCamelCase(str: string): string {
  return str.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
}

function transformKeys(obj: Record<string, unknown>): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    result[toCamelCase(key)] = value;
  }
  return result;
}

export async function GET() {
  try {
    const supabase = await createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const svc = createServiceRoleSupabase();

    // Look up student by email, with enrollment auth_user_id fallback
    let studentRows = await svc
      .from("students")
      .select("id, enrolled_courses")
      .eq("email", user.email)
      .order("created_at", { ascending: false })
      .limit(1);

    let student = studentRows.data?.[0];

    if (!student) {
      const { data: enrollment } = await svc
        .from("enrollments")
        .select("email")
        .eq("auth_user_id", user.id)
        .maybeSingle();
      if (enrollment?.email) {
        const fallback = await svc
          .from("students")
          .select("id, enrolled_courses")
          .eq("email", enrollment.email)
          .order("created_at", { ascending: false })
          .limit(1);
        student = fallback.data?.[0];
      }
    }

    if (!student) {
      return NextResponse.json({ courses: [] });
    }

    let enrolled: string[] = [];
    const raw = student.enrolled_courses;
    if (Array.isArray(raw)) {
      enrolled = raw;
    } else if (typeof raw === "string" && raw.length > 0) {
      if (raw.startsWith("{") && raw.endsWith("}")) {
        enrolled = raw.slice(1, -1).split(",").map((s: string) => s.trim()).filter(Boolean);
      } else {
        enrolled = raw.split(",").map((s: string) => s.trim()).filter(Boolean);
      }
    }

    if (enrolled.length === 0) {
      return NextResponse.json({ courses: [] });
    }

    const { data: allCourses } = await (svc
      .from("courses") as any)
      .select("*, qualification:qualifications(name)");

    // Build lookup: course id → course, and course title → course
    const coursesById = new Map<string, Record<string, unknown>>();
    const coursesByTitle = new Map<string, Record<string, unknown>>();
    for (const c of (allCourses ?? []) as Record<string, unknown>[]) {
      coursesById.set(c.id as string, c);
      coursesByTitle.set((c.title as string ?? "").toLowerCase(), c);
    }

    // Resolve each enrolled entry to a course, converting titles to IDs on the fly
    const resolved: string[] = [];
    const matchedCourses: Record<string, unknown>[] = [];
    let changed = false;

    for (const entry of enrolled) {
      let course = coursesById.get(entry);
      if (!course) course = coursesByTitle.get(entry.toLowerCase());
      if (course) {
        resolved.push(course.id as string);
        matchedCourses.push(course);
        if (entry !== course.id) changed = true;
      }
    }

    // Save resolved IDs back to student record if any titles were converted
    if (changed) {
      await svc.from("students").update({ enrolled_courses: resolved }).eq("id", (student as Record<string, unknown>).id as string);
    }

    const courses = matchedCourses.map((c: Record<string, unknown>) => {
      const flat = transformKeys(c);
      if (typeof flat.qualification === "object" && flat.qualification) {
        flat.qualification = (flat.qualification as Record<string, unknown>).name as string ?? "";
      }
      return flat;
    });

    return NextResponse.json({ courses });
  } catch (err) {
    console.error("student-courses error:", err);
    return NextResponse.json({ error: "Failed to fetch courses" }, { status: 500 });
  }
}
