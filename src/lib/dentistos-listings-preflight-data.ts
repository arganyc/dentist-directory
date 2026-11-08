import "server-only";
import { getSql } from "./db";
import {
  getDentistOSListingPreflightWithSql,
  type DentistOSListingPreflight,
} from "./dentistos-listings-preflight";

export async function getDentistOSListingPreflight(
  npi: string
): Promise<DentistOSListingPreflight> {
  return getDentistOSListingPreflightWithSql(npi, getSql());
}
