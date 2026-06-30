export type DmvLandingPage = {
  slug: string;
  city: string;
  state: string;
  stateCode: string;
  listingHref: string;
  claimHref: string;
  title: string;
  metaDescription: string;
  intro: string;
  patientNeeds: string[];
  neighborhoods: string[];
  services: string[];
  emergencyNote: string;
};

export const dmvLandingPages: DmvLandingPage[] = [
  {
    slug: "washington-dc",
    city: "Washington",
    state: "District of Columbia",
    stateCode: "DC",
    listingHref: "/dentists/district-of-columbia/washington",
    claimHref: "/claim?city=Washington%2C%20DC&source=dmv-claim-campaign",
    title: "Find Dentists in Washington, DC",
    metaDescription:
      "Compare Washington, DC dentists for cleanings, emergencies, implants, Invisalign, and family care. Search local listings and claim your practice.",
    intro:
      "Washington, DC patients often compare dentists by neighborhood, appointment availability, insurance fit, emergency access, and specialty services. This local hub helps patients start with a focused DC directory instead of a broad national search.",
    patientNeeds: [
      "After-work and early morning dental appointments near downtown offices",
      "Emergency dental care for tooth pain, swelling, broken teeth, and lost crowns",
      "Family dental offices that serve adults, teens, and children in one place",
      "Cosmetic and restorative options such as whitening, veneers, crowns, implants, and Invisalign",
    ],
    neighborhoods: ["Capitol Hill", "Dupont Circle", "Georgetown", "Navy Yard", "Petworth", "Tenleytown"],
    services: ["Dental cleaning", "Emergency dentist", "Dental implants", "Cosmetic dentistry", "Invisalign", "Family dentist"],
    emergencyNote:
      "For urgent tooth pain, swelling, trauma, or a broken tooth, call a local dental office directly and ask whether same-day emergency time is available.",
  },
  {
    slug: "arlington-va",
    city: "Arlington",
    state: "Virginia",
    stateCode: "VA",
    listingHref: "/dentists/virginia/arlington",
    claimHref: "/claim?city=Arlington%2C%20VA&source=dmv-claim-campaign",
    title: "Find Dentists in Arlington, VA",
    metaDescription:
      "Search Arlington, VA dentists for family dental care, emergency appointments, implants, cleanings, and cosmetic dentistry. Claim your listing.",
    intro:
      "Arlington dental searches are highly local. Patients may prefer a dentist near Metro corridors, office districts, schools, or residential neighborhoods. This hub connects Arlington patients with relevant local dentist listings.",
    patientNeeds: [
      "Convenient offices near Ballston, Clarendon, Rosslyn, Crystal City, and Pentagon City",
      "Same-day help for toothaches, chipped teeth, infections, and dental injuries",
      "Preventive care for busy professionals and families balancing work, school, and commuting",
      "Clear treatment options for implants, crowns, aligners, veneers, and whitening",
    ],
    neighborhoods: ["Ballston", "Clarendon", "Rosslyn", "Crystal City", "Pentagon City", "Shirlington"],
    services: ["Family dentist", "Emergency dentist", "Teeth cleaning", "Dental implants", "Veneers", "Clear aligners"],
    emergencyNote:
      "If a dental emergency happens in Arlington, describe your symptoms clearly when calling so the practice can triage pain, swelling, trauma, or infection risk.",
  },
  {
    slug: "alexandria-va",
    city: "Alexandria",
    state: "Virginia",
    stateCode: "VA",
    listingHref: "/dentists/virginia/alexandria",
    claimHref: "/claim?city=Alexandria%2C%20VA&source=dmv-claim-campaign",
    title: "Find Dentists in Alexandria, VA",
    metaDescription:
      "Find Alexandria, VA dentists for dental cleanings, urgent dental care, implants, pediatric dentistry, and cosmetic treatment. Claim a practice listing.",
    intro:
      "Alexandria patients often compare dentists across Old Town, Del Ray, West End, and nearby Fairfax County communities. This page gives patients and dental practices a local entry point into the directory.",
    patientNeeds: [
      "Dental offices near Old Town, Del Ray, Landmark, Eisenhower, and Kingstowne",
      "Pediatric and family dental care for households that want one trusted office",
      "Urgent appointments for broken teeth, painful gums, loose fillings, and swelling",
      "Restorative and cosmetic options including implants, crowns, bonding, veneers, and whitening",
    ],
    neighborhoods: ["Old Town", "Del Ray", "West End", "Eisenhower", "Landmark", "Kingstowne"],
    services: ["Kids dentist", "Dental check-up", "Emergency dental care", "Dental implants", "Teeth whitening", "Crowns"],
    emergencyNote:
      "Dental pain can move quickly from uncomfortable to serious. Call a local Alexandria dentist if pain lasts, swelling appears, or chewing becomes difficult.",
  },
  {
    slug: "fairfax-va",
    city: "Fairfax",
    state: "Virginia",
    stateCode: "VA",
    listingHref: "/dentists/virginia/fairfax",
    claimHref: "/claim?city=Fairfax%2C%20VA&source=dmv-claim-campaign",
    title: "Find Dentists in Fairfax, VA",
    metaDescription:
      "Browse Fairfax, VA dentists for family care, emergency dentistry, implants, orthodontics, pediatric visits, and cosmetic services.",
    intro:
      "Fairfax is a major Northern Virginia dental market with families, commuters, students, and professionals searching for reliable care. This local hub helps patients compare dentists by city, service, and need.",
    patientNeeds: [
      "Family and preventive dentistry close to schools, offices, and commuter routes",
      "Emergency appointments for tooth pain, chipped teeth, swelling, or lost restorations",
      "Specialty and advanced care such as implants, oral surgery referrals, Invisalign, and pediatric dentistry",
      "Transparent practice information before patients decide who to call",
    ],
    neighborhoods: ["Fairfax City", "Fair Oaks", "Merrifield", "Oakton", "Burke", "Mantua"],
    services: ["Family dentist", "Pediatric dentist", "Dental implants", "Invisalign", "Emergency dentist", "Dental exam"],
    emergencyNote:
      "For dental trauma, save any broken tooth fragments if possible, avoid chewing on the affected side, and contact a Fairfax dental office promptly.",
  },
  {
    slug: "bethesda-md",
    city: "Bethesda",
    state: "Maryland",
    stateCode: "MD",
    listingHref: "/dentists/maryland/bethesda",
    claimHref: "/claim?city=Bethesda%2C%20MD&source=dmv-claim-campaign",
    title: "Find Dentists in Bethesda, MD",
    metaDescription:
      "Search Bethesda, MD dentists for preventive, cosmetic, implant, emergency, pediatric, and Invisalign care. Dentists can claim listings.",
    intro:
      "Bethesda patients often look for high-trust dental offices with convenient scheduling, clear communication, and advanced treatment options. This hub organizes local discovery for patients and practice owners.",
    patientNeeds: [
      "Preventive dental care near downtown Bethesda, NIH, Walter Reed, and nearby neighborhoods",
      "Cosmetic services such as whitening, porcelain veneers, bonding, and smile makeovers",
      "Dental implant consultations, crowns, bridges, and restorative treatment planning",
      "Urgent appointments when pain, swelling, or a broken tooth cannot wait",
    ],
    neighborhoods: ["Downtown Bethesda", "Woodmont Triangle", "Battery Park", "Chevy Chase", "Glen Echo", "North Bethesda"],
    services: ["Cosmetic dentist", "Dental implants", "Teeth cleaning", "Emergency dentist", "Veneers", "Invisalign"],
    emergencyNote:
      "Bethesda patients with facial swelling, fever, or severe dental pain should seek urgent evaluation instead of waiting for a routine cleaning slot.",
  },
  {
    slug: "rockville-md",
    city: "Rockville",
    state: "Maryland",
    stateCode: "MD",
    listingHref: "/dentists/maryland/rockville",
    claimHref: "/claim?city=Rockville%2C%20MD&source=dmv-claim-campaign",
    title: "Find Dentists in Rockville, MD",
    metaDescription:
      "Find Rockville, MD dentists for cleanings, emergency care, implants, braces, pediatric dentistry, and family dental visits.",
    intro:
      "Rockville is a strong dental market for families, professionals, and seniors across Montgomery County. This hub helps patients compare local dental options and helps practices claim accurate listings.",
    patientNeeds: [
      "Family dentistry near Rockville Town Center, Twinbrook, King Farm, and North Bethesda",
      "Emergency care for toothaches, cracked teeth, gum swelling, and lost fillings",
      "Implants, dentures, crowns, bridges, and restorative options for missing or damaged teeth",
      "Children's dentistry, orthodontic evaluations, and preventive hygiene visits",
    ],
    neighborhoods: ["Town Center", "Twinbrook", "King Farm", "West End", "Fallsgrove", "Derwood"],
    services: ["Family dentist", "Kids dentist", "Dental implants", "Dentures", "Emergency dentist", "Braces"],
    emergencyNote:
      "When calling a Rockville dental office for urgent care, mention pain level, swelling, injury timing, and whether you have a fever or trouble swallowing.",
  },
  {
    slug: "silver-spring-md",
    city: "Silver Spring",
    state: "Maryland",
    stateCode: "MD",
    listingHref: "/dentists/maryland/silver-spring",
    claimHref: "/claim?city=Silver%20Spring%2C%20MD&source=dmv-claim-campaign",
    title: "Find Dentists in Silver Spring, MD",
    metaDescription:
      "Compare Silver Spring, MD dentists for emergency dental care, cleanings, family dentistry, implants, pediatric visits, and cosmetic services.",
    intro:
      "Silver Spring patients search across a wide set of neighborhoods and needs, from family dental visits to urgent tooth pain and cosmetic consultations. This hub creates a focused local path into the directory.",
    patientNeeds: [
      "Accessible dental offices near Downtown Silver Spring, Four Corners, Wheaton, and Takoma Park",
      "Emergency appointments for broken teeth, swelling, abscess symptoms, and severe toothaches",
      "Family care, pediatric dental visits, cleanings, sealants, and preventive check-ups",
      "Cosmetic and restorative options including bonding, whitening, crowns, implants, and dentures",
    ],
    neighborhoods: ["Downtown Silver Spring", "Four Corners", "Wheaton", "Takoma Park", "Forest Glen", "Kemp Mill"],
    services: ["Emergency dental care", "Family dentist", "Pediatric dentist", "Dental cleaning", "Dental implants", "Tooth bonding"],
    emergencyNote:
      "For Silver Spring dental emergencies, do not rely on pain medicine alone if swelling, fever, trauma, or uncontrolled bleeding is present.",
  },
];

export function getDmvLandingPage(slug: string): DmvLandingPage | undefined {
  return dmvLandingPages.find((page) => page.slug === slug);
}
