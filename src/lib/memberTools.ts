export type MemberTool = {
  slug: string;
  title: string;
  shortTitle: string;
  description: string;
};

export const MEMBER_TOOLS: MemberTool[] = [
  {
    slug: "overhead-percentage-calculator",
    title: "Overhead Percentage Calculator",
    shortTitle: "Overhead Percentage",
    description:
      "See your overhead as a percentage of collections and compare it against the ~60-65% industry benchmark.",
  },
  {
    slug: "case-acceptance-calculator",
    title: "Case Acceptance & Lost Treatment Value Calculator",
    shortTitle: "Case Acceptance",
    description:
      "Turn your treatment-plan acceptance rate into a dollar figure for the case value walking out the door unaccepted.",
  },
  {
    slug: "hygiene-production-calculator",
    title: "Hygiene Production Per Hour Calculator",
    shortTitle: "Hygiene Production",
    description:
      "Estimate production per hygienist hour and compare it to a target benchmark to spot scheduling or fee gaps.",
  },
  {
    slug: "new-patient-cac-calculator",
    title: "New Patient Acquisition Cost Calculator",
    shortTitle: "New Patient CAC",
    description:
      "Divide marketing spend by new patients gained, then compare it against average patient lifetime value.",
  },
  {
    slug: "staff-cost-ratio-calculator",
    title: "Staff Cost Ratio Calculator",
    shortTitle: "Staff Cost Ratio",
    description:
      "Check total payroll as a percentage of collections against the healthy 25-30% staffing benchmark.",
  },
  {
    slug: "equipment-roi-calculator",
    title: "Equipment ROI & Break-Even Calculator",
    shortTitle: "Equipment ROI",
    description:
      "Model the break-even timeline and 5-year return for a new piece of equipment before you buy it.",
  },
  {
    slug: "insurance-writeoff-calculator",
    title: "Insurance Write-Off Impact Calculator",
    shortTitle: "Insurance Write-Off",
    description:
      "See how much of your billed production gets written off across payer fee schedules, in dollars and percent.",
  },
];

export function getMemberTool(slug: string): MemberTool | undefined {
  return MEMBER_TOOLS.find((t) => t.slug === slug);
}
