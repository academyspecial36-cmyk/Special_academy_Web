import { NextResponse } from "next/server";
import { createServiceRoleSupabase } from "@/lib/supabase-server";
import { sendEnrollmentEmail } from "@/lib/email";
import { checkRateLimit, getRateLimitKey, RATE_LIMITS } from "@/lib/rate-limit";

function generateCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { success: false, error: "Email is required" },
        { status: 400 }
      );
    }

    const rateKey = getRateLimitKey(request, email, "enroll_resend");
    const limit = checkRateLimit(rateKey, RATE_LIMITS.ENROLL_RESEND);
    if (!limit.allowed) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429, headers: { "Retry-After": String(Math.ceil((limit.resetAt - Date.now()) / 1000)) } }
      );
    }

    const svc = createServiceRoleSupabase();

    const { data: enrollment, error: findError } = await svc
      .from("enrollments")
      .select("*")
      .eq("email", email)
      .eq("status", "unverified")
      .maybeSingle();

    if (findError || !enrollment) {
      return NextResponse.json(
        { success: false, error: "No unverified enrollment found for this email." },
        { status: 404 }
      );
    }

    const newCode = generateCode();

    const { error: updateError } = await svc
      .from("enrollments")
      .update({
        verification_code: newCode,
        verification_sent_at: new Date().toISOString(),
      })
      .eq("id", enrollment.id);

    if (updateError) {
      return NextResponse.json(
        { success: false, error: updateError.message },
        { status: 500 }
      );
    }

    try {
      await sendEnrollmentEmail(email, enrollment.full_name, "", newCode);
    } catch {
      console.error("[ResendCode] Email send failed for", email);
      return NextResponse.json(
        { success: false, error: "Failed to send verification email. Please try again later." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Verification code resent to your email.",
    });
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid request" },
      { status: 400 }
    );
  }
}
