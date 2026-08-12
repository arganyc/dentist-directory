import type { NextRequest } from "next/server";
import { getSql } from "@/lib/db";
import { generateAccessToken, TOOLS_ACCESS_COOKIE } from "@/lib/toolsAccess";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@usdentistsdirectory.com";
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || "admin@usdentistsdirectory.com";
const SITE_URL = process.env.SITE_URL || "https://www.usdentistsdirectory.com";

type ClaimInput = {
  name: string;
  email: string;
  phone: string;
  npi: string;
  dentistId?: string;
  practiceName: string;
  address: string;
  website?: string;
  message?: string;
  campaignCity?: string;
  source?: string;
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

async function sendAccessEmail(
  input: ClaimInput,
  accessUrl: string,
  dentistOSLinkUrl: string
): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn("[claim] RESEND_API_KEY not set — skipping access-link email");
    return;
  }
  const { Resend } = await import("resend");
  const resend = new Resend(apiKey);

  const text = [
    `Thanks for claiming ${input.practiceName} on US Dentists Directory.`,
    ``,
    `Your free practice-management tools (overhead, case acceptance, hygiene`,
    `production, patient acquisition cost, staffing, equipment ROI, and`,
    `insurance write-off calculators) are ready now:`,
    ``,
    accessUrl,
    ``,
    `You can also connect this claim to your DentistOS practice workspace:`,
    ``,
    dentistOSLinkUrl,
    ``,
    `We'll separately verify and update your public listing information`,
    `within one business day.`,
  ].join("\n");

  const html = `
    <p>Thanks for claiming <b>${escapeHtml(input.practiceName)}</b> on US Dentists Directory.</p>
    <p>Your free practice-management tools (overhead, case acceptance, hygiene production,
    patient acquisition cost, staffing, equipment ROI, and insurance write-off calculators)
    are ready now:</p>
    <p><a href="${escapeHtml(accessUrl)}">${escapeHtml(accessUrl)}</a></p>
    <p>You can also connect this claim to your DentistOS practice workspace:</p>
    <p><a href="${escapeHtml(dentistOSLinkUrl)}">${escapeHtml(dentistOSLinkUrl)}</a></p>
    <p>We'll separately verify and update your public listing information within one business day.</p>
  `;

  const result = await resend.emails.send({
    from: FROM_EMAIL,
    to: input.email,
    subject: "Your free SmileFinder practice tools are ready",
    text,
    html,
  });
  if (result.error) {
    console.error("[claim] Access-link email failed:", result.error);
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
    dentistId: pickString(obj.dentistId) || undefined,
    practiceName: pickString(obj.practiceName),
    address: pickString(obj.address),
    website: pickString(obj.website) || undefined,
    message: pickString(obj.message) || undefined,
    campaignCity: pickString(obj.campaignCity) || undefined,
    source: pickString(obj.source) || undefined,
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

  const campaignNotes = [
    input.source ? `Campaign source: ${input.source}` : "",
    input.campaignCity ? `Campaign city: ${input.campaignCity}` : "",
  ].filter(Boolean);
  const storedMessage = [...campaignNotes, input.message || ""].filter(Boolean).join("\n\n");
  const storedInput = { ...input, message: storedMessage || undefined };

  const sql = getSql();
  if (input.dentistId) {
    const dentistRows = (await sql.query(`SELECT id FROM dentists WHERE id = $1 LIMIT 1`, [
      input.dentistId,
    ])) as { id: string }[];
    if (dentistRows.length === 0) {
      return badRequest("Dentist listing not found");
    }
  }

  let claimId: number;
  const accessToken = generateAccessToken();
  try {
    const rows = (await sql.query(
      `INSERT INTO claims (name, email, phone, npi, dentist_id, practice_name, address, website, message, access_token)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING id`,
      [
        input.name,
        input.email,
        input.phone,
        input.npi,
        input.dentistId ?? null,
        input.practiceName,
        input.address,
        input.website ?? null,
        storedInput.message ?? null,
        accessToken,
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
    await sendNotification(storedInput, claimId);
  } catch (err) {
    console.error("[claim] Notification error:", err);
  }

  const accessUrl = `${SITE_URL}/api/tools-access?token=${encodeURIComponent(accessToken)}`;
  const dentistOSLinkUrl = `${SITE_URL}/dentistos/link-claim?token=${encodeURIComponent(accessToken)}`;
  try {
    await sendAccessEmail(storedInput, accessUrl, dentistOSLinkUrl);
  } catch (err) {
    console.error("[claim] Access-link email error:", err);
  }

  const res = Response.json({ ok: true, id: claimId, toolsUrl: "/tools/member" });
  // Grant instant self-serve access to the gated practice-management tools —
  // separate from the manual review that still gates the public listing data.
  const secureAttr = process.env.NODE_ENV === "production" ? "; Secure" : "";
  res.headers.append(
    "Set-Cookie",
    `${TOOLS_ACCESS_COOKIE}=${accessToken}; Path=/; Max-Age=${60 * 60 * 24 * 365}; HttpOnly; SameSite=Lax${secureAttr}`
  );
  return res;
}
