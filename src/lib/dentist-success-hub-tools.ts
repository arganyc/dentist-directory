export const DENTIST_SUCCESS_HUB_TOOL_TYPES = [
  "calculator",
  "audit",
  "generator",
  "assistant",
  "report",
  "workflow",
] as const;

export const DENTIST_SUCCESS_HUB_TOOL_STATUSES = [
  "active",
  "coming-soon",
  "beta",
  "premium",
] as const;

export const DENTIST_SUCCESS_HUB_CATEGORIES = [
  "Marketing",
  "Financial",
  "Operations",
  "AI",
  "Profile & Visibility",
  "Resources",
] as const;

export type DentistSuccessHubToolType = (typeof DENTIST_SUCCESS_HUB_TOOL_TYPES)[number];
export type DentistSuccessHubToolStatus = (typeof DENTIST_SUCCESS_HUB_TOOL_STATUSES)[number];
export type DentistSuccessHubCategory = (typeof DENTIST_SUCCESS_HUB_CATEGORIES)[number];

export type DentistSuccessHubTool = {
  slug: string;
  title: string;
  shortDescription: string;
  category: DentistSuccessHubCategory;
  toolType: DentistSuccessHubToolType;
  status: DentistSuccessHubToolStatus;
  estimatedTime: string;
  icon: string;
  badge: string;
  seoTitle: string;
  seoDescription: string;
  keywords: string[];
  relatedTools: string[];
};

export type ToolRegistryValidationResult = {
  valid: boolean;
  errors: string[];
};

export type DentistSuccessHubCategorySummary = {
  name: DentistSuccessHubCategory;
  description: string;
  href: string;
  anchor: string;
  icon: string;
  count: number;
};

export type DentistSuccessHubToolCardView = {
  title: string;
  description: string;
  href: string;
  eyebrow: string;
  badge: string;
  footer: string;
};

export type DentistSuccessHubToolSearchFilters = {
  query?: string;
  category?: string;
  status?: string;
  toolType?: string;
  estimatedTime?: string;
};

export const DENTIST_SUCCESS_HUB_FEATURED_TOOL_SLUGS = [
  "no-show-cost-calculator",
  "new-patient-lifetime-value",
  "daily-production-goal-calculator",
  "chair-utilization-calculator",
  "marketing-roi-calculator",
  "google-business-profile-audit",
  "local-seo-audit",
  "practice-profile-score",
  "ai-practice-description-generator",
  "google-review-analyzer",
] as const;

const DENTIST_SUCCESS_HUB_CATEGORY_DETAILS: Record<
  DentistSuccessHubCategory,
  { description: string; icon: string }
> = {
  Marketing: {
    description: "Plan patient acquisition, local search visibility, campaigns, and review growth.",
    icon: "target",
  },
  Financial: {
    description: "Model production, collections, patient value, margins, and long-term practice economics.",
    icon: "wallet",
  },
  Operations: {
    description: "Evaluate capacity, scheduling, recall, no-shows, and operatory performance.",
    icon: "flow",
  },
  AI: {
    description: "Preview future AI workflows for dental content, communication, and office productivity.",
    icon: "spark",
  },
  "Profile & Visibility": {
    description: "Improve directory accuracy, completeness, trust signals, and listing ownership.",
    icon: "profile",
  },
  Resources: {
    description: "Use practical analysis tools and guidance built for dental teams.",
    icon: "book",
  },
};

const DENTIST_SUCCESS_HUB_STATUS_LABELS: Record<DentistSuccessHubToolStatus, string> = {
  active: "Active",
  beta: "Beta",
  "coming-soon": "Coming Soon",
  premium: "Premium",
};

