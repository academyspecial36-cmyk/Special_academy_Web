import { NextResponse } from "next/server";
import { createServiceRoleSupabase } from "@/lib/supabase-server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get("email");

  if (!email) {
    return NextResponse.json({ error: "Email is required" }, { status: 400 });
  }

  const svc = createServiceRoleSupabase();

  // Check profile first — admins bypass student status check
  const { data: profile } = await svc
    .from("profiles")
    .select("role")
    .eq("email", email)
    .maybeSingle();

  if (profile?.role === "admin") {
    return NextResponse.json({ blocked: false });
  }

  const { data: student } = await svc
    .from("students")
    .select("status")
    .eq("email", email)
    .maybeSingle();

  if (!student) {
    return NextResponse.json({
      blocked: true,
      error: "Your enrollment has not been approved yet. Please wait for admin approval. For assistance, call <a href=\"tel:9860302036\" class=\"underline\">986-0302036</a> or contact the system administrator.",
    });
  }

  if (student.status !== "active") {
    return NextResponse.json({
      blocked: true,
      error: "Your account is inactive. Please contact the system administrator at <a href=\"tel:9860302036\" class=\"underline\">986-0302036</a>.",
    });
  }

  return NextResponse.json({ blocked: false });
}
