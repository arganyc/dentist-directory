import type { NextRequest } from "next/server";
import { getClaimByToken, TOOLS_ACCESS_COOKIE } from "@/lib/toolsAccess";

export async function GET(req: NextRequest): Promise<Response> {
  const token = req.nextUrl.searchParams.get("token") ?? "";
  const claim = token ? await getClaimByToken(token) : null;

  const destination = claim ? "/tools/member" : "/claim?source=expired-tools-link";
  const res = Response.redirect(new URL(destination, req.url), 303);

  if (claim) {
    const secureAttr = process.env.NODE_ENV === "production" ? "; Secure" : "";
    res.headers.append(
      "Set-Cookie",
      `${TOOLS_ACCESS_COOKIE}=${token}; Path=/; Max-Age=${60 * 60 * 24 * 365}; HttpOnly; SameSite=Lax${secureAttr}`
    );
  }
  return res;
}
