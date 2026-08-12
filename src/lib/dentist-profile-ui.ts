import { type Dentist } from "./dentists";
import { type Review } from "./reviews";

export function validNpi(value: string): string | undefined {
  return /^\d{10}$/.test(value) ? value : undefined;
}

export function providerIdentityForDentist(dentist: Dentist): {
  npi?: string;
  label: "NPI Number" | "Directory Listing ID";
  value: string;
  npiVerified: boolean;
} {
  const npi = validNpi(dentist.id);
  if (npi) {
    return {
      npi,
      label: "NPI Number",
      value: npi,
      npiVerified: true,
    };
  }

  return {
    label: "Directory Listing ID",
    value: dentist.id,
    npiVerified: false,
  };
}

export function profileAboutText(dentist: Dentist): string {
  if (dentist.bio) return dentist.bio;

  const experience =
    dentist.yearsExperience > 0 ? ` Practicing for over ${dentist.yearsExperience} years.` : "";
  const base = `${dentist.name}${dentist.credentials ? `, ${dentist.credentials}` : ""} is a ${dentist.specialty.toLowerCase()} provider based in ${dentist.address.city}, ${dentist.address.stateCode}.${experience}`;

  if (validNpi(dentist.id)) {
    return `${base} Verified through the National Provider Identifier (NPI) registry.`;
  }

  return base;
}

export function hasReviewAggregate(dentist: Dentist): boolean {
  return dentist.reviewCount > 0 && dentist.rating > 0;
}

export function visibleProfileReviews(dentist: Dentist, reviews: Review[]): Review[] {
  if (dentist.reviewCount <= 0) return [];
  return reviews.slice(0, dentist.reviewCount);
}
