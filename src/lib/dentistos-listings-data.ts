import "server-only";
import { getSql } from "./db";
import {
  type DentistOSPublishOutcome,
  type DentistOSPublishPayload,
} from "./dentistos-listings";
import { upsertDentistOSListingWithSql } from "./dentistos-listings-repository";

export async function upsertDentistOSListing(
  payload: DentistOSPublishPayload
): Promise<DentistOSPublishOutcome> {
  return upsertDentistOSListingWithSql(payload, getSql());
}
