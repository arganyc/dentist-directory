import { slugify, stateNameByCode, US_STATES } from "./dentists";

export function codeFromDentistsPathParam(stateParam: string): string | undefined {
  const param = stateParam.trim();
  if (!param) return undefined;
  if (param.length === 2) {
    const code = param.toUpperCase();
    return US_STATES.some((s) => s.code === code) ? code : undefined;
  }
  const normalized = param.replace(/-/g, " ").toLowerCase();
  const found = US_STATES.find((s) => s.name.toLowerCase() === normalized);
  return found?.code;
}

export function stateSlugFromDentistsCode(code: string): string {
  return slugify(stateNameByCode(code));
}

export function stateListingPathForDentistsSegment(segment: string): string | undefined {
  const stateCode = codeFromDentistsPathParam(segment);
  if (!stateCode) return undefined;
  return `/dentists/state/${stateSlugFromDentistsCode(stateCode)}`;
}
