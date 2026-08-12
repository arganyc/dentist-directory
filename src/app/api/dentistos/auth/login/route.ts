import { PostgresDentistOSAuthRepository } from "@/lib/dentistos-auth-data";
import { sendDentistOSMagicLinkEmail } from "@/lib/dentistos-auth-email";
import { createDentistOSLoginRequestHandler } from "@/lib/dentistos-auth-route";

const SITE_URL = process.env.SITE_URL || "https://www.usdentistsdirectory.com";

export async function POST(request: Request): Promise<Response> {
  return createDentistOSLoginRequestHandler({
    repository: new PostgresDentistOSAuthRepository(),
    sendMagicLink: sendDentistOSMagicLinkEmail,
    siteUrl: () => SITE_URL,
  })(request);
}
