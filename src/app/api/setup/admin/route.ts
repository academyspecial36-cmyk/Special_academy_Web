import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(request: Request) {
  try {
    const { email, password, name, setupKey } = await request.json();

    const validKey = process.env.SETUP_SECRET || "setup-change-me";
    if (setupKey !== validKey) {
      return NextResponse.json({ success: false, error: "Invalid setup key" }, { status: 401 });
    }

    if (!email || !password) {
      return NextResponse.json({ success: false, error: "Email and password required" }, { status: 400 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { name: name || "Admin" },
    });

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }

    if (data.user) {
      const { error: profileError } = await supabase.from("profiles").upsert({
        id: data.user.id,
        name: name || "Admin",
        email,
        role: "admin",
      });

      if (profileError) {
        return NextResponse.json({ success: false, error: profileError.message }, { status: 500 });
      }
    }

    return NextResponse.json({ success: true, message: "Admin user created" });
  } catch (err) {
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 });
  }
}
