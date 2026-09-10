import { config, put, get, list } from "@/db/repository";
import type { Entry } from "./content";
const subjects: Record<string, string> = {
  new_booking: "We have received your booking request",
  confirmation: "Your BelofteBos stay is confirmed",
  cancellation: "Your BelofteBos booking has been cancelled",
  booking_enquiry: "Your stay enquiry",
  function_enquiry: "Your gathering at BelofteBos",
  admin_notification: "A new enquiry for BelofteBos",
  contact_enquiry: "Thank you for getting in touch",
  password_reset: "Reset your BelofteBos password",
};
function escape(s: string) {
  return s.replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ]!,
  );
}
export function emailTemplate(type: string, name: string, message: string) {
  const resetUrl =
    type === "password_reset" ? message.match(/https:\/\/\S+/)?.[0] : undefined;
  return `<div style="background:#FBF8F1;padding:40px;font-family:Arial;color:#1F321F"><div style="max-width:560px;margin:auto"><h1 style="font:34px Georgia">BelofteBos</h1><p style="letter-spacing:3px">FARMHOUSE INN</p><hr><h2 style="font:28px Georgia">${escape(subjects[type] ?? "A note from BelofteBos")}</h2><p>Hello ${escape(name)},</p><p style="line-height:1.8;white-space:pre-line">${escape(message)}</p>${resetUrl ? `<p><a style="background:#1F321F;color:#FBF8F1;padding:14px 20px" href="${escape(resetUrl)}">Reset your password</a></p>` : ""}<p>Warm regards,<br>BelofteBos Farmhouse Inn</p><p>reservations@beloftebos.net · +27 83 409 1170</p></div></div>`;
}
export async function deliverMail(id: string) {
  const entry = await get("email_outbox", id);
  if (!entry) throw new Error("Email not found");
  if (entry.status === "SENT") return { sent: true };
  if (!config("RESEND_API_KEY") || !config("EMAIL_FROM"))
    return { sent: false, queued: true };
  try {
    const r = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: "Bearer " + config("RESEND_API_KEY"),
        "Content-Type": "application/json",
        "Idempotency-Key": id,
      },
      body: JSON.stringify({
        from: config("EMAIL_FROM"),
        to: [String(entry.to)],
        subject: subjects[String(entry.type)] ?? "BelofteBos Farmhouse Inn",
        html: emailTemplate(
          String(entry.type),
          String(entry.name),
          String(entry.message),
        ),
      }),
      signal: AbortSignal.timeout(15000),
    });
    if (!r.ok) throw new Error("Email provider unavailable");
    await put("email_outbox", {
      ...entry,
      status: "SENT",
      sent_at: new Date().toISOString(),
    });
    return { sent: true };
  } catch {
    await put("email_outbox", {
      ...entry,
      status: "FAILED",
      attempts: Number(entry.attempts ?? 0) + 1,
    });
    return { sent: false, queued: true };
  }
}
export async function sendMail(
  type: string,
  to: string,
  name: string,
  message: string,
) {
  const id = crypto.randomUUID();
  await put("email_outbox", { id, type, to, name, message, status: "QUEUED" });
  return deliverMail(id);
}
export async function flushOutbox() {
  if (!config("RESEND_API_KEY")) return { configured: false };
  const pending = (await list("email_outbox"))
    .filter((e: Entry) => e.status !== "SENT" && Number(e.attempts ?? 0) < 5)
    .slice(0, 20);
  let sent = 0;
  for (const e of pending) if ((await deliverMail(e.id)).sent) sent++;
  return { sent, pending: pending.length - sent };
}
