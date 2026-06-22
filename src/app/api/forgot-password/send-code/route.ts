import { NextResponse } from "next/server";
import { createServiceRoleSupabase } from "@/lib/supabase-server";
import { sendPasswordResetEmail } from "@/lib/email";

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

    const svc = createServiceRoleSupabase();

    // Check if user exists in auth.users
    const { data: users, error: usersError } = await svc.auth.admin.listUsers();
    if (usersError) {
      return NextResponse.json(
        { success: false, error: "Failed to verify account" },
        { status: 500 }
      );
    }

    const user = users.users.find((u) => u.email?.toLowerCase() === email.toLowerCase());

    if (!user) {
      return NextResponse.json(
        { success: false, error: "No account found with this email address." },
        { status: 404 }
      );
    }

    // Get user's name from profiles
    const { data: profile } = await svc
      .from("profiles")
      .select("name")
      .eq("id", user.id)
      .maybeSingle();

    const name = profile?.name || email;

    // Invalidate any existing unused codes for this email
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
