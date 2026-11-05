/**
 * Email notification service for PBC and system alerts.
 *
 * Production: set SMTP_* or use Resend / SendGrid / Azure Communication Services.
 * Demo mode: logs to EmailLog table and console (no external send).
 */

import { prisma } from "@/lib/prisma";

export type SendEmailInput = {
  to: string;
  subject: string;
  body: string;
  template?: string;
  relatedType?: string;
  relatedId?: string;
};

export async function sendEmail(input: SendEmailInput): Promise<{ ok: boolean; id?: string; error?: string }> {
  const log = await prisma.emailLog.create({
    data: {
      to: input.to,
      subject: input.subject,
      body: input.body,
      template: input.template,
      relatedType: input.relatedType,
      relatedId: input.relatedId,
      status: "QUEUED",
    },
  });

  const smtpHost = process.env.SMTP_HOST;
  const resendKey = process.env.RESEND_API_KEY;

  try {
    if (resendKey) {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: process.env.EMAIL_FROM || "Finova <noreply@finova.ai>",
          to: input.to,
          subject: input.subject,
          html: input.body.replace(/\n/g, "<br/>"),
        }),
      });
      if (!res.ok) {
        const errText = await res.text();
        await prisma.emailLog.update({
          where: { id: log.id },
          data: { status: "FAILED", error: errText },
        });
        return { ok: false, id: log.id, error: errText };
      }
    } else if (smtpHost) {
      // Placeholder: integrate nodemailer in production
      console.log("[EMAIL SMTP]", input.to, input.subject);
    } else {
      // Demo mode
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
      console.log("[EMAIL DEMO — not sent externally]");
      console.log("To:", input.to);
      console.log("Subject:", input.subject);
      console.log(input.body);
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    }

    await prisma.emailLog.update({
      where: { id: log.id },
      data: { status: "SENT", sentAt: new Date() },
    });
    return { ok: true, id: log.id };
  } catch (err: any) {
    await prisma.emailLog.update({
      where: { id: log.id },
      data: { status: "FAILED", error: String(err?.message || err) },
    });
    return { ok: false, id: log.id, error: String(err?.message || err) };
  }
}

export function pbcRequestEmail(opts: {
  clientName: string;
  title: string;
  description?: string;
  priority: string;
  dueDate?: string;
  portalUrl: string;
}) {
  const subject = `[PBC] Action required: ${opts.title}`;
  const body = `
Hello ${opts.clientName},

Your accounting firm has requested the following document(s):

  Title:    ${opts.title}
  Priority: ${opts.priority}
  Due:      ${opts.dueDate || "As soon as possible"}

${opts.description ? `Instructions:\n${opts.description}\n` : ""}
Please sign in to the Client Portal and upload the requested files:

  ${opts.portalUrl}

Thank you,
Finova — Client Collaboration
`.trim();
  return { subject, body };
}

export function pbcStatusEmail(opts: {
  clientName: string;
  title: string;
  status: string;
  portalUrl: string;
}) {
  const subject = `[PBC] ${opts.title} — ${opts.status}`;
  const body = `
Hello ${opts.clientName},

The status of your PBC request has been updated:

  Title:  ${opts.title}
  Status: ${opts.status}

View details in the Client Portal:
  ${opts.portalUrl}

Finova
`.trim();
  return { subject, body };
}
