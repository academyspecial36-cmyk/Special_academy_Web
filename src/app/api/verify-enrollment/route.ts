import { NextResponse } from "next/server";
import { createServiceRoleSupabase } from "@/lib/supabase-server";

export async function POST(request: Request) {
  try {
    const { email, code } = await request.json();

    if (!email || !code) {
      return NextResponse.json(
        { success: false, error: "Email and verification code are required" },
        { status: 400 }
      );
    }

    const supabase = createServiceRoleSupabase();

    const { data: enrollment, error: findError } = await supabase
      .from("enrollments")
      .select("*")
      .eq("email", email)
      .eq("verification_code", code)
      .eq("status", "unverified")
      .maybeSingle();

    if (findError) {
      return NextResponse.json(
        { success: false, error: findError.message },
        { status: 500 }
      );
    }

    if (!enrollment) {
      return NextResponse.json(
        { success: false, error: "Invalid verification code or email" },
        { status: 400 }
      );
    }

    const { error: updateError } = await supabase
      .from("enrollments")
      .update({
        status: "pending",
        verified_at: new Date().toISOString(),
        verification_code: null,
      })
      .eq("id", enrollment.id);

    if (updateError) {
      return NextResponse.json(
        { success: false, error: updateError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Email verified successfully. Your application is now under review.",
    });
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid request" },
      { status: 400 }
    );
  }
}