export const DENTIST_SUCCESS_HUB_TOOLS = [
  {
    slug: "local-seo-audit",
    title: "Local SEO Audit",
    shortDescription: "Identify local search gaps across profile content, location signals, and service pages.",
    category: "Marketing",
    toolType: "audit",
    status: "coming-soon",
    estimatedTime: "6 min",
    icon: "search",
    badge: "SEO",
    seoTitle: "Local SEO Audit for Dental Practices",
    seoDescription:
      "Audit your dental practice's local SEO visibility and find practical improvements for patient search demand.",
    keywords: ["dental SEO", "local SEO", "dentist marketing", "Google rankings"],
    relatedTools: ["google-business-profile-audit", "practice-profile-score"],
  },
  {
    slug: "google-business-profile-audit",
    title: "Google Business Profile Audit",
    shortDescription: "Review the public signals patients see before choosing a dental office.",
    category: "Marketing",
    toolType: "audit",
    status: "coming-soon",
    estimatedTime: "6 min",
    icon: "map-pin",
    badge: "Local",
    seoTitle: "Google Business Profile Audit for Dentists",
    seoDescription:
      "Check your dental practice's Google Business Profile for missing fields, weak signals, and visibility opportunities.",
    keywords: ["Google Business Profile", "dentist GBP", "local dental marketing"],
    relatedTools: ["local-seo-audit", "listing-audit"],
  },
  {
    slug: "website-audit",
    title: "Website Audit",
    shortDescription: "Spot trust, conversion, speed, and content gaps on your practice website.",
    category: "Marketing",
    toolType: "audit",
    status: "coming-soon",
    estimatedTime: "7 min",
    icon: "browser",
    badge: "Website",
    seoTitle: "Dental Website Audit Tool",
    seoDescription:
      "Audit a dental website for patient conversion, local trust, content completeness, and performance basics.",
    keywords: ["dental website audit", "dentist website", "practice website"],
    relatedTools: ["marketing-roi-calculator", "local-seo-audit"],
  },
  {
    slug: "marketing-roi-calculator",
    title: "Marketing ROI Calculator",
    shortDescription: "Compare ad spend, leads, booked visits, and production by channel.",
    category: "Marketing",
    toolType: "calculator",
    status: "coming-soon",
    estimatedTime: "5 min",
    icon: "target",
    badge: "ROI",
    seoTitle: "Dental Marketing ROI Calculator",
    seoDescription:
      "Calculate dental marketing ROI from spend, leads, appointments, and new patient value.",
    keywords: ["dental marketing ROI", "practice marketing", "patient acquisition"],
    relatedTools: ["patient-acquisition-cost-calculator", "new-patient-lifetime-value"],
  },
  {
    slug: "patient-acquisition-cost-calculator",
    title: "Patient Acquisition Cost Calculator",
    shortDescription: "Find the real cost to acquire a booked new patient from each channel.",
    category: "Marketing",
    toolType: "calculator",
    status: "active",
    estimatedTime: "4 min",
    icon: "user-plus",
    badge: "CAC",
    seoTitle: "Dental Patient Acquisition Cost Calculator",
    seoDescription:
      "Estimate new patient acquisition cost for a dental practice across ads, referrals, and local search.",
    keywords: ["patient acquisition cost", "dental CAC", "new patients"],
    relatedTools: ["marketing-roi-calculator", "new-patient-lifetime-value"],
  },
  {
    slug: "review-growth-calculator",
    title: "Review Growth Calculator",
    shortDescription: "Model review targets and request volume needed to strengthen online trust.",
    category: "Marketing",
    toolType: "calculator",
    status: "coming-soon",
    estimatedTime: "4 min",
    icon: "star",
    badge: "Reviews",
    seoTitle: "Dental Review Growth Calculator",
    seoDescription:
      "Plan review growth for a dental practice and estimate how many review requests are needed.",
    keywords: ["dental reviews", "review growth", "Google reviews"],
    relatedTools: ["google-review-analyzer", "google-business-profile-audit"],
  },
  {
    slug: "new-patient-lifetime-value",
    title: "New Patient Lifetime Value",
    shortDescription: "Estimate the long-term production value of each new patient relationship.",
    category: "Financial",
    toolType: "calculator",
    status: "coming-soon",
    estimatedTime: "4 min",
    icon: "wallet",
    badge: "LTV",
    seoTitle: "Dental New Patient Lifetime Value Calculator",
    seoDescription:
      "Calculate the estimated lifetime value of a new dental patient for growth planning.",
    keywords: ["patient lifetime value", "dental LTV", "practice growth"],
    relatedTools: ["patient-acquisition-cost-calculator", "marketing-roi-calculator"],
  },
  {
    slug: "daily-production-goal-calculator",
    title: "Daily Production Goal Calculator",
    shortDescription: "Set daily production goals by schedule, provider mix, and target revenue.",
    category: "Financial",
    toolType: "calculator",
    status: "coming-soon",
    estimatedTime: "3 min",
    icon: "calendar",
    badge: "Goals",
    seoTitle: "Dental Daily Production Goal Calculator",
    seoDescription:
      "Set daily dental practice production goals based on monthly targets and working days.",
    keywords: ["daily production goal", "dental production", "practice goals"],
    relatedTools: ["monthly-production-goal-calculator", "production-per-chair-calculator"],
  },
  {
    slug: "monthly-production-goal-calculator",
    title: "Monthly Production Goal Calculator",
    shortDescription: "Translate annual growth goals into realistic monthly production targets.",
    category: "Financial",
    toolType: "calculator",
    status: "coming-soon",
    estimatedTime: "3 min",
    icon: "bar-chart",
    badge: "Goals",
    seoTitle: "Dental Monthly Production Goal Calculator",
    seoDescription:
      "Plan monthly production goals for a dental practice from annual revenue targets.",
    keywords: ["monthly production goal", "dental revenue", "practice production"],
    relatedTools: ["daily-production-goal-calculator", "break-even-calculator"],
  },
  {
    slug: "case-acceptance-calculator",
    title: "Case Acceptance Calculator",
    shortDescription: "Estimate accepted production, missed treatment value, and target-rate upside.",
    category: "Financial",
    toolType: "calculator",
    status: "active",
    estimatedTime: "4 min",
    icon: "check-circle",
    badge: "Case Acceptance",
    seoTitle: "Dental Case Acceptance Calculator",
    seoDescription:
      "Calculate dental case acceptance, accepted production, missed treatment value, and annual improvement opportunity.",
    keywords: ["case acceptance", "treatment plans", "dental production", "accepted treatment"],
    relatedTools: [
      "monthly-production-goal-calculator",
      "patient-acquisition-cost-calculator",
      "overhead-percentage-calculator",
    ],
  },
  {
    slug: "break-even-calculator",
    title: "Break-Even Calculator",
    shortDescription: "Estimate the production needed to cover fixed and variable practice costs.",
    category: "Financial",
    toolType: "calculator",
    status: "coming-soon",
    estimatedTime: "5 min",
    icon: "scale",
    badge: "Finance",
    seoTitle: "Dental Practice Break-Even Calculator",
    seoDescription:
      "Estimate monthly break-even production for a dental office based on overhead and collections.",
    keywords: ["dental break even", "practice overhead", "production planning"],
    relatedTools: ["collections-rate-calculator", "monthly-production-goal-calculator"],
  },
  {
    slug: "overhead-percentage-calculator",
    title: "Overhead Percentage Calculator",
    shortDescription: "Estimate operating overhead as a share of monthly collections.",
    category: "Financial",
    toolType: "calculator",
    status: "active",
    estimatedTime: "4 min",
    icon: "pie-chart",
    badge: "Overhead",
    seoTitle: "Dental Overhead Percentage Calculator",
    seoDescription:
      "Calculate dental practice overhead percentage, operating income, annualized overhead, and benchmark status.",
    keywords: ["dental overhead", "practice overhead", "operating margin", "collections"],
    relatedTools: ["break-even-calculator", "collections-rate-calculator", "ppo-fee-reduction-calculator"],
  },
  {
    slug: "dental-implant-profit-calculator",
    title: "Dental Implant Profit Calculator",
    shortDescription: "Model implant case revenue, costs, chair time, and contribution margin.",
    category: "Financial",
    toolType: "calculator",
    status: "coming-soon",
    estimatedTime: "6 min",
    icon: "tooth",
    badge: "Implants",
    seoTitle: "Dental Implant Profit Calculator",
    seoDescription:
      "Calculate estimated dental implant case profitability from fees, lab costs, parts, and chair time.",
    keywords: ["implant profit", "dental implants", "case profitability"],
    relatedTools: ["new-patient-lifetime-value", "production-per-chair-calculator"],
  },
  {
    slug: "ppo-fee-reduction-calculator",
    title: "PPO Fee Reduction Calculator",
    shortDescription: "Estimate how PPO write-offs affect production, collections, and margin.",
    category: "Financial",
    toolType: "calculator",
    status: "active",
    estimatedTime: "5 min",
    icon: "percent",
    badge: "PPO",
    seoTitle: "Dental PPO Fee Reduction Calculator",
    seoDescription:
      "Estimate the financial impact of PPO fee reductions and write-offs in a dental practice.",
    keywords: ["PPO write-off", "dental fees", "insurance adjustment"],
    relatedTools: ["collections-rate-calculator", "break-even-calculator"],
  },
  {
    slug: "collections-rate-calculator",
    title: "Collections Rate Calculator",
    shortDescription: "Measure how much produced dentistry is actually collected.",
    category: "Financial",
    toolType: "calculator",
    status: "coming-soon",
    estimatedTime: "3 min",
    icon: "receipt",
    badge: "Collections",
    seoTitle: "Dental Collections Rate Calculator",
    seoDescription:
      "Calculate collections rate for a dental practice and identify collection performance gaps.",
    keywords: ["collections rate", "dental collections", "practice cash flow"],
    relatedTools: ["break-even-calculator", "ppo-fee-reduction-calculator"],
  },
  {
    slug: "practice-valuation-estimator",
    title: "Practice Valuation Estimator",
    shortDescription: "Create a rough planning estimate using production, profit, and risk signals.",
    category: "Financial",
    toolType: "report",
    status: "premium",
    estimatedTime: "8 min",
    icon: "briefcase",
    badge: "Premium",
    seoTitle: "Dental Practice Valuation Estimator",
    seoDescription:
      "Estimate dental practice valuation ranges for planning using revenue and profitability inputs.",
    keywords: ["dental practice valuation", "practice value", "EBITDA"],
    relatedTools: ["break-even-calculator", "monthly-production-goal-calculator"],
  },
  {
    slug: "no-show-cost-calculator",
    title: "No-Show Cost Calculator",
    shortDescription: "Estimate monthly and annual production lost to broken appointments.",
    category: "Operations",
    toolType: "calculator",
    status: "active",
    estimatedTime: "3 min",
    icon: "calendar-x",
    badge: "Active",
    seoTitle: "Dental No-Show Cost Calculator",
    seoDescription:
      "Calculate the cost of dental no-shows and cancellations for your practice.",
    keywords: ["dental no show", "cancellation cost", "lost production"],
    relatedTools: ["scheduling-efficiency-calculator", "appointment-capacity-calculator"],
  },
  {
    slug: "chair-utilization-calculator",
    title: "Chair Utilization Calculator",
    shortDescription: "See how effectively operatories are converted into productive time.",
    category: "Operations",
    toolType: "calculator",
    status: "coming-soon",
    estimatedTime: "4 min",
    icon: "activity",
    badge: "Capacity",
    seoTitle: "Dental Chair Utilization Calculator",
    seoDescription:
      "Calculate dental chair utilization and identify unused production capacity.",
    keywords: ["chair utilization", "dental operations", "operatories"],
    relatedTools: ["production-per-chair-calculator", "appointment-capacity-calculator"],
  },
  {
    slug: "recall-revenue-calculator",
    title: "Recall Revenue Calculator",
    shortDescription: "Estimate the revenue opportunity hidden in overdue hygiene recall.",
    category: "Operations",
    toolType: "calculator",
    status: "coming-soon",
    estimatedTime: "4 min",
    icon: "refresh",
    badge: "Recall",
    seoTitle: "Dental Recall Revenue Calculator",
    seoDescription:
      "Estimate dental recall revenue from overdue hygiene patients and reactivation campaigns.",
    keywords: ["dental recall", "hygiene recall", "patient reactivation"],
    relatedTools: ["hygiene-capacity-calculator", "ai-recall-campaign-writer"],
  },
  {
    slug: "hygiene-capacity-calculator",
    title: "Hygiene Capacity Calculator",
    shortDescription: "Model available hygiene time, recall demand, and growth constraints.",
    category: "Operations",
    toolType: "calculator",
    status: "coming-soon",
    estimatedTime: "5 min",
    icon: "clock",
    badge: "Hygiene",
    seoTitle: "Dental Hygiene Capacity Calculator",
    seoDescription:
      "Estimate dental hygiene capacity and whether your schedule can support recall demand.",
    keywords: ["hygiene capacity", "dental hygiene", "recall schedule"],
    relatedTools: ["recall-revenue-calculator", "chair-utilization-calculator"],
  },
  {
    slug: "scheduling-efficiency-calculator",
    title: "Scheduling Efficiency Calculator",
    shortDescription: "Review how schedule gaps and appointment mix affect production.",
    category: "Operations",
    toolType: "calculator",
    status: "coming-soon",
    estimatedTime: "5 min",
    icon: "grid",
    badge: "Schedule",
    seoTitle: "Dental Scheduling Efficiency Calculator",
    seoDescription:
      "Measure scheduling efficiency for a dental practice and identify appointment capacity leaks.",
    keywords: ["dental scheduling", "schedule efficiency", "appointment gaps"],
    relatedTools: ["no-show-cost-calculator", "appointment-capacity-calculator"],
  },
  {
    slug: "production-per-chair-calculator",
    title: "Production Per Chair Calculator",
    shortDescription: "Compare production against available operatory capacity.",
    category: "Operations",
    toolType: "calculator",
    status: "coming-soon",
    estimatedTime: "4 min",
    icon: "bar-chart",
    badge: "Production",
    seoTitle: "Dental Production Per Chair Calculator",
    seoDescription:
      "Calculate production per chair and evaluate dental operatory performance.",
    keywords: ["production per chair", "dental production", "chair capacity"],
    relatedTools: ["chair-utilization-calculator", "daily-production-goal-calculator"],
  },
  {
    slug: "appointment-capacity-calculator",
    title: "Appointment Capacity Calculator",
    shortDescription: "Estimate how many visits your team can realistically schedule and serve.",
    category: "Operations",
    toolType: "calculator",
    status: "coming-soon",
    estimatedTime: "4 min",
    icon: "calendar",
    badge: "Capacity",
    seoTitle: "Dental Appointment Capacity Calculator",
    seoDescription:
      "Estimate weekly and monthly appointment capacity for a dental practice.",
    keywords: ["appointment capacity", "dental scheduling", "practice capacity"],
    relatedTools: ["chair-utilization-calculator", "scheduling-efficiency-calculator"],
  },
  {
    slug: "ai-practice-description-generator",
    title: "AI Practice Description Generator",
    shortDescription: "Draft patient-friendly practice copy for profiles, websites, and directories.",
    category: "AI",
    toolType: "generator",
    status: "coming-soon",
    estimatedTime: "2 min",
    icon: "spark",
    badge: "AI",
    seoTitle: "AI Dental Practice Description Generator",
    seoDescription:
      "Generate a polished dental practice description for patient-facing listings and websites.",
    keywords: ["AI dental description", "practice description", "dental marketing copy"],
    relatedTools: ["practice-profile-score", "listing-audit"],
  },
  {
    slug: "ai-google-business-post-generator",
    title: "AI Google Business Post Generator",
    shortDescription: "Prepare local Google Business posts for offers, updates, and services.",
    category: "AI",
    toolType: "generator",
    status: "coming-soon",
    estimatedTime: "3 min",
    icon: "message",
    badge: "AI",
    seoTitle: "AI Google Business Post Generator for Dentists",
    seoDescription:
      "Generate Google Business Profile post drafts for dental practices.",
    keywords: ["Google Business post", "AI dental marketing", "GBP posts"],
    relatedTools: ["google-business-profile-audit", "ai-social-media-generator"],
  },
  {
    slug: "ai-social-media-generator",
    title: "AI Social Media Generator",
    shortDescription: "Create social post drafts for patient education and practice updates.",
    category: "AI",
    toolType: "generator",
    status: "coming-soon",
    estimatedTime: "3 min",
    icon: "share",
    badge: "AI",
    seoTitle: "AI Social Media Generator for Dentists",
    seoDescription:
      "Generate social media post ideas and drafts for dental practices.",
    keywords: ["dental social media", "AI social posts", "practice marketing"],
    relatedTools: ["ai-google-business-post-generator", "ai-email-writer"],
  },
  {
    slug: "ai-email-writer",
    title: "AI Email Writer",
    shortDescription: "Draft patient emails for announcements, reminders, and education.",
    category: "AI",
    toolType: "generator",
    status: "coming-soon",
    estimatedTime: "3 min",
    icon: "mail",
    badge: "AI",
    seoTitle: "AI Email Writer for Dental Practices",
    seoDescription:
      "Draft patient-friendly email copy for dental practice communication.",
    keywords: ["dental email", "AI email writer", "patient communication"],
    relatedTools: ["ai-recall-campaign-writer", "ai-new-patient-welcome-email"],
  },
  {
    slug: "ai-recall-campaign-writer",
    title: "AI Recall Campaign Writer",
    shortDescription: "Prepare recall campaign copy for overdue hygiene and reactivation lists.",
    category: "AI",
    toolType: "generator",
    status: "coming-soon",
    estimatedTime: "4 min",
    icon: "refresh",
    badge: "AI",
    seoTitle: "AI Dental Recall Campaign Writer",
    seoDescription:
      "Generate dental recall campaign messages for overdue hygiene patients.",
    keywords: ["dental recall campaign", "AI recall", "patient reactivation"],
    relatedTools: ["recall-revenue-calculator", "ai-email-writer"],
  },
  {
    slug: "ai-review-response-assistant",
    title: "AI Review Response Assistant",
    shortDescription: "Draft thoughtful, compliant review response starting points.",
    category: "AI",
    toolType: "assistant",
    status: "coming-soon",
    estimatedTime: "3 min",
    icon: "chat",
    badge: "AI",
    seoTitle: "AI Review Response Assistant for Dentists",
    seoDescription:
      "Create safe first drafts for dental practice review responses.",
    keywords: ["review response", "AI review assistant", "dental reputation"],
    relatedTools: ["google-review-analyzer", "review-growth-calculator"],
  },
  {
    slug: "ai-new-patient-welcome-email",
    title: "AI New Patient Welcome Email",
    shortDescription: "Create a warm first-visit email that helps patients feel prepared.",
    category: "AI",
    toolType: "generator",
    status: "coming-soon",
    estimatedTime: "3 min",
    icon: "mail-open",
    badge: "AI",
    seoTitle: "AI New Patient Welcome Email for Dentists",
    seoDescription:
      "Generate new patient welcome email drafts for dental practices.",
    keywords: ["new patient email", "dental welcome email", "AI patient email"],
    relatedTools: ["ai-email-writer", "ai-practice-description-generator"],
  },
  {
    slug: "ai-job-description-generator",
    title: "AI Job Description Generator",
    shortDescription: "Draft hiring posts for hygienists, assistants, front desk, and associates.",
    category: "AI",
    toolType: "generator",
    status: "coming-soon",
    estimatedTime: "4 min",
    icon: "briefcase",
    badge: "AI",
    seoTitle: "AI Dental Job Description Generator",
    seoDescription:
      "Generate job description drafts for dental practice hiring roles.",
    keywords: ["dental hiring", "job description", "AI recruiting"],
    relatedTools: ["ai-email-writer", "scheduling-efficiency-calculator"],
  },
  {
    slug: "practice-profile-score",
    title: "Practice Profile Score",
    shortDescription: "Measure whether your public profile has the fields patients need to act.",
    category: "Profile & Visibility",
    toolType: "report",
    status: "coming-soon",
    estimatedTime: "2 min",
    icon: "profile",
    badge: "Profile",
    seoTitle: "Dental Practice Profile Completeness Score",
    seoDescription:
      "Score a dental practice directory profile for completeness and patient usefulness.",
    keywords: ["profile completeness", "dental listing", "practice profile"],
    relatedTools: ["listing-audit", "missing-information-detector"],
  },
  {
    slug: "listing-audit",
    title: "Listing Audit",
    shortDescription: "Review public listing accuracy, trust signals, and patient action paths.",
    category: "Profile & Visibility",
    toolType: "audit",
    status: "coming-soon",
    estimatedTime: "4 min",
    icon: "clipboard",
    badge: "Listing",
    seoTitle: "Dental Listing Audit Tool",
    seoDescription:
      "Audit a dental directory listing for accuracy, completeness, and patient conversion signals.",
    keywords: ["dental listing audit", "practice listing", "directory profile"],
    relatedTools: ["practice-profile-score", "google-business-profile-audit"],
  },
  {
    slug: "missing-information-detector",
    title: "Missing Information Detector",
    shortDescription: "Find absent website, phone, address, services, and profile content fields.",
    category: "Profile & Visibility",
    toolType: "audit",
    status: "coming-soon",
    estimatedTime: "3 min",
    icon: "alert",
    badge: "Completeness",
    seoTitle: "Dental Listing Missing Information Detector",
    seoDescription:
      "Find missing information on a dental practice profile before patients lose confidence.",
    keywords: ["missing listing info", "profile completeness", "dental directory"],
    relatedTools: ["practice-profile-score", "listing-audit"],
  },
  {
    slug: "claim-listing-workflow",
    title: "Claim Listing",
    shortDescription: "Connect a verified public listing to your DentistOS practice workspace.",
    category: "Profile & Visibility",
    toolType: "workflow",
    status: "active",
    estimatedTime: "2 min",
    icon: "shield",
    badge: "Active",
    seoTitle: "Claim Your Dental Practice Listing",
    seoDescription:
      "Claim a dental practice listing and connect it to a DentistOS workspace.",
    keywords: ["claim dental listing", "DentistOS", "practice profile"],
    relatedTools: ["practice-profile-score", "listing-audit"],
  },
  {
    slug: "local-visibility-score",
    title: "Local Visibility Score",
    shortDescription: "Summarize listing, website, and search signals into one practical score.",
    category: "Profile & Visibility",
    toolType: "report",
    status: "coming-soon",
    estimatedTime: "5 min",
    icon: "radar",
    badge: "Visibility",
    seoTitle: "Dental Local Visibility Score",
    seoDescription:
      "Estimate local visibility strength for a dental practice across key public signals.",
    keywords: ["local visibility", "dental SEO", "practice visibility"],
    relatedTools: ["local-seo-audit", "practice-profile-score"],
  },
  {
    slug: "google-review-analyzer",
    title: "Google Review Analyzer",
    shortDescription: "Turn patient review themes into service, operations, and messaging insights.",
    category: "Resources",
    toolType: "assistant",
    status: "coming-soon",
    estimatedTime: "5 min",
    icon: "stars",
    badge: "Insights",
    seoTitle: "Google Review Analyzer for Dental Practices",
    seoDescription:
      "Analyze dental practice review themes and identify patient experience opportunities.",
    keywords: ["Google review analyzer", "dental reviews", "patient feedback"],
    relatedTools: ["ai-review-response-assistant", "review-growth-calculator"],
  },
] as const satisfies DentistSuccessHubTool[];

