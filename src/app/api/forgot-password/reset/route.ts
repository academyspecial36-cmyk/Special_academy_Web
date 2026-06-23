import { NextResponse } from "next/server";
import { createServiceRoleSupabase } from "@/lib/supabase-server";
import { checkRateLimit, getRateLimitKey, RATE_LIMITS } from "@/lib/rate-limit";

export async function POST(request: Request) {
  try {
    const { email, resetToken, password } = await request.json();

    if (!email || !resetToken || !password) {
      return NextResponse.json(
        { success: false, error: "Email, reset token, and new password are required" },
        { status: 400 }
      );
    }

    const rateKey = getRateLimitKey(request, email, "password_reset");
    const limit = checkRateLimit(rateKey, RATE_LIMITS.PASSWORD_RESET_SEND);
    if (!limit.allowed) {
      return NextResponse.json(
        { error: "Too many attempts. Please try again later." },
        { status: 429, headers: { "Retry-After": String(Math.ceil((limit.resetAt - Date.now()) / 1000)) } }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { success: false, error: "Password must be at least 8 characters" },
        { status: 400 }
      );
    }

    if (!/[A-Z]/.test(password)) {
      return NextResponse.json(
        { success: false, error: "Password must contain at least one uppercase letter" },
        { status: 400 }
      );
    }

    if (!/[a-z]/.test(password)) {
      return NextResponse.json(
        { success: false, error: "Password must contain at least one lowercase letter" },
        { status: 400 }
      );
    }

    if (!/[0-9]/.test(password)) {
      return NextResponse.json(
        { success: false, error: "Password must contain at least one digit" },
        { status: 400 }
      );
    }

    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      return NextResponse.json(
        { success: false, error: "Password must contain at least one special character" },
        { status: 400 }
      );
    }

    const svc = createServiceRoleSupabase();

    // Validate reset token
    const { data: reset, error: findError } = await svc
      .from("password_resets")
      .select("*")
      .eq("email", email.toLowerCase())
      .eq("reset_token", resetToken)
      .eq("used", false)
      .gte("expires_at", new Date().toISOString())
      .maybeSingle();

    if (findError || !reset) {
      return NextResponse.json(
        { success: false, error: "Invalid or expired reset token." },
        { status: 400 }
      );
    }

    // Find user in auth.users
    const { data: users } = await svc.auth.admin.listUsers();
    const user = users.users.find((u) => u.email?.toLowerCase() === email.toLowerCase());

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Account not found" },
        { status: 404 }
      );
    }

    // Update password via Supabase auth admin API
    const { error: updateError } = await svc.auth.admin.updateUserById(
      user.id,
      { password }
    );

    if (updateError) {
      return NextResponse.json(
        { success: false, error: updateError.message },
        { status: 500 }
      );
    }

    // Mark reset as used
    await svc
      .from("password_resets")
      .update({ used: true, updated_at: new Date().toISOString() })
      .eq("id", reset.id);

    return NextResponse.json({
      success: true,
      message: "Password has been reset successfully. You can now login with your new password.",
    });
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid request" },
      { status: 400 }
    );
  }
}
