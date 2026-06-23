import { Resend } from "resend";
import { createServiceRoleSupabase } from "./supabase-server";
import { fetchSettings } from "./settings-server";
import { generateEmailHtml } from "./email-template-builder";

const resend = new Resend(
  process.env.RESEND_API_KEY  || ""
);

const STATIC_SETTINGS: Settings = {
  academyName: "Special Academy",
  tagline: "Preparing Future Leaders Through Discipline & Excellence",
  website: "https://specialacademy.com.np",
  email: "info@specialacademy.com.np",
  phone: "986-0302036",
  appIcon: "/icon-image.png",
};

type Settings = {
  academyName: string;
  tagline?: string;
  appIcon: string;
  website: string;
  email: string;
  phone: string;
};

import type { TemplateConfig } from "./email-template-builder";

type Template = {
  id: string;
  name: string;
  subject: string;
  body: string;
  variables: string[];
  category: string;
  config: TemplateConfig | null;
};

async function fetchTemplateByCategory(category: string): Promise<Template | null> {
  try {
    const svc = createServiceRoleSupabase();
    const { data } = await svc
      .from("communication_templates")
      .select("*")
      .eq("category", category)
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    return data as Template | null;
  } catch {
    return null;
  }
}

function renderTemplate(template: Template, vars: Record<string, string>): { subject: string; body: string } {
  let subject = template.subject || "";
  let body = template.body || "";
  for (const [key, val] of Object.entries(vars)) {
    const re = new RegExp(`\\\{\\\{${key}\\\}\\\}`, "g");
    subject = subject.replace(re, val);
    body = body.replace(re, val);
  }
  return { subject, body };
}

function renderConfigTemplate(template: Template, vars: Record<string, string>, settings: Settings): { subject: string; body: string } {
  let subject = template.subject || "";
  for (const [key, val] of Object.entries(vars)) {
    const re = new RegExp(`\\\{\\\{${key}\\\}\\\}`, "g");
    subject = subject.replace(re, val);
  }
  const safeVars = { ...vars };
  for (const [key, val] of Object.entries(safeVars)) {
    safeVars[key] = val || "";
  }
  const body = generateEmailHtml(template.config!, {
    name: settings.academyName,
    logo: settings.appIcon,
    website: settings.website,
    email: settings.email,
    phone: settings.phone,
  });
  return { subject, body: body.replace(/\{\{(\w+)\}\}/g, (_, key) => safeVars[key] !== undefined ? safeVars[key] : `{{${key}}}`) };
}

async function getSettings(): Promise<Settings> {
  try {
    const settings = await fetchSettings();
    return settings;
  } catch {
    return STATIC_SETTINGS;
  }
}

function getFromAddress(settings: Settings) {
  return process.env.EMAIL_FROM
    ? `${settings.academyName} <${process.env.EMAIL_FROM}>`
    : "onboarding@resend.dev";
}

