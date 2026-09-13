import { getCurrentUser } from "@/lib/dentistos-auth-server";
import { PostgresDentistOSClaimBridgeRepository } from "@/lib/dentistos-claim-bridge-data";
import { createDentistOSClaimLinkHandler } from "@/lib/dentistos-claim-bridge-route";
import { syncDirectoryClaimToDentOS } from "@/lib/dentos-api-client";

export async function POST(request: Request): Promise<Response> {
  return createDentistOSClaimLinkHandler({
    currentUser: getCurrentUser,
    repository: new PostgresDentistOSClaimBridgeRepository(),
    syncDentOSClaim: syncDirectoryClaimToDentOS,
  })(request);
}
