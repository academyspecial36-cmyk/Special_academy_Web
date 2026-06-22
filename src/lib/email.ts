import { Resend } from "resend";

const resend = new Resend(
  process.env.RESEND_API_KEY  || ""
);

const FROM = process.env.EMAIL_FROM 
  ? `Special Academy <${process.env.EMAIL_FROM}>`
  : "onboarding@resend.dev";

export async function sendEnrollmentEmail(
  email: string,
  name: string,
  password: string,
  verificationCode: string
) {
  await resend.emails.send({
    from: FROM,
    to: email,
    subject: "Your Special Academy Account & Verification Code",
    html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;">
  <div style="text-align:center;padding:20px 0;border-bottom:2px solid #1e3a5f;">
    <h1 style="color:#1e3a5f;margin:0;">Special Academy</h1>
  </div>
  <div style="padding:30px 0;">
    <h2 style="color:#1e3a5f;">Welcome, ${name}!</h2>
    <p>To activate your enrollment, please use the following verification code:</p>
    <div style="text-align:center;margin:25px 0;">
      <span style="font-size:32px;font-weight:bold;letter-spacing:8px;color:#1e3a5f;background:#f0f4f8;padding:15px 30px;border-radius:8px;font-family:monospace;">${verificationCode}</span>
    </div>
    <p>Enter this code on the verification page to confirm your email address. After verification, our team will review your application.</p>
    <p style="color:#666;font-size:13px;margin-top:25px;">If you did not create this account, please ignore this email.</p>
  </div>
  <div style="border-top:1px solid #ddd;padding:15px 0;text-align:center;color:#999;font-size:12px;">
    <p>Special Academy &bull; Building Future Leaders</p>
  </div>
</body>
</html>`,
  });
}

export async function sendRejectionEmail(
  email: string,
  name: string,
  message: string
) {
  await resend.emails.send({
    from: FROM,
    to: email,
    subject: "Your Special Academy Application Status",
    html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;">
  <div style="text-align:center;padding:20px 0;border-bottom:2px solid #1e3a5f;">
    <h1 style="color:#1e3a5f;margin:0;">Special Academy</h1>
  </div>
  <div style="padding:30px 0;">
    <h2 style="color:#1e3a5f;">Application Update</h2>
    <p>Dear ${name},</p>
    <p>After careful review, we regret to inform you that your enrollment application has been <strong style="color:#dc2626;">rejected</strong>.</p>
    <div style="background:#fef2f2;padding:15px;border-radius:8px;margin:20px 0;border-left:4px solid #dc2626;">
      <p style="margin:0;color:#991b1b;"><strong>Reason:</strong></p>
      <p style="margin:5px 0 0;color:#991b1b;">${message}</p>
    </div>
    <p>You may reapply in the future if your circumstances change.</p>
    <p>Best regards,<br/>Admissions Team</p>
  </div>
  <div style="border-top:1px solid #ddd;padding:15px 0;text-align:center;color:#999;font-size:12px;">
    <p>Special Academy &bull; Building Future Leaders</p>
  </div>
</body>
</html>`,
  });
}

export async function sendApprovalEmail(
  email: string,
  name: string
) {
  await resend.emails.send({
    from: FROM,
    to: email,
    subject: "Welcome to Special Academy - Application Approved!",
    html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;">
  <div style="text-align:center;padding:20px 0;border-bottom:2px solid #1e3a5f;">
    <h1 style="color:#1e3a5f;margin:0;">Special Academy</h1>
  </div>
  <div style="padding:30px 0;">
    <h2 style="color:#1e3a5f;">Congratulations, ${name}!</h2>
    <p>We are pleased to inform you that your enrollment application has been <strong style="color:#16a34a;">approved</strong>.</p>
    <p>You are now officially a student at Special Academy. Welcome aboard!</p>
    <p>You can log in to your account to access course materials and track your progress.</p>
    <p>Best regards,<br/>Admissions Team</p>
  </div>
  <div style="border-top:1px solid #ddd;padding:15px 0;text-align:center;color:#999;font-size:12px;">
    <p>Special Academy &bull; Building Future Leaders</p>
  </div>
</body>
</html>`,
  });
}
