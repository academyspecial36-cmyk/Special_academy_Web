import { NextResponse } from "next/server";
import { createServiceRoleSupabase } from "@/lib/supabase-server";
import { sendPasswordResetEmail } from "@/lib/email";
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

    const rateKey = getRateLimitKey(request, email, "password_reset_send");
    const limit = checkRateLimit(rateKey, RATE_LIMITS.PASSWORD_RESET_SEND);
    if (!limit.allowed) {
      return NextResponse.json(
        { error: "Too many attempts. Please try again later." },
        { status: 429, headers: { "Retry-After": String(Math.ceil((limit.resetAt - Date.now()) / 1000)) } }
      );
    }

    const svc = createServiceRoleSupabase();

    const { data: users, error: usersError } = await svc.auth.admin.listUsers();
    if (usersError) {
      return NextResponse.json(
        { success: false, error: "Failed to verify account" },
        { status: 500 }
      );
    }

    const user = users.users.find((u) => u.email?.toLowerCase() === email.toLowerCase());

    if (!user) {
      return NextResponse.json({
        success: true,
        message: "If an account with that email exists, a verification code has been sent.",
      });
    }

    const { data: profile } = await svc
      .from("profiles")
      .select("name")
      .eq("id", user.id)
      .maybeSingle();

    const name = profile?.name || email;

    await svc
      .from("password_resets")
      .update({ used: true, updated_at: new Date().toISOString() })
      .eq("email", email.toLowerCase())
      .eq("used", false);

    const code = generateCode();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();

    const { error: insertError } = await svc.from("password_resets").insert({
      email: email.toLowerCase(),
      code,
      expires_at: expiresAt,
    });

    if (insertError) {
      return NextResponse.json(
        { success: false, error: "Failed to generate reset code" },
        { status: 500 }
      );
    }

    try {
      await sendPasswordResetEmail(email, name, code);
    } catch {
      return NextResponse.json(
        { success: false, error: "Failed to send email. Please try again later." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "A 6-digit verification code has been sent to your email.",
    });
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid request" },
      { status: 400 }
    );
  }
}