export function validateToolRegistry(
  tools: readonly DentistSuccessHubTool[] = DENTIST_SUCCESS_HUB_TOOLS
): ToolRegistryValidationResult {
  const errors: string[] = [];
  const slugs = new Set<string>();
  const titles = new Set<string>();
  const knownSlugs = new Set(tools.map((tool) => tool.slug));

  tools.forEach((tool, index) => {
    const label = tool.slug || `tool at index ${index}`;
    if (!tool.slug.trim()) errors.push(`${label}: slug is required`);
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(tool.slug)) {
      errors.push(`${label}: slug must be URL-safe kebab-case`);
    }
    if (slugs.has(tool.slug)) errors.push(`duplicate slug: ${tool.slug}`);
    slugs.add(tool.slug);

    const normalizedTitle = tool.title.trim().toLowerCase();
    if (!tool.title.trim()) errors.push(`${label}: title is required`);
    if (titles.has(normalizedTitle)) errors.push(`duplicate title: ${tool.title}`);
    titles.add(normalizedTitle);

    if (!tool.shortDescription.trim()) errors.push(`${label}: shortDescription is required`);
    if (!DENTIST_SUCCESS_HUB_CATEGORIES.includes(tool.category)) {
      errors.push(`${label}: unsupported category ${tool.category}`);
    }
    if (!DENTIST_SUCCESS_HUB_TOOL_TYPES.includes(tool.toolType)) {
      errors.push(`${label}: unsupported toolType ${tool.toolType}`);
    }
    if (!DENTIST_SUCCESS_HUB_TOOL_STATUSES.includes(tool.status)) {
      errors.push(`${label}: unsupported status ${tool.status}`);
    }
    if (!tool.estimatedTime.trim()) errors.push(`${label}: estimatedTime is required`);
    if (!tool.icon.trim()) errors.push(`${label}: icon is required`);
    if (!tool.badge.trim()) errors.push(`${label}: badge is required`);
    if (!tool.seoTitle.trim()) errors.push(`${label}: seoTitle is required`);
    if (!tool.seoDescription.trim()) errors.push(`${label}: seoDescription is required`);
    if (tool.keywords.length === 0) errors.push(`${label}: keywords are required`);

    for (const relatedSlug of tool.relatedTools) {
      if (relatedSlug === tool.slug) {
        errors.push(`${label}: cannot relate to itself`);
      } else if (!knownSlugs.has(relatedSlug)) {
        errors.push(`${label}: unknown related tool ${relatedSlug}`);
      }
    }
  });

  if (tools === DENTIST_SUCCESS_HUB_TOOLS) {
    for (const featuredSlug of DENTIST_SUCCESS_HUB_FEATURED_TOOL_SLUGS) {
      if (!knownSlugs.has(featuredSlug)) {
        errors.push(`featured tool references unknown slug: ${featuredSlug}`);
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

export function getDentistSuccessHubTool(slug: string): DentistSuccessHubTool | undefined {
  return DENTIST_SUCCESS_HUB_TOOLS.find((tool) => tool.slug === slug);
}

export function getDentistSuccessHubToolsByCategory(
  category: DentistSuccessHubCategory
): DentistSuccessHubTool[] {
  return DENTIST_SUCCESS_HUB_TOOLS.filter((tool) => tool.category === category);
}

export function getDentistSuccessHubActiveTools(): DentistSuccessHubTool[] {
  return DENTIST_SUCCESS_HUB_TOOLS.filter((tool) => tool.status === "active");
}

export function getDentistSuccessHubFeaturedTools(): DentistSuccessHubTool[] {
  return resolveDentistSuccessHubTools(DENTIST_SUCCESS_HUB_FEATURED_TOOL_SLUGS);
}

export function getDentistSuccessHubRelatedTools(tool: DentistSuccessHubTool): DentistSuccessHubTool[] {
  return resolveDentistSuccessHubTools(tool.relatedTools);
}

export function getDentistSuccessHubCategorySummaries(): DentistSuccessHubCategorySummary[] {
  return DENTIST_SUCCESS_HUB_CATEGORIES.map((category) => {
    const details = DENTIST_SUCCESS_HUB_CATEGORY_DETAILS[category];
    const anchor = getDentistSuccessHubCategorySlug(category);
    return {
      name: category,
      description: details.description,
      href: `/dentist-success-hub/tools#${anchor}`,
      anchor,
      icon: details.icon,
      count: getDentistSuccessHubToolsByCategory(category).length,
    };
  });
}

export function getDentistSuccessHubCategoryDescription(category: DentistSuccessHubCategory): string {
  return DENTIST_SUCCESS_HUB_CATEGORY_DETAILS[category].description;
}

export function getDentistSuccessHubCategorySlug(category: DentistSuccessHubCategory): string {
  return category
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function getDentistSuccessHubStatusLabel(status: DentistSuccessHubToolStatus): string {
  return DENTIST_SUCCESS_HUB_STATUS_LABELS[status];
}

export function getDentistSuccessHubToolHref(tool: DentistSuccessHubTool): string {
  return `/dentist-success-hub/tools/${tool.slug}`;
}

export function toDentistSuccessHubToolCard(tool: DentistSuccessHubTool): DentistSuccessHubToolCardView {
  return {
    title: tool.title,
    description: tool.shortDescription,
    href: getDentistSuccessHubToolHref(tool),
    eyebrow: tool.category,
    badge: getDentistSuccessHubStatusLabel(tool.status),
    footer: tool.estimatedTime,
  };
}

export function getDentistSuccessHubEstimatedTimes(
  tools: readonly DentistSuccessHubTool[] = DENTIST_SUCCESS_HUB_TOOLS
): string[] {
  return Array.from(new Set(tools.map((tool) => tool.estimatedTime))).sort((left, right) => {
    const leftMinutes = Number.parseInt(left, 10);
    const rightMinutes = Number.parseInt(right, 10);
    if (Number.isNaN(leftMinutes) || Number.isNaN(rightMinutes)) return left.localeCompare(right);
    return leftMinutes - rightMinutes;
  });
}

export function searchDentistSuccessHubTools(
  filters: DentistSuccessHubToolSearchFilters,
  tools: readonly DentistSuccessHubTool[] = DENTIST_SUCCESS_HUB_TOOLS
): DentistSuccessHubTool[] {
  const query = normalizeSearchTerm(filters.query);

  return tools.filter((tool) => {
    if (query && !toolMatchesQuery(tool, query)) return false;
    if (filters.category && tool.category !== filters.category) return false;
    if (filters.status && tool.status !== filters.status) return false;
    if (filters.toolType && tool.toolType !== filters.toolType) return false;
    if (filters.estimatedTime && tool.estimatedTime !== filters.estimatedTime) return false;
    return true;
  });
}

function toolMatchesQuery(tool: DentistSuccessHubTool, query: string): boolean {
  const searchableText = [
    tool.title,
    tool.shortDescription,
    tool.seoDescription,
    ...tool.keywords,
  ]
    .join(" ")
    .toLowerCase();

  return searchableText.includes(query);
}

function normalizeSearchTerm(value: string | undefined): string {
  return value?.trim().toLowerCase() ?? "";
}

function resolveDentistSuccessHubTools(slugs: readonly string[]): DentistSuccessHubTool[] {
  return slugs
    .map((slug) => getDentistSuccessHubTool(slug))
    .filter((tool): tool is DentistSuccessHubTool => Boolean(tool));
}
