import { createDentistOSListingsPostHandler } from "@/lib/dentistos-listings-route";
import { upsertDentistOSListing } from "@/lib/dentistos-listings-data";

export const POST = createDentistOSListingsPostHandler({
  expectedToken: () => process.env.DENTISTOS_PUBLISH_TOKEN,
  upsert: upsertDentistOSListing,
});
