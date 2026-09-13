import {
  buildExpiredSessionCookie,
  buildSessionCookie,
  DENTISTOS_SESSION_COOKIE,
  isValidEmail,
  logoutSession,
  normalizeEmail,
  requestMagicLink,
  verifyMagicLink,
  type DentistOSAuthRepository,
  type MagicLinkEmail,
} from "./dentistos-auth";

type LoginHandlerDeps = {
  repository: DentistOSAuthRepository;
  sendMagicLink: (message: MagicLinkEmail) => Promise<void>;
  siteUrl: () => string;
};

type CallbackHandlerDeps = {
  repository: DentistOSAuthRepository;
  production: () => boolean;
  now?: () => Date;
};

type LogoutHandlerDeps = {
  repository: DentistOSAuthRepository;
  production: () => boolean;
};

export function createDentistOSLoginRequestHandler(deps: LoginHandlerDeps) {
  return async function POST(request: Request): Promise<Response> {
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return json({ success: false, error: "malformed_json" }, 400);
    }

    const obj = (body ?? {}) as Record<string, unknown>;
    const email = typeof obj.email === "string" ? normalizeEmail(obj.email) : "";
    const name = typeof obj.name === "string" ? obj.name.trim() : null;
    if (!isValidEmail(email)) {
      return json({ success: false, error: "invalid_email" }, 400);
    }

    try {
      await requestMagicLink({
        email,
        name,
        siteUrl: deps.siteUrl(),
        repository: deps.repository,
        sendMagicLink: deps.sendMagicLink,
      });
    } catch (error) {
      console.error("[dentistos-auth] login request failed", describeLoginFailure(error));
      return json({ success: false, error: "login_request_failed" }, 500);
    }

    return json({ success: true }, 200);
  };
}

export function createDentistOSMagicLinkCallbackHandler(deps: CallbackHandlerDeps) {
  return async function GET(request: Request): Promise<Response> {
    const url = new URL(request.url);
    const result = await verifyMagicLink({
      token: url.searchParams.get("token") ?? "",
      repository: deps.repository,
      now: deps.now?.(),
    });

    if (!result.success) {
      return redirectResponse(new URL("/login?error=invalid_link", request.url));
    }

    const response = redirectResponse(new URL("/login?verified=1", request.url));
    response.headers.append(
      "Set-Cookie",
      buildSessionCookie(result.rawSessionToken, result.sessionExpiresAt, deps.production())
    );
    return response;
  };
}

export function createDentistOSLogoutHandler(deps: LogoutHandlerDeps) {
  return async function POST(request: Request): Promise<Response> {
    const rawSessionToken = parseCookie(
      request.headers.get("cookie") ?? "",
      DENTISTOS_SESSION_COOKIE
    );
    await logoutSession({
      rawSessionToken: rawSessionToken ?? "",
      repository: deps.repository,
    });

    return Response.json(
      { success: true },
      {
        headers: {
          "Set-Cookie": buildExpiredSessionCookie(deps.production()),
          "Cache-Control": "no-store",
        },
      }
    );
  };
}

function describeLoginFailure(error: unknown): Record<string, string | undefined> {
  if (!(error instanceof Error)) return { category: "unknown" };

  const candidate = error as Error & { code?: string };
  const message = error.message.toLowerCase();
  let category = "unknown";

  if (candidate.code?.startsWith("42P01") || message.includes("does not exist")) {
    category = "database_schema";
  } else if (
    message.includes("database") ||
    message.includes("postgres") ||
    message.includes("connection") ||
    message.includes("timeout")
  ) {
    category = "database_connection";
  } else if (
    message.includes("resend") ||
    message.includes("email") ||
    message.includes("sender") ||
    message.includes("domain")
  ) {
    category = "email_delivery";
  }

  return {
    category,
    code: candidate.code,
    message: error.message.slice(0, 300),
  };
}

function parseCookie(cookieHeader: string, name: string): string | null {
  for (const cookie of cookieHeader.split(";")) {
    const [rawName, ...rawValue] = cookie.trim().split("=");
    if (rawName === name) return decodeURIComponent(rawValue.join("="));
  }
  return null;
}

function json(body: Record<string, unknown>, status: number): Response {
  return Response.json(body, {
    status,
    headers: {
      "Cache-Control": "no-store",
    },
  });
}

function redirectResponse(url: URL): Response {
  return new Response(null, {
    status: 303,
    headers: {
      Location: url.toString(),
    },
  });
}
