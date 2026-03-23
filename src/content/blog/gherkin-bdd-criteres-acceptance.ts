import type { BlogArticle } from "@/lib/blog";

const article: BlogArticle = {
  slug: "gherkin-bdd-criteres-acceptance",
  title: "Gherkin et BDD : rédiger des critères d'acceptance exploitables",
  description:
    "Découvrez comment le format Gherkin (Given/When/Then) permet d'écrire des critères d'acceptance précis, testables et compris par toute l'équipe.",
  publishedAt: "2026-03-10T08:00:00Z",
  author: "Équipe SpecFlow",
  authorTitle: "Product & Engineering",
  category: "Méthodes agiles",
  tags: ["Gherkin", "BDD", "critères d'acceptance", "tests", "agile"],
  readingTime: 7,
  content: `
## Pourquoi les critères d'acceptance sont souvent inutilisables

Dans la majorité des projets, les critères d'acceptance ressemblent à : *"Le bouton doit fonctionner correctement"* ou *"La page se charge rapidement"*. Ces formulations vagues créent des malentendus entre Product, Dev et QA — et débouchent invariablement sur des bugs découverts en recette, voire en production.

Le format **Gherkin**, issu du mouvement **Behavior-Driven Development (BDD)**, résout ce problème en imposant une structure précise et lisible par tous.

---

## Qu'est-ce que Gherkin ?

Gherkin est un langage de description de comportements. Il repose sur trois mots-clés fondamentaux :

- **Given** (Étant donné) — le contexte initial, l'état du système avant l'action
- **When** (Quand) — l'action déclenchée par l'utilisateur ou le système
- **Then** (Alors) — le résultat attendu, observable et vérifiable

### Exemple concret

\`\`\`gherkin
Feature: Connexion utilisateur

  Scenario: Connexion avec des identifiants valides
    Given je suis sur la page de connexion
    When je saisis "alice@exemple.fr" et le mot de passe correct
    Then je suis redirigé vers mon tableau de bord
    And un message "Bienvenue, Alice" est affiché

  Scenario: Tentative de connexion avec un mauvais mot de passe
    Given je suis sur la page de connexion
    When je saisis "alice@exemple.fr" et un mot de passe incorrect
    Then un message d'erreur "Identifiants invalides" est affiché
    And je reste sur la page de connexion
\`\`\`

Chaque scénario est **autonome**, **précis** et **directement testable** — manuellement ou via un outil comme Cucumber ou Playwright.

---

## Les 4 règles d'or d'un bon critère Gherkin

### 1. Un scénario = un comportement

Évitez les scénarios "fourre-tout" qui testent plusieurs actions d'un coup. Chaque scénario doit décrire **un seul chemin** utilisateur.

### 2. Rédigez du point de vue utilisateur

Le **Given** doit décrire un état observable, pas une implémentation technique. Préférez *"je suis authentifié"* à *"le token JWT est présent dans le localStorage"*.

### 3. Le **Then** doit être vérifiable

Si le résultat ne peut pas être constaté (visuellement ou via un test), reformulez. *"La performance est améliorée"* n'est pas un **Then** valable. *"La page s'affiche en moins de 2 secondes"* l'est.

### 4. Couvrez les cas d'erreur

Pour chaque **happy path**, écrivez au moins un **sad path**. Les cas d'erreur sont ceux qui révèlent le plus de bugs en production.

---

## Gherkin et la collaboration Product/Dev/QA

L'un des avantages méconnus de Gherkin est qu'il force une conversation **avant** le développement. Lorsque le Product Manager rédige les scénarios, les développeurs identifient immédiatement les ambiguïtés, et les testeurs savent exactement quoi automatiser.

Cette pratique — appelée **Example Mapping** — consiste à atelier avec toute l'équipe pour dérouler les scénarios d'une user story. En 30 minutes, vous éliminez la moitié des aller-retours futurs.

---

## Intégrer Gherkin dans votre workflow

1. **Au moment du sprint planning** : rédigez les scénarios Gherkin avant d'estimer
2. **En definition of ready** : une story est prête quand ses critères Gherkin sont validés par Dev + QA
3. **En definition of done** : une story est terminée quand tous les scénarios passent (manuellement ou en CI)

---

## Automatiser avec SpecFlow

Écrire des critères Gherkin manuellement pour chaque feature prend du temps. SpecFlow génère automatiquement des critères d'acceptance au format Gherkin à partir de votre brief projet — cohérents, priorisés et prêts à être importés dans votre outil de test.

Résultat : vous passez moins de temps à rédiger, et plus de temps à valider.
  `,
};

export default article;
