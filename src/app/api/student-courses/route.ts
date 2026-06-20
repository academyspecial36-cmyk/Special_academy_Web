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

    const { data: studentRows } = await svc
      .from("students")
      .select("enrolled_courses")
      .eq("email", user.email)
      .order("created_at", { ascending: false })
      .limit(1);

    const student = studentRows?.[0];
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

    const filtered = (allCourses ?? []).filter((c: Record<string, unknown>) => {
      const title = (c.title ?? "") as string;
      const id = (c.id ?? "") as string;
      return enrolled.includes(id) || enrolled.includes(title);
    });

    const courses = filtered.map((c: Record<string, unknown>) => {
      const flat = transformKeys(c);
      if (typeof flat.qualification === "object" && flat.qualification) {
        flat.qualification = (flat.qualification as Record<string, unknown>).name as string ?? "";
      }
      return flat;
    });

    return NextResponse.json({ courses });
  } catch {
    return NextResponse.json({ error: "Failed to fetch courses" }, { status: 500 });
  }
}
