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

export const SECTIONS_CONFIG: {
  key: SpecSection;
  label: string;
  alwaysOn: boolean;
  prompt: string;
}[] = [
  {
    key: "summary",
    label: "Résumé exécutif",
    alwaysOn: true,
    prompt:
      "[SECTION:summary]\nRésumé exécutif en 3-4 phrases professionnelles. Présente l'objectif du projet, la cible utilisateur et la valeur apportée.",
  },
  {
    key: "personas",
    label: "Personas",
    alwaysOn: false,
    prompt:
      "[SECTION:personas]\nIdentifie 2 à 3 personas pertinents. Pour chaque persona : nom, rôle, objectifs, frustrations actuelles. Format Markdown structuré.",
  },
  {
    key: "userStories",
    label: "User stories",
    alwaysOn: false,
    prompt:
      "[SECTION:userStories]\nListe de user stories priorisées avec la méthode MoSCoW. Format :\n**MUST HAVE**\n- En tant que [persona], je veux [action] afin de [bénéfice]\n**SHOULD HAVE**\n- ...\n**COULD HAVE**\n- ...\n**WON'T HAVE**\n- ...",
  },
  {
    key: "acceptance",
    label: "Critères d'acceptance",
    alwaysOn: false,
    prompt:
      "[SECTION:acceptance]\nCritères d'acceptance au format Gherkin pour les 5 user stories MUST HAVE les plus importantes.\nFormat :\n**Story : [titre]**\nGiven [contexte]\nWhen [action]\nThen [résultat attendu]",
  },
  {
    key: "outOfScope",
    label: "Hors-périmètre",
    alwaysOn: false,
    prompt:
      "[SECTION:outOfScope]\nListe explicite de ce qui est HORS périmètre de ce projet. Minimum 5 éléments. Sois précis et contextuel au projet.",
  },
  {
    key: "questions",
    label: "Questions de clarification",
    alwaysOn: false,
    prompt:
      "[SECTION:questions]\nListe de 5 à 8 questions de clarification importantes à poser au client, avec pour chacune l'impact sur la spec si non clarifiée.\nFormat :\n- **Question :** [question]\n  **Impact :** [impact si non répondu]",
  },
];

export type SpecContent = Partial<Record<SpecSection, string>>;

export type SpecStatus = "draft" | "generating" | "done" | "error";
