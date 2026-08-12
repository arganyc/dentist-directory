import { PostgresDentistOSAuthRepository } from "@/lib/dentistos-auth-data";
import { createDentistOSMagicLinkCallbackHandler } from "@/lib/dentistos-auth-route";

export async function GET(request: Request): Promise<Response> {
  return createDentistOSMagicLinkCallbackHandler({
    repository: new PostgresDentistOSAuthRepository(),
    production: () => process.env.NODE_ENV === "production",
  })(request);
}
