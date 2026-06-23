export interface TemplateConfig {
  headerColor: string;
  showLogo: boolean;
  tagline: string;
  badgeText: string;
  badgeColor: string;
  heading: string;
  message: string;
  messageColor: string;
  showButton: boolean;
  buttonText: string;
  buttonUrl: string;
  buttonColor: string;
  footerColor: string;
  showContact: boolean;
  footerText: string;
}

export const DEFAULT_CONFIG: TemplateConfig = {
  headerColor: "#07220B",
  showLogo: true,
  tagline: "Preparing Future Leaders Through Discipline & Excellence",
  badgeText: "",
  badgeColor: "#d97706",
  heading: "",
  message: "",
  messageColor: "#444444",
  showButton: false,
  buttonText: "",
  buttonUrl: "",
  buttonColor: "#07220B",
  footerColor: "#f8f9fc",
  showContact: true,
  footerText: "",
};

import { sanitizeHtml } from "./sanitize";

export function generateEmailHtml(config: TemplateConfig, academy: { name: string; logo: string; website: string; email: string; phone: string }): string {
  const logoUrl = academy.logo
    ? `${academy.website.replace(/\/+$/, "")}/${academy.logo.replace(/^\//, "")}`
    : "";

  const headerBg = config.headerColor
    ? `background:linear-gradient(135deg,${config.headerColor},${config.headerColor}dd)`
    : "background:linear-gradient(135deg,#07220B,#0d3d17)";

  const logoHtml = config.showLogo && logoUrl
    ? `<img src="${logoUrl}" alt="${academy.name}" style="height:48px;width:auto;display:block;margin:0 auto;" />`
    : `<h1 style="color:#ffffff;margin:0;font-size:22px;font-weight:700;">${academy.name}</h1>`;

  const badgeHtml = config.badgeText
    ? `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto 20px;"><tr><td style="background-color:${config.badgeColor}15;color:${config.badgeColor};font-size:13px;font-weight:600;padding:6px 16px;border-radius:20px;font-family:Arial,sans-serif;">${sanitizeHtml(config.badgeText)}</td></tr></table>`
    : "";

  const headingHtml = config.heading
    ? `<h2 style="color:${config.headerColor || "#07220B"};font-size:22px;margin:0 0 16px;">${sanitizeHtml(config.heading)}</h2>`
    : "";

  const messageHtml = config.message
    ? `<p style="margin:0 0 16px;color:${config.messageColor || "#444"};">${sanitizeHtml(config.message).replace(/\n/g, "<br/>")}</p>`
    : "";

  const buttonHtml = config.showButton && config.buttonText
    ? `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:24px auto;"><tr><td align="center" style="background-color:${config.buttonColor || "#07220B"};border-radius:8px;"><a href="${sanitizeHtml(config.buttonUrl || "#")}" target="_blank" rel="noopener noreferrer" style="display:inline-block;padding:12px 32px;font-family:Arial,sans-serif;font-size:15px;font-weight:600;color:#ffffff;text-decoration:none;border-radius:8px;">${sanitizeHtml(config.buttonText)}</a></td></tr></table>`
    : "";

  const footerTextHtml = config.footerText
    ? `<p style="margin:0 0 2px;font-family:Arial,sans-serif;font-size:12px;color:#999;">${sanitizeHtml(config.footerText).replace(/\n/g, "<br/>")}</p>`
    : "";

  const contactHtml = config.showContact
    ? `<p style="margin:0 0 2px;font-family:Arial,sans-serif;font-size:12px;color:#999;">${academy.email} &bull; ${academy.phone}</p>`
    : "";

  const footerBg = config.footerColor || "#f8f9fc";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>${academy.name}</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f6f9;">
  <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;background-color:#f4f6f9;">
    <tr>
      <td align="center" style="padding:24px 16px;">
        <table role="presentation" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.06);">

          <!-- Header -->
          <tr>
            <td align="center" style="padding:32px 32px 24px;${headerBg};">
              ${logoHtml}
              ${config.tagline ? `<p style="color:rgba(255,255,255,0.65);font-size:13px;margin:8px 0 0;font-family:Arial,sans-serif;">${sanitizeHtml(config.tagline)}</p>` : ""}
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:32px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.6;color:${config.messageColor || "#444"};">
              ${badgeHtml}
              ${headingHtml}
              ${messageHtml}
              ${buttonHtml}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:24px 32px;background-color:${footerBg};border-top:1px solid #eef0f5;">
              <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;">
                <tr>
                  <td align="center" style="font-family:Arial,sans-serif;font-size:12px;color:#999;">
                    <p style="margin:0 0 4px;"><strong style="color:#555;">${academy.name}</strong></p>
                    <p style="margin:0 0 2px;">${academy.website}</p>
                    ${contactHtml}
                    ${footerTextHtml}
                    <p style="margin:12px 0 0;font-size:11px;color:#bbb;">&copy; ${new Date().getFullYear()} ${academy.name}. All rights reserved.</p>
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
