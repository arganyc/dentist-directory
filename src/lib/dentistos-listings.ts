import { createHash, timingSafeEqual } from "crypto";
import { slugify, US_STATES, type Specialty } from "./dentists";

export type DentistOSPublishPayload = {
  candidate_id: number;
  practice_name: string;
  slug: string;
  website: string | null;
  phone: string | null;
  public_email: string | null;
  address: string | null;
  city: string;
  state: string;
  zip_code: string | null;
  practice_category: string | null;
  description: string | null;
  source_summary: string;
  prepared_at: string;
};

export type DentistOSListingAction = "created" | "updated";

export type DentistOSPublishOutcome = {
  success: true;
  external_id: string;
  external_url: string;
  action: DentistOSListingAction;
};

export type DentistOSListingRowValues = {
  id: string;
  slug: string;
  name: string;
  credentials: string;
  specialty: Specialty;
  practice_name: string;
  street: string;
  city: string;
  state: string;
  state_code: string;
  zip: string;
  phone: string;
  rating: number;
  review_count: number;
  accepting_new_patients: boolean;
  years_experience: number;
  is_premium: boolean;
};

export type ExistingDentistListing = Partial<DentistOSListingRowValues> & {
  id: string;
  slug: string;
};

export class DentistOSPayloadValidationError extends Error {
  readonly errors: string[];

  constructor(errors: string[]) {
    super("DentistOS publish payload is invalid.");
    this.name = "DentistOSPayloadValidationError";
    this.errors = errors;
  }
}

export class DuplicateDentistListingError extends Error {
  constructor(message = "A dentist listing already exists for this slug.") {
    super(message);
    this.name = "DuplicateDentistListingError";
  }
}

export function validateDentistOSPublishPayload(value: unknown): DentistOSPublishPayload {
  const errors: string[] = [];
  if (!isRecord(value)) {
    throw new DentistOSPayloadValidationError(["payload must be a JSON object"]);
  }

  const candidateId = value.candidate_id;
  if (typeof candidateId !== "number" || !Number.isInteger(candidateId) || candidateId <= 0) {
    errors.push("candidate_id must be a positive integer");
  }

  const practiceName = requiredString(value.practice_name, "practice_name", errors);
  const slug = requiredString(value.slug, "slug", errors);
  if (slug && slugify(slug) !== slug) {
    errors.push("slug must already be URL-safe");
  }

  const city = requiredString(value.city, "city", errors);
  const state = requiredString(value.state, "state", errors);
  if (state && !normalizeState(state)) {
    errors.push("state must be a valid US state code or name");
  }

  const website = optionalString(value.website, "website", errors);
  const phone = optionalString(value.phone, "phone", errors);
  const publicEmail = optionalString(value.public_email, "public_email", errors);
  const address = optionalString(value.address, "address", errors);
  const zipCode = optionalString(value.zip_code, "zip_code", errors);
  const practiceCategory = optionalString(value.practice_category, "practice_category", errors);
  const description = optionalString(value.description, "description", errors);
  const sourceSummary = requiredString(value.source_summary, "source_summary", errors);
  const preparedAt = requiredString(value.prepared_at, "prepared_at", errors);

  if (!website && !phone && !address) {
    errors.push("at least one of website, phone, or address is required");
  }

  if (preparedAt && Number.isNaN(Date.parse(preparedAt))) {
    errors.push("prepared_at must be an ISO timestamp string");
  }

  if (errors.length) {
    throw new DentistOSPayloadValidationError(errors);
  }

  return {
    candidate_id: candidateId as number,
    practice_name: practiceName,
    slug,
    website,
    phone,
    public_email: publicEmail,
    address,
    city,
    state,
    zip_code: zipCode,
    practice_category: practiceCategory,
    description,
    source_summary: sourceSummary,
    prepared_at: preparedAt,
  };
}

export function verifyDentistOSBearerToken(
  authorizationHeader: string | null,
  expectedToken: string | undefined
): boolean {
  if (!expectedToken || !authorizationHeader) return false;

  const match = authorizationHeader.match(/^Bearer\s+(.+)$/i);
  if (!match) return false;

  return constantTimeStringEqual(match[1].trim(), expectedToken);
}

