import { NextRequest, NextResponse } from "next/server";
import { createServiceRoleSupabase } from "@/lib/supabase-server";
import { Resend } from "resend";

function replaceVariables(body: string, variables: Record<string, string>): string {
  return body.replace(/{{(\w+)}}/g, (_, key) => variables[key] ?? `{{${key}}}`);
}

export async function POST(request: NextRequest) {
  try {
    const { type, templateId, subject, body, recipientType, classFilter, recipientIds } = await request.json();
    const supabase = createServiceRoleSupabase();

    let recipients: { type: string; name: string; email?: string; phone?: string }[] = [];

    if (recipientType === "all") {
      const { data: students } = await supabase.from("students").select("name, email, phone");
      recipients = (students ?? []).map((s: Record<string, unknown>) => ({
        type: "student",
        name: String(s.name ?? ""),
        email: s.email ? String(s.email) : undefined,
        phone: s.phone ? String(s.phone) : undefined,
      }));
      const { data: enrollments } = await supabase
        .from("enrollments")
        .select("full_name, email, phone");
      for (const e of enrollments ?? []) {
        const rec = e as Record<string, unknown>;
        recipients.push({
          type: "parent",
          name: String(rec.full_name ?? ""),
          email: rec.email ? String(rec.email) : undefined,
          phone: rec.phone ? String(rec.phone) : undefined,
        });
      }
    } else if (recipientType === "class" && classFilter) {
      const { data: students } = await supabase
        .from("students")
        .select("name, email, phone")
        .eq("class", classFilter);
      recipients = (students ?? []).map((s: Record<string, unknown>) => ({
        type: "student",
        name: String(s.name ?? ""),
        email: s.email ? String(s.email) : undefined,
        phone: s.phone ? String(s.phone) : undefined,
      }));
    } else if (recipientType === "specific" && recipientIds?.length) {
      const { data: students } = await supabase
        .from("students")
        .select("name, email, phone, id")
        .in("id", recipientIds);
      recipients = (students ?? []).map((s: Record<string, unknown>) => ({
        type: "student",
        name: String(s.name ?? ""),
        email: s.email ? String(s.email) : undefined,
        phone: s.phone ? String(s.phone) : undefined,
      }));
    }

    const validRecipients = type === "email"
      ? recipients.filter((r) => r.email)
      : recipients.filter((r) => r.phone);

    const finalBody = templateId && body
      ? body
      : body;

    const { data: comm, error: commError } = await supabase
      .from("communications")
      .insert({
        type,
        template_id: templateId || null,
        subject: subject || null,
        body: finalBody,
        recipient_type: recipientType,
        class_filter: classFilter || null,
        recipient_count: validRecipients.length,
        status: "sending",
      })
      .select()
      .single();

    if (commError) throw commError;
    const commId = (comm as Record<string, unknown>).id as string;

    const recipientRows = validRecipients.map((r) => ({
      communication_id: commId,
      recipient_type: r.type,
      recipient_name: r.name,
      recipient_email: r.email,
      recipient_phone: r.phone,
      status: "pending",
    }));

    if (recipientRows.length > 0) {
      const { error: recError } = await supabase
        .from("communication_recipients")
        .insert(recipientRows);
      if (recError) throw recError;
    }

    let sent = 0;
    let failed = 0;

    if (type === "email") {
      const resendKey = process.env.RESEND_API_KEY;
      if (!resendKey) {
        await supabase
          .from("communications")
          .update({ status: "failed", failed_count: validRecipients.length })
          .eq("id", commId);
        return NextResponse.json({ error: "Resend API key not configured" }, { status: 500 });
      }

      const resend = new Resend(resendKey);

      for (const r of validRecipients) {
        try {
          if (r.email) {
            const { error: sendError } = await resend.emails.send({
              from: "Cadet Academy <onboarding@resend.dev>",
              to: r.email,
              subject: subject || "Message from Cadet Academy",
              html: replaceVariables(finalBody, { name: r.name }),
            });

            if (sendError) throw sendError;

            await supabase
              .from("communication_recipients")
              .update({ status: "sent", sent_at: new Date().toISOString() })
              .eq("communication_id", commId)
              .eq("recipient_email", r.email);
            sent++;
          }
        } catch {
          await supabase
            .from("communication_recipients")
            .update({ status: "failed", error_message: "Send failed" })
            .eq("communication_id", commId)
            .eq("recipient_email", r.email);
          failed++;
        }
      }
    } else {
      failed = validRecipients.length;
    }

    const finalStatus = failed === 0 ? "completed" : sent === 0 ? "failed" : "partial";

    await supabase
      .from("communications")
      .update({
        status: finalStatus,
        sent_count: sent,
        failed_count: failed,
        sent_at: new Date().toISOString(),
      })
      .eq("id", commId);

    return NextResponse.json({
      success: true,
      id: commId,
      status: finalStatus,
      sent,
      failed,
      total: validRecipients.length,
    });
  } catch (error) {
    console.error("Send error:", error);
    return NextResponse.json({ error: "Failed to send communication" }, { status: 500 });
  }
}
