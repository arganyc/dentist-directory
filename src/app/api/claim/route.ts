import type { NextRequest } from "next/server";
import { getSql } from "@/lib/db";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "arganyc@gmail.com";
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || "admin@usdentistsdirectory.com";

type ClaimInput = {
  name: string;
  email: string;
  phone: string;
  npi: string;
  practiceName: string;
  address: string;
  website?: string;
  message?: string;
};

function pickString(v: unknown): string {
  return typeof v === "string" ? v.trim() : "";
}

function badRequest(error: string): Response {
  return Response.json({ ok: false, error }, { status: 400 });
}

async function sendNotification(input: ClaimInput, claimId: number): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn("[claim] RESEND_API_KEY not set — skipping email notification");
    return;
  }
  // Lazy import keeps the SDK out of bundles where it isn't used.
  const { Resend } = await import("resend");
  const resend = new Resend(apiKey);

  const subject = `New listing claim — ${input.practiceName}`;
  const text = [
    `A new dentist listing claim was submitted.`,
    ``,
    `Claim ID:      ${claimId}`,
    `Name:          ${input.name}`,
    `Email:         ${input.email}`,
    `Phone:         ${input.phone}`,
    `NPI:           ${input.npi}`,
    `Practice:      ${input.practiceName}`,
    `Address:       ${input.address}`,
    `Website:       ${input.website || "(not provided)"}`,
    ``,
    `Message:`,
    input.message || "(none)",
    ``,
    `Verify at: https://npiregistry.cms.hhs.gov/provider-view/${input.npi}`,
  ].join("\n");

  const html = `
    <h2>New listing claim — ${escapeHtml(input.practiceName)}</h2>
    <table style="border-collapse:collapse">
      <tr><td><b>Claim ID</b></td><td>${claimId}</td></tr>
      <tr><td><b>Name</b></td><td>${escapeHtml(input.name)}</td></tr>
      <tr><td><b>Email</b></td><td><a href="mailto:${encodeURIComponent(input.email)}">${escapeHtml(input.email)}</a></td></tr>
      <tr><td><b>Phone</b></td><td>${escapeHtml(input.phone)}</td></tr>
      <tr><td><b>NPI</b></td><td>${escapeHtml(input.npi)}</td></tr>
      <tr><td><b>Practice</b></td><td>${escapeHtml(input.practiceName)}</td></tr>
      <tr><td><b>Address</b></td><td>${escapeHtml(input.address)}</td></tr>
      <tr><td><b>Website</b></td><td>${input.website ? `<a href="${escapeHtml(input.website)}" rel="noopener nofollow">${escapeHtml(input.website)}</a>` : "(not provided)"}</td></tr>
    </table>
    ${input.message ? `<p><b>Message:</b></p><blockquote>${escapeHtml(input.message)}</blockquote>` : ""}
    <p><a href="https://npiregistry.cms.hhs.gov/provider-view/${encodeURIComponent(input.npi)}">Verify NPI ${escapeHtml(input.npi)} on the official registry</a></p>
  `;

  const result = await resend.emails.send({
    from: FROM_EMAIL,
    to: ADMIN_EMAIL,
    replyTo: input.email,
    subject,
    text,
    html,
  });
  if (result.error) {
    console.error("[claim] Resend send failed:", result.error);
  } else {
    console.log("[claim] Notification sent. id:", result.data?.id);
  }
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) =>
    c === "&" ? "&amp;" : c === "<" ? "&lt;" : c === ">" ? "&gt;" : c === '"' ? "&quot;" : "&#39;"
  );
}

export async function POST(req: NextRequest): Promise<Response> {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return badRequest("Invalid JSON");
  }
  const obj = (body ?? {}) as Record<string, unknown>;

  const input: ClaimInput = {
    name: pickString(obj.name),
    email: pickString(obj.email),
    phone: pickString(obj.phone),
    npi: pickString(obj.npi),
    practiceName: pickString(obj.practiceName),
    address: pickString(obj.address),
    website: pickString(obj.website) || undefined,
    message: pickString(obj.message) || undefined,
  };

  if (!input.name) return badRequest("Name is required");
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(input.email)) return badRequest("Valid email is required");
  if (!input.phone) return badRequest("Phone is required");
  if (!/^\d{10}$/.test(input.npi)) return badRequest("NPI must be 10 digits");
  if (!input.practiceName) return badRequest("Practice name is required");
  if (!input.address) return badRequest("Practice address is required");
  if (input.website && !/^https?:\/\//i.test(input.website)) {
    return badRequest("Website must start with http:// or https://");
  }

  const sql = getSql();
  let claimId: number;
  try {
    const rows = (await sql.query(
      `INSERT INTO claims (name, email, phone, npi, practice_name, address, website, message)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING id`,
      [
        input.name,
        input.email,
        input.phone,
        input.npi,
        input.practiceName,
        input.address,
        input.website ?? null,
        input.message ?? null,
      ]
    )) as { id: number }[];
    claimId = rows[0].id;
  } catch (err) {
    console.error("[claim] DB insert failed:", err);
    return Response.json({ ok: false, error: "Failed to save claim" }, { status: 500 });
  }

  // Email is best-effort: a failure here doesn't fail the submission. The row
  // is already saved and an admin can process from the dashboard / DB.
  try {
    await sendNotification(input, claimId);
  } catch (err) {
    console.error("[claim] Notification error:", err);
  }

  return Response.json({ ok: true, id: claimId });
}
