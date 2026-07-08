export type StateHub = {
  state: string;
  code: string;
  cities: string[];
};

export const stateHubs: StateHub[] = [
  { state: "California", code: "CA", cities: ["Los Angeles", "San Diego", "San Jose", "San Francisco", "Sacramento"] },
  { state: "Texas", code: "TX", cities: ["Houston", "Dallas", "Austin", "San Antonio", "Fort Worth"] },
  { state: "Florida", code: "FL", cities: ["Miami", "Tampa", "Orlando", "Jacksonville", "Fort Lauderdale"] },
  { state: "New York", code: "NY", cities: ["New York", "Brooklyn", "Queens", "Bronx", "Long Island"] },
  { state: "Illinois", code: "IL", cities: ["Chicago", "Naperville", "Evanston", "Oak Park", "Schaumburg"] },
  { state: "Pennsylvania", code: "PA", cities: ["Philadelphia", "Pittsburgh", "Allentown", "Harrisburg", "Lancaster"] },
  { state: "Ohio", code: "OH", cities: ["Columbus", "Cleveland", "Cincinnati", "Toledo", "Akron"] },
  { state: "Georgia", code: "GA", cities: ["Atlanta", "Alpharetta", "Marietta", "Savannah", "Augusta"] },
  { state: "North Carolina", code: "NC", cities: ["Charlotte", "Raleigh", "Durham", "Cary", "Greensboro"] },
  { state: "Virginia", code: "VA", cities: ["Arlington", "Alexandria", "Fairfax", "Reston", "Leesburg"] },
  { state: "Maryland", code: "MD", cities: ["Bethesda", "Rockville", "Silver Spring", "Gaithersburg", "Bowie"] },
  { state: "District of Columbia", code: "DC", cities: ["Washington"] },
  { state: "Massachusetts", code: "MA", cities: ["Boston", "Cambridge", "Brookline", "Newton", "Worcester"] },
  { state: "New Jersey", code: "NJ", cities: ["Jersey City", "Newark", "Hoboken", "Edison", "Princeton"] },
  { state: "Washington", code: "WA", cities: ["Seattle", "Bellevue", "Redmond", "Tacoma", "Spokane"] },
  { state: "Oregon", code: "OR", cities: ["Portland", "Beaverton", "Gresham", "Eugene", "Salem"] },
  { state: "Arizona", code: "AZ", cities: ["Phoenix", "Tucson", "Scottsdale", "Mesa", "Chandler"] },
  { state: "Colorado", code: "CO", cities: ["Denver", "Boulder", "Aurora", "Colorado Springs", "Fort Collins"] },
  { state: "Nevada", code: "NV", cities: ["Las Vegas", "Henderson", "Reno", "North Las Vegas", "Summerlin"] },
  { state: "Tennessee", code: "TN", cities: ["Nashville", "Memphis", "Knoxville", "Chattanooga", "Franklin"] },
  { state: "Michigan", code: "MI", cities: ["Detroit", "Ann Arbor", "Troy", "Grand Rapids", "Lansing"] },
  { state: "Minnesota", code: "MN", cities: ["Minneapolis", "St. Paul", "Edina", "Bloomington", "Maple Grove"] },
  { state: "Wisconsin", code: "WI", cities: ["Milwaukee", "Madison", "Green Bay", "Wauwatosa", "Kenosha"] },
  { state: "Missouri", code: "MO", cities: ["Kansas City", "St. Louis", "Springfield", "Columbia", "Independence"] },
  { state: "Indiana", code: "IN", cities: ["Indianapolis", "Carmel", "Fishers", "Fort Wayne", "Bloomington"] },
  { state: "Louisiana", code: "LA", cities: ["New Orleans", "Baton Rouge", "Metairie", "Lafayette", "Shreveport"] },
  { state: "Alabama", code: "AL", cities: ["Birmingham", "Hoover", "Mobile", "Montgomery", "Huntsville"] },
  { state: "Oklahoma", code: "OK", cities: ["Oklahoma City", "Tulsa", "Norman", "Edmond", "Moore"] },
  { state: "Nebraska", code: "NE", cities: ["Omaha", "Lincoln", "Bellevue", "Papillion", "Elkhorn"] },
  { state: "Utah", code: "UT", cities: ["Salt Lake City", "Sandy", "Draper", "South Jordan", "Provo"] },
];

export function slugifyHub(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/\+/g, " ")
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}
