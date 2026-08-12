import "server-only";
import type { MagicLinkEmail } from "./dentistos-auth";

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || "admin@usdentistsdirectory.com";

export async function sendDentistOSMagicLinkEmail(message: MagicLinkEmail): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn("[dentistos-auth] RESEND_API_KEY not set - skipping magic-link email");
    return;
  }

  const { Resend } = await import("resend");
  const resend = new Resend(apiKey);
  const result = await resend.emails.send({
    from: FROM_EMAIL,
    to: message.email,
    subject: "Sign in to DentistOS",
    text: [
      "Use this secure link to sign in to DentistOS:",
      "",
      message.magicLink,
      "",
      `This link expires at ${message.expiresAt.toISOString()}.`,
      "If you did not request this link, you can ignore this email.",
    ].join("\n"),
    html: `
      <p>Use this secure link to sign in to DentistOS:</p>
      <p><a href="${escapeHtml(message.magicLink)}">Sign in to DentistOS</a></p>
      <p>This link expires at ${escapeHtml(message.expiresAt.toISOString())}.</p>
      <p>If you did not request this link, you can ignore this email.</p>
    `,
  });

  if (result.error) {
    console.error("[dentistos-auth] Magic-link email failed");
    throw new Error("Magic-link email failed.");
  }
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) =>
    c === "&" ? "&amp;" : c === "<" ? "&lt;" : c === ">" ? "&gt;" : c === '"' ? "&quot;" : "&#39;"
  );
}
