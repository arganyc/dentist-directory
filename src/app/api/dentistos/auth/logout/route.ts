import { PostgresDentistOSAuthRepository } from "@/lib/dentistos-auth-data";
import { createDentistOSLogoutHandler } from "@/lib/dentistos-auth-route";

export async function POST(request: Request): Promise<Response> {
  return createDentistOSLogoutHandler({
    repository: new PostgresDentistOSAuthRepository(),
    production: () => process.env.NODE_ENV === "production",
  })(request);
}
