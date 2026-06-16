import { NextResponse } from "next/server";
import { createServiceRoleSupabase } from "@/lib/supabase-server";
import { sendEnrollmentEmail } from "@/lib/email";
import { createNotificationForRole } from "@/lib/notifications";

function generateCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(request: Request) {
  try {
    const {
      fullName, email, phone, qualificationId, password,
      interestedCourse, guardianName, guardianContact,
      address, message,
    } = await request.json();

    if (!fullName || !email || !password) {
      return NextResponse.json(
        { success: false, error: "fullName, email, and password are required" },
        { status: 400 }
      );
    }

    const serviceSupabase = createServiceRoleSupabase();

    const { data: authData, error: authError } = await serviceSupabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { name: fullName },
    });

    if (authError) {
      return NextResponse.json(
        { success: false, error: authError.message },
        { status: 400 }
      );
    }

    if (!authData.user) {
      return NextResponse.json(
        { success: false, error: "User creation failed" },
        { status: 500 }
      );
    }

    await serviceSupabase.from("profiles").upsert({
      id: authData.user.id,
      name: fullName,
      email,
      role: "student",
      phone,
    });

    const verificationCode = generateCode();

    console.log(`[Enroll] Verification code for ${email}: ${verificationCode}`);

    const { error: enrollError } = await serviceSupabase.from("enrollments").insert({
      full_name: fullName,
      email,
      phone,
      qualification_id: qualificationId || null,
      interested_course: interestedCourse || null,
      guardian_name: guardianName || null,
      guardian_contact: guardianContact || null,
      address: address || null,
      message: message || null,
      status: "unverified",
      auth_user_id: authData.user.id,
      verification_code: verificationCode,
      verification_sent_at: new Date().toISOString(),
    });

    if (enrollError) {
      return NextResponse.json(
        { success: false, error: enrollError.message },
        { status: 500 }
      );
    }

    try {
      await sendEnrollmentEmail(email, fullName, password, verificationCode);
    } catch (e) {
      console.error("[Enroll] Resend email failed:", e);
    }

    await createNotificationForRole(
      "admin",
      "enrollment",
      "New Enrollment Request",
      `${fullName} (${email}) has submitted an enrollment request.`,
      "/dashboard/enrollments",
    );

    return NextResponse.json({
      success: true,
      message: "Account created. Please check your email for the verification code.",
    });
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid request" },
      { status: 400 }
    );
  }
}
