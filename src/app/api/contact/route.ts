import { NextResponse } from "next/server";
import { createServiceRoleSupabase } from "@/lib/supabase-server";
import { createNotificationForRole } from "@/lib/notifications";

export async function POST(request: Request) {
  try {
    const { name, email, phone, subject, message } = await request.json();

    if (!name?.trim()) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }
    if (!email?.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Valid email is required" }, { status: 400 });
    }
    if (!message?.trim()) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    const svc = createServiceRoleSupabase();
    const { error } = await svc.from("contact_submissions").insert({
      name: name.trim(),
      email: email.trim(),
      phone: phone?.trim() || "",
      subject: subject?.trim() || "",
      message: message.trim(),
    });

    if (error) {
      console.error("Contact insert error:", error);
      return NextResponse.json({ error: "Failed to submit message" }, { status: 500 });
    }

    await createNotificationForRole(
      "admin",
      "contact",
      "New Contact Message",
      `${name} (${email}) sent a message${subject ? ` about "${subject}"` : ""}.`,
      "/dashboard/contact-submissions",
    );

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