export function mapDentistOSPayloadToListingRow(
  payload: DentistOSPublishPayload,
  existing?: ExistingDentistListing | null
): DentistOSListingRowValues {
  const normalizedState = normalizeState(payload.state);
  if (!normalizedState) {
    throw new DentistOSPayloadValidationError(["state must be a valid US state code or name"]);
  }

  return {
    id: String(payload.candidate_id),
    slug: payload.slug,
    name: payload.practice_name,
    credentials: existing?.credentials ?? "",
    specialty: specialtyForPracticeCategory(payload.practice_category, existing?.specialty),
    practice_name: payload.practice_name,
    street: payload.address ?? existing?.street ?? "",
    city: payload.city,
    state: normalizedState.name,
    state_code: normalizedState.code,
    zip: payload.zip_code ?? existing?.zip ?? "",
    phone: payload.phone ?? existing?.phone ?? "",
    rating: numericDefault(existing?.rating, 0),
    review_count: integerDefault(existing?.review_count, 0),
    accepting_new_patients: booleanDefault(existing?.accepting_new_patients, true),
    years_experience: integerDefault(existing?.years_experience, 0),
    is_premium: booleanDefault(existing?.is_premium, false),
  };
}

export function dentistExternalUrl(slug: string): string {
  return `/dentists/${encodeURIComponent(slug)}`;
}

function constantTimeStringEqual(actual: string, expected: string): boolean {
  const actualDigest = createHash("sha256").update(actual).digest();
  const expectedDigest = createHash("sha256").update(expected).digest();
  return timingSafeEqual(actualDigest, expectedDigest) && actual.length === expected.length;
}

function requiredString(value: unknown, fieldName: string, errors: string[]): string {
  if (typeof value !== "string") {
    errors.push(`${fieldName} must be a string`);
    return "";
  }

  const normalized = value.trim();
  if (!normalized) {
    errors.push(`${fieldName} is required`);
  }
  return normalized;
}

function optionalString(value: unknown, fieldName: string, errors: string[]): string | null {
  if (value === null || value === undefined) return null;
  if (typeof value !== "string") {
    errors.push(`${fieldName} must be a string or null`);
    return null;
  }

  const normalized = value.trim();
  return normalized || null;
}

function normalizeState(value: string): { code: string; name: string } | null {
  const normalized = value.trim();
  if (!normalized) return null;

  if (/^[a-z]{2}$/i.test(normalized)) {
    const code = normalized.toUpperCase();
    const state = US_STATES.find((item) => item.code === code);
    return state ? { code, name: state.name } : null;
  }

  const state = US_STATES.find(
    (item) => item.name.toLowerCase() === normalized.toLowerCase()
  );
  return state ? { code: state.code, name: state.name } : null;
}

function specialtyForPracticeCategory(
  practiceCategory: string | null,
  existingSpecialty?: string
): Specialty {
  const mapped = mapPracticeCategory(practiceCategory);
  if (mapped) return mapped;

  if (existingSpecialty && isSpecialty(existingSpecialty)) {
    return existingSpecialty;
  }

  return "General Dentistry";
}

function mapPracticeCategory(practiceCategory: string | null): Specialty | null {
  switch (practiceCategory) {
    case "GENERAL_DENTISTRY":
      return "General Dentistry";
    case "ORTHODONTICS":
      return "Orthodontics";
    case "PEDIATRIC_DENTISTRY":
      return "Pediatric Dentistry";
    case "ENDODONTICS":
      return "Endodontics";
    case "PERIODONTICS":
      return "Periodontics";
    case "ORAL_SURGERY":
      return "Oral Surgery";
    case "PROSTHODONTICS":
      return "Prosthodontics";
    default:
      return null;
  }
}

function isSpecialty(value: string): value is Specialty {
  return [
    "General Dentistry",
    "Orthodontics",
    "Pediatric Dentistry",
    "Endodontics",
    "Periodontics",
    "Oral Surgery",
    "Prosthodontics",
    "Dental Public Health",
  ].includes(value);
}

function numericDefault(value: unknown, defaultValue: number): number {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return defaultValue;
}

function integerDefault(value: unknown, defaultValue: number): number {
  const numeric = numericDefault(value, defaultValue);
  return Number.isInteger(numeric) ? numeric : Math.trunc(numeric);
}

function booleanDefault(value: unknown, defaultValue: boolean): boolean {
  return typeof value === "boolean" ? value : defaultValue;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
