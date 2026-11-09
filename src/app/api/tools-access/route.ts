import { type NextRequest, NextResponse } from "next/server";
import { getClaimByToken, TOOLS_ACCESS_COOKIE } from "@/lib/toolsAccess";

export async function GET(req: NextRequest): Promise<Response> {
  const token = req.nextUrl.searchParams.get("token") ?? "";
  const claim = token ? await getClaimByToken(token) : null;

  const destination = claim ? "/tools/member" : "/claim?source=expired-tools-link";
  const res = NextResponse.redirect(new URL(destination, req.url), 303);

  if (claim) {
    res.cookies.set({
      name: TOOLS_ACCESS_COOKIE,
      value: token,
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });
  }
  return res;
}
