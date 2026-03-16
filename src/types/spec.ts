export const PROJECT_TYPES = [
  { value: "ecommerce", label: "E-commerce" },
  { value: "saas", label: "SaaS / Application web" },
  { value: "vitrine", label: "Site vitrine" },
  { value: "mobile", label: "Application mobile" },
  { value: "marketplace", label: "Marketplace" },
  { value: "backoffice", label: "Back-office / Dashboard" },
  { value: "api", label: "API / Microservice" },
  { value: "autre", label: "Autre" },
] as const;

export const STACK_OPTIONS = [
  { value: "nextjs", label: "Next.js" },
  { value: "react", label: "React" },
  { value: "vue", label: "Vue.js" },
  { value: "nuxt", label: "Nuxt" },
  { value: "laravel", label: "Laravel" },
  { value: "django", label: "Django" },
  { value: "rails", label: "Ruby on Rails" },
  { value: "node", label: "Node.js / Express" },
  { value: "shopify", label: "Shopify" },
  { value: "wordpress", label: "WordPress" },
  { value: "flutter", label: "Flutter" },
  { value: "react-native", label: "React Native" },
  { value: "autre", label: "Autre / Non défini" },
] as const;

export type SpecSection =
  | "summary"
  | "personas"
  | "userStories"
  | "acceptance"
  | "outOfScope"
  | "questions";

export const SECTION_LABELS: Record<SpecSection, string> = {
  summary: "Résumé exécutif",
  personas: "Personas",
  userStories: "User stories",
  acceptance: "Critères d'acceptance",
  outOfScope: "Hors-périmètre",
  questions: "Questions de clarification",
};

export const SECTIONS_ORDER: SpecSection[] = [
  "summary",
  "personas",
  "userStories",
  "acceptance",
  "outOfScope",
  "questions",
];

export type SpecContent = Partial<Record<SpecSection, string>>;

export type SpecStatus = "draft" | "generating" | "done" | "error";
