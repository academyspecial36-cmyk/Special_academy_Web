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
    const { data, error } = await svc
      .from("live_classes")
      .select("*")
      .order("start_time", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const classes = Array.isArray(data) ? data.map((c: Record<string, unknown>) => transformKeys(c)) : [];
    return NextResponse.json(classes);
  } catch (err) {
    console.error("student live-classes error:", err);
    return NextResponse.json({ error: "Failed to fetch live classes" }, { status: 500 });
  }
}
