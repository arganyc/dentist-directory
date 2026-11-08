import { createDentistOSListingsPostHandler } from "@/lib/dentistos-listings-route";
import { upsertDentistOSListing } from "@/lib/dentistos-listings-data";
import { createDentistOSListingsGetHandler } from "@/lib/dentistos-listings-preflight";
import { getDentistOSListingPreflight } from "@/lib/dentistos-listings-preflight-data";

const expectedToken = () => process.env.DENTISTOS_PUBLISH_TOKEN;

export const GET = createDentistOSListingsGetHandler({
  expectedToken,
  preflight: getDentistOSListingPreflight,
});

export const POST = createDentistOSListingsPostHandler({
  expectedToken,
  upsert: upsertDentistOSListing,
});
