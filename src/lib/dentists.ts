/**
 * Types and static metadata for dentist listings.
 * Safe to import from both server and client components.
 *
 * Runtime data (search, pagination, profile lookup) lives in `./dentists-data.ts`
 * which is server-only because it reads the JSON dataset from disk.
 */

export type Specialty =
  | "General Dentistry"
  | "Orthodontics"
  | "Pediatric Dentistry"
  | "Endodontics"
  | "Periodontics"
  | "Oral Surgery"
  | "Prosthodontics"
  | "Dental Public Health";

export type Dentist = {
  id: string;
  slug: string;
  name: string;
  credentials: string;
  specialty: Specialty;
  practiceName: string;
  address: {
    street: string;
    city: string;
    state: string;
    stateCode: string;
    zip: string;
  };
  phone: string;
  email: string;
  website: string;
  rating: number;
  reviewCount: number;
  acceptingNewPatients: boolean;
  yearsExperience: number;
  bio: string;
  education: string[];
  languages: string[];
  insurance: string[];
  hours: { day: string; hours: string }[];
};

export const allSpecialties: Specialty[] = [
  "General Dentistry",
  "Orthodontics",
  "Pediatric Dentistry",
  "Endodontics",
  "Periodontics",
  "Oral Surgery",
  "Prosthodontics",
  "Dental Public Health",
];

export const US_STATES: { code: string; name: string }[] = [
  { code: "AL", name: "Alabama" },
  { code: "AK", name: "Alaska" },
  { code: "AZ", name: "Arizona" },
  { code: "AR", name: "Arkansas" },
  { code: "CA", name: "California" },
  { code: "CO", name: "Colorado" },
  { code: "CT", name: "Connecticut" },
  { code: "DE", name: "Delaware" },
  { code: "DC", name: "District of Columbia" },
  { code: "FL", name: "Florida" },
  { code: "GA", name: "Georgia" },
  { code: "HI", name: "Hawaii" },
  { code: "ID", name: "Idaho" },
  { code: "IL", name: "Illinois" },
  { code: "IN", name: "Indiana" },
  { code: "IA", name: "Iowa" },
  { code: "KS", name: "Kansas" },
  { code: "KY", name: "Kentucky" },
  { code: "LA", name: "Louisiana" },
  { code: "ME", name: "Maine" },
  { code: "MD", name: "Maryland" },
  { code: "MA", name: "Massachusetts" },
  { code: "MI", name: "Michigan" },
  { code: "MN", name: "Minnesota" },
  { code: "MS", name: "Mississippi" },
  { code: "MO", name: "Missouri" },
  { code: "MT", name: "Montana" },
  { code: "NE", name: "Nebraska" },
  { code: "NV", name: "Nevada" },
  { code: "NH", name: "New Hampshire" },
  { code: "NJ", name: "New Jersey" },
  { code: "NM", name: "New Mexico" },
  { code: "NY", name: "New York" },
  { code: "NC", name: "North Carolina" },
  { code: "ND", name: "North Dakota" },
  { code: "OH", name: "Ohio" },
  { code: "OK", name: "Oklahoma" },
  { code: "OR", name: "Oregon" },
  { code: "PA", name: "Pennsylvania" },
  { code: "RI", name: "Rhode Island" },
  { code: "SC", name: "South Carolina" },
  { code: "SD", name: "South Dakota" },
  { code: "TN", name: "Tennessee" },
  { code: "TX", name: "Texas" },
  { code: "UT", name: "Utah" },
  { code: "VT", name: "Vermont" },
  { code: "VA", name: "Virginia" },
  { code: "WA", name: "Washington" },
  { code: "WV", name: "West Virginia" },
  { code: "WI", name: "Wisconsin" },
  { code: "WY", name: "Wyoming" },
];

const STATE_NAME_BY_CODE = new Map(US_STATES.map((s) => [s.code, s.name]));

export function stateNameByCode(code: string): string {
  return STATE_NAME_BY_CODE.get(code.toUpperCase()) ?? code;
}