function logoUrl(settings: Settings): string {
  if (!settings.appIcon) return "";
  const base = settings.website.replace(/\/+$/, "");
  const path = settings.appIcon.replace(/^\//, "");
  return `${base}/${path}`;
}

const PRIMARY = "#07220B";
const PRIMARY_LIGHT = "#0d3d17";
const PRIMARY_MUTED = `${PRIMARY}15`;
const TEXT_BODY = "#444";
const TEXT_MUTED = "#888";
const BG_BODY = "#f4f6f9";

function baseLayout(content: string, settings: Settings) {
  const url = logoUrl(settings);
  const logoHtml = url
    ? `<img src="${url}" alt="${settings.academyName}" style="height:48px;width:auto;display:block;margin:0 auto;" />`
    : `<h1 style="color:#ffffff;margin:0;font-size:22px;font-weight:700;">${settings.academyName}</h1>`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>${settings.academyName}</title>
</head>
<body style="margin:0;padding:0;background-color:${BG_BODY};">
  <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;background-color:${BG_BODY};">
    <tr>
      <td align="center" style="padding:24px 16px;">
        <table role="presentation" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.06);">

          <!-- Header -->
          <tr>
            <td align="center" style="padding:32px 32px 24px;background:linear-gradient(135deg,${PRIMARY},${PRIMARY_LIGHT});">
              ${logoHtml}
              <p style="color:rgba(255,255,255,0.65);font-size:13px;margin:8px 0 0;font-family:Arial,sans-serif;">${settings.tagline || "Preparing Future Leaders Through Discipline & Excellence"}</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:32px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.6;color:${TEXT_BODY};">
              ${content}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:24px 32px;background-color:#f8f9fc;border-top:1px solid #eef0f5;">
              <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;">
                <tr>
                  <td align="center" style="font-family:Arial,sans-serif;font-size:12px;color:#999;">
                    <p style="margin:0 0 4px;"><strong style="color:#555;">${settings.academyName}</strong></p>
                    <p style="margin:0 0 2px;">${settings.website}</p>
                    <p style="margin:0 0 2px;">${settings.email} &bull; ${settings.phone}</p>
                    <p style="margin:12px 0 0;font-size:11px;color:#bbb;">&copy; ${new Date().getFullYear()} ${settings.academyName}. All rights reserved.</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function heroBadge(text: string, color: string) {
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto 20px;">
    <tr>
      <td style="background-color:${color}15;color:${color};font-size:13px;font-weight:600;padding:6px 16px;border-radius:20px;font-family:Arial,sans-serif;">${text}</td>
    </tr>
  </table>`;
}

function button(url: string, text: string) {
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:24px auto;">
    <tr>
      <td align="center" style="background-color:${PRIMARY};border-radius:8px;">
        <a href="${url}" target="_blank" style="display:inline-block;padding:12px 32px;font-family:Arial,sans-serif;font-size:15px;font-weight:600;color:#ffffff;text-decoration:none;border-radius:8px;">${text}</a>
      </td>
    </tr>
  </table>`;
}

function codeBlock(code: string) {
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;background-color:${PRIMARY_MUTED};border-radius:12px;padding:24px;margin:0 0 20px;">
      <tr>
        <td align="center">
          <p style="font-family:Arial,sans-serif;font-size:13px;color:${TEXT_MUTED};margin:0 0 12px;">Your Verification Code</p>
          <div style="font-size:36px;font-weight:700;letter-spacing:10px;color:${PRIMARY};font-family:'Courier New',monospace;background:#ffffff;padding:12px 24px;border-radius:8px;display:inline-block;">${code}</div>
          <p style="font-family:Arial,sans-serif;font-size:12px;color:${TEXT_MUTED};margin:12px 0 0;">This code expires in 15 minutes</p>
        </td>
      </tr>
    </table>`;
}

export async function sendEnrollmentEmail(
  email: string,
  name: string,
  _password: string,
  verificationCode: string
) {
  const settings = await getSettings();
  const from = getFromAddress(settings);

  let subject = `Verify Your ${settings.academyName} Enrollment`;
  let body = `
    ${heroBadge("ACTION REQUIRED", "#d97706")}
    <h2 style="color:${PRIMARY};font-size:22px;margin:0 0 4px;">Welcome, ${name}!</h2>
    <p style="margin:0 0 16px;color:${TEXT_BODY};">Thank you for choosing ${settings.academyName}. Use the code below to verify your email and activate your enrollment.</p>

    ${codeBlock(verificationCode)}

    <p style="color:${TEXT_BODY};font-size:14px;">Once verified, our team will review your application and notify you of the status.</p>

    <hr style="border:none;border-top:1px solid #eef0f5;margin:20px 0;" />

    <p style="font-size:13px;color:${TEXT_MUTED};margin:0;">If you did not create this account, please ignore this email.</p>
  `;

  const tmpl = await fetchTemplateByCategory("enrollment");
  if (tmpl) {
    if (tmpl.config) {
      const rendered = renderConfigTemplate(tmpl, { name, email, phone: "", academyName: settings.academyName, verificationCode }, settings);
      subject = rendered.subject || subject;
      await resend.emails.send({ from, to: email, subject, html: rendered.body });
      return;
    }
    const rendered = renderTemplate(tmpl, { name, email, phone: "", academyName: settings.academyName, verificationCode });
    subject = rendered.subject || subject;
    body = rendered.body || body;
  }

  await resend.emails.send({
    from,
    to: email,
    subject,
    html: baseLayout(body, settings),
  });
}

export async function sendRejectionEmail(
  email: string,
  name: string,
  message: string
) {
  const settings = await getSettings();
  const from = getFromAddress(settings);

  let subject = `Application Status Update – ${settings.academyName}`;
  let body = `
    ${heroBadge("APPLICATION UPDATE", "#dc2626")}
    <h2 style="color:${PRIMARY};font-size:22px;margin:0 0 4px;">Application Update</h2>
    <p style="margin:0 0 16px;color:${TEXT_BODY};">Dear ${name},</p>

    <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;background-color:#fef2f2;border-radius:12px;padding:20px;margin:0 0 20px;border-left:4px solid #dc2626;">
      <tr>
        <td>
          <p style="font-family:Arial,sans-serif;font-size:14px;font-weight:600;color:#991b1b;margin:0 0 4px;">Not Approved This Time</p>
          <p style="font-family:Arial,sans-serif;font-size:14px;color:#991b1b;margin:0;">${message}</p>
        </td>
      </tr>
    </table>

    <p style="color:${TEXT_BODY};">After careful review, we regret to inform you that your enrollment application has been <strong style="color:#dc2626;">rejected</strong>.</p>
    <p style="color:${TEXT_BODY};">You may reapply in the future if your circumstances change. If you have any questions, please contact our admissions team.</p>

    <hr style="border:none;border-top:1px solid #eef0f5;margin:20px 0;" />

    <p style="font-size:14px;color:${TEXT_BODY};margin:0;">Best regards,<br/><strong style="color:${PRIMARY};">Admissions Team</strong><br/>${settings.academyName}</p>
  `;

  const tmpl = await fetchTemplateByCategory("rejection");
  if (tmpl) {
    if (tmpl.config) {
      const rendered = renderConfigTemplate(tmpl, { name, email, phone: "", academyName: settings.academyName, message }, settings);
      subject = rendered.subject || subject;
      await resend.emails.send({ from, to: email, subject, html: rendered.body });
      return;
    }
    const rendered = renderTemplate(tmpl, { name, email, phone: "", academyName: settings.academyName, message });
    subject = rendered.subject || subject;
    body = rendered.body || body;
  }

  await resend.emails.send({
    from,
    to: email,
    subject,
    html: baseLayout(body, settings),
  });
}

export async function sendPasswordResetEmail(
  email: string,
  name: string,
  code: string
) {
  const settings = await getSettings();
  const from = getFromAddress(settings);

  let subject = `Reset Your ${settings.academyName} Password`;
  let body = `
    ${heroBadge("SECURITY ALERT", "#d97706")}
    <h2 style="color:${PRIMARY};font-size:22px;margin:0 0 4px;">Reset Your Password</h2>
    <p style="margin:0 0 16px;color:${TEXT_BODY};">Hi <strong>${name}</strong>, we received a request to reset your <strong>${settings.academyName}</strong> account password.</p>

    ${codeBlock(code)}

    <p style="color:${TEXT_BODY};font-size:14px;">If you did not request a password reset, please ignore this email or contact support immediately.</p>

    <hr style="border:none;border-top:1px solid #eef0f5;margin:20px 0;" />

    <p style="font-size:13px;color:${TEXT_MUTED};margin:0;">For security, this link can only be used once. If you need to reset your password again, please request a new code.</p>
  `;

  const tmpl = await fetchTemplateByCategory("password_reset");
  if (tmpl) {
    if (tmpl.config) {
      const rendered = renderConfigTemplate(tmpl, { name, email, phone: "", academyName: settings.academyName, verificationCode: code }, settings);
      subject = rendered.subject || subject;
      await resend.emails.send({ from, to: email, subject, html: rendered.body });
      return;
    }
    const rendered = renderTemplate(tmpl, { name, email, phone: "", academyName: settings.academyName, verificationCode: code });
    subject = rendered.subject || subject;
    body = rendered.body || body;
  }

  await resend.emails.send({
    from,
    to: email,
    subject,
    html: baseLayout(body, settings),
  });
}

export async function sendApprovalEmail(
  email: string,
  name: string
) {
  const settings = await getSettings();
  const from = getFromAddress(settings);

  let subject = `Welcome to ${settings.academyName} – Application Approved!`;
  let body = `
    ${heroBadge("CONGRATULATIONS", "#16a34a")}
    <h2 style="color:${PRIMARY};font-size:22px;margin:0 0 4px;">Congratulations, ${name}!</h2>
    <p style="color:${TEXT_BODY};margin:0 0 16px;">We are delighted to welcome you to <strong>${settings.academyName}</strong>.</p>

    <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;background-color:#f0fdf4;border-radius:12px;padding:20px;margin:0 0 20px;border-left:4px solid #16a34a;">
      <tr>
        <td>
          <p style="font-family:Arial,sans-serif;font-size:15px;font-weight:600;color:#166534;margin:0 0 8px;">Your application has been approved!</p>
          <p style="font-family:Arial,sans-serif;font-size:14px;color:#166534;margin:0;">You are now officially a student. Log in to access course materials, track your progress, and begin your cadet preparation journey.</p>
        </td>
      </tr>
    </table>

    ${button(settings.website + "/login", "Access Your Dashboard")}

    <h3 style="color:${PRIMARY};font-size:15px;margin:0 0 8px;">What's Next?</h3>
    <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;margin:0 0 16px;">
      <tr>
        <td style="padding:6px 0;font-size:14px;color:${TEXT_BODY};font-family:Arial,sans-serif;">📚 &nbsp; Explore your enrolled courses</td>
      </tr>
      <tr>
        <td style="padding:6px 0;font-size:14px;color:${TEXT_BODY};font-family:Arial,sans-serif;">📝 &nbsp; Take practice exams</td>
      </tr>
      <tr>
        <td style="padding:6px 0;font-size:14px;color:${TEXT_BODY};font-family:Arial,sans-serif;">📅 &nbsp; Check live class schedules</td>
      </tr>
      <tr>
        <td style="padding:6px 0;font-size:14px;color:${TEXT_BODY};font-family:Arial,sans-serif;">📢 &nbsp; Stay updated with notices</td>
      </tr>
    </table>

    <hr style="border:none;border-top:1px solid #eef0f5;margin:20px 0;" />

    <p style="font-size:14px;color:${TEXT_BODY};margin:0;">Best regards,<br/><strong style="color:${PRIMARY};">Admissions Team</strong><br/>${settings.academyName}</p>
  `;

  const tmpl = await fetchTemplateByCategory("approval");
  if (tmpl) {
    if (tmpl.config) {
      const rendered = renderConfigTemplate(tmpl, { name, email, phone: "", academyName: settings.academyName }, settings);
      subject = rendered.subject || subject;
      await resend.emails.send({ from, to: email, subject, html: rendered.body });
      return;
    }
    const rendered = renderTemplate(tmpl, { name, email, phone: "", academyName: settings.academyName });
    subject = rendered.subject || subject;
    body = rendered.body || body;
  }

  await resend.emails.send({
    from,
    to: email,
    subject,
    html: baseLayout(body, settings),
  });
}
