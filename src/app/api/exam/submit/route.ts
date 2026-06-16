import { NextResponse } from "next/server";
import { createServerSupabase, createServiceRoleSupabase } from "@/lib/supabase-server";

export async function POST(request: Request) {
  try {
    const supabase = await createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { categoryId, answers, score, total } = body;

    if (!categoryId || !Array.isArray(answers)) {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }

    const svc = createServiceRoleSupabase();

    const { data: studentRows } = await svc
      .from("students")
      .select("name")
      .eq("email", user.email)
      .limit(1);

    const studentName = studentRows?.[0]?.name ?? user.email?.split("@")[0] ?? "Student";

    const attempt = {
      category_id: categoryId,
      student_name: studentName,
      answers,
      score,
      total,
      completed_at: new Date().toISOString(),
    };

    const { data, error } = await svc.from("exam_attempts").insert(attempt).select().single();
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    function toCamelCase(str: string): string {
      return str.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
    }
    const camelData: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(data as Record<string, unknown>)) {
      camelData[toCamelCase(k)] = v;
    }
    return NextResponse.json(camelData, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to submit exam" }, { status: 500 });
  }
}
