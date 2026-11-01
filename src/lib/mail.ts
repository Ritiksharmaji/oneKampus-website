import "server-only";
import nodemailer from "nodemailer";

type Mail = { to: string; subject: string; html: string; replyTo?: string };

const transport = process.env.SMTP_HOST
  ? nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT ?? 587),
      secure: Number(process.env.SMTP_PORT) === 465,
      auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD } : undefined,
    })
  : null;

/** Sends an email through SMTP, or prints it to the server log when SMTP is not configured. */
export async function sendMail(mail: Mail) {
  const from = process.env.MAIL_FROM ?? "oneKampus <no-reply@onekampus.local>";
  if (!transport) {
    console.info(`[mail] SMTP not configured — would send to ${mail.to}: "${mail.subject}"`);
    return;
  }
  await transport.sendMail({ from, ...mail });
}

export function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
}

/** Simple branded email wrapper. `body` must already be escaped HTML. */
export function emailLayout(title: string, body: string) {
  return `<!doctype html><html><body style="margin:0;background:#FBFAF7;font-family:Arial,sans-serif;color:#161A33">
  <table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:24px">
  <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;background:#fff;border:1px solid #ECEDF3;border-radius:16px">
    <tr><td style="padding:20px 28px;border-bottom:3px solid #FF6B57;font-size:20px;font-weight:bold">one<span style="color:#FF6B57">Kampus</span></td></tr>
    <tr><td style="padding:28px"><h1 style="margin:0 0 16px;font-size:20px">${escapeHtml(title)}</h1>${body}</td></tr>
  </table></td></tr></table></body></html>`;
}
