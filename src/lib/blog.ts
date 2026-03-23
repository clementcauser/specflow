export const SITE_URL = "https://specflow.io";

export interface BlogArticle {
  slug: string;
  title: string;
  description: string;
  publishedAt: string; // ISO 8601 date
  updatedAt?: string;
  author: string;
  authorTitle: string;
  category: string;
  tags: string[];
  readingTime: number; // minutes
  content: string; // Markdown
}

// ─── Articles ──────────────────────────────────────────────────────────────

const ARTICLES: BlogArticle[] = [
  {
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
  },
  {
    slug: "user-stories-methode-moscow-prioriser-backlog",
    title:
      "User stories et méthode MoSCoW : prioriser son backlog efficacement",
    description:
      "La méthode MoSCoW est un outil de priorisation incontournable en agile. Apprenez à l'appliquer à vos user stories pour des sprints mieux cadrés et moins de scope creep.",
    publishedAt: "2026-03-03T08:00:00Z",
    author: "Équipe SpecFlow",
    authorTitle: "Product & Engineering",
    category: "Méthodes agiles",
    tags: [
      "MoSCoW",
      "user stories",
      "backlog",
      "priorisation",
      "gestion de projet",
    ],
    readingTime: 6,
    content: `
## Le piège du "tout est prioritaire"

Lors d'un cadrage projet, le client veut tout, le métier veut tout, les parties prenantes veulent tout — et tout est *urgent*. Sans méthode de priorisation, votre backlog devient un tas de désirs non triés, vos sprints sont surchargés, et la livraison initiale prend le double du temps prévu.

La méthode **MoSCoW** est l'outil le plus simple et le plus efficace pour sortir de ce piège.

---

## Les 4 niveaux MoSCoW

**M — Must Have** (indispensable)
Les fonctionnalités sans lesquelles le produit ne peut pas être livré. Si elles sont absentes, la release est un échec. Limitez-vous à ce qui est vraiment critique.

**S — Should Have** (important mais pas bloquant)
Des fonctionnalités à forte valeur ajoutée qui seront incluses si le temps le permet. En cas de contrainte, elles passent au sprint suivant sans mettre en danger la release.

**C — Could Have** (souhaitable)
Les "nice to have". Ils améliorent l'expérience mais ne manqueront pas à la plupart des utilisateurs si absents. Parfaits pour une v1.1.

**W — Won't Have (this time)** (hors périmètre)
Explicitement exclu du périmètre actuel. Ce n'est pas "jamais" — c'est "pas maintenant". Formaliser ce niveau évite les demandes de dernière minute.

---

## Comment appliquer MoSCoW à vos user stories

### Étape 1 : Listez toutes les stories sans les trier

Brainstormez librement. L'objectif est d'avoir une liste exhaustive avant de prioriser.

### Étape 2 : Appliquez la règle du Must Have

Posez-vous la question : *"Si cette fonctionnalité est absente au jour de la livraison, est-ce un blocage absolu ?"* Si non, ce n'est pas un Must Have.

En pratique, les Must Have ne devraient pas dépasser **60 % de la capacité du sprint**.

### Étape 3 : Distribuez Should et Could

Les Should Have complètent naturellement les Must Have. Les Could Have sont vos "aspirations" — utiles pour alimenter un backlog de roadmap.

### Étape 4 : Documentez les Won't Have

C'est souvent l'étape oubliée. Pourtant, avoir une liste explicite des exclusions vous protège des demandes de scope creep en cours de projet.

---

## Exemple de user stories MoSCoW pour une app e-commerce

| Priorité | User story |
|----------|-----------|
| MUST | En tant qu'acheteur, je peux ajouter un produit au panier |
| MUST | En tant qu'acheteur, je peux payer par carte bancaire |
| SHOULD | En tant qu'acheteur, je reçois un email de confirmation |
| SHOULD | En tant qu'acheteur, je peux suivre ma commande |
| COULD | En tant qu'acheteur, je peux sauvegarder une wishlist |
| WON'T | En tant qu'acheteur, je peux partager ma wishlist sur les réseaux sociaux |

---

## Les erreurs classiques à éviter

**Trop de Must Have** : Si 80 % de votre backlog est "indispensable", vous n'avez pas priorisé. Réduisez.

**Oublier les Won't Have** : Sans cette liste, vous passerez du temps à re-discuter des mêmes sujets à chaque réunion.

**Ne pas réviser entre les sprints** : MoSCoW n'est pas figé. Réévaluez la priorisation à chaque sprint review en fonction des retours utilisateurs.

---

## MoSCoW dans vos spécifications fonctionnelles

Une spec fonctionnelle de qualité intègre la priorisation MoSCoW directement dans chaque user story. Cela permet à l'équipe de développement de commencer par ce qui compte vraiment et d'itérer efficacement.

SpecFlow génère automatiquement vos user stories avec la priorisation MoSCoW appliquée — cohérente avec votre brief et le type de projet. Plus besoin de passer une réunion entière à décider si la wishlist est un Should ou un Could.
    `,
  },
  {
    slug: "comment-rediger-specifications-fonctionnelles",
    title:
      "Comment rédiger des spécifications fonctionnelles : le guide complet",
    description:
      "Les spécifications fonctionnelles sont le contrat entre le métier et la technique. Découvrez la méthode et le template pour rédiger des specs claires, complètes et exploitables.",
    publishedAt: "2026-02-24T08:00:00Z",
    author: "Équipe SpecFlow",
    authorTitle: "Product & Engineering",
    category: "Gestion de projet",
    tags: [
      "spécifications fonctionnelles",
      "documentation",
      "product management",
      "template",
    ],
    readingTime: 8,
    content: `
## Pourquoi les spécifications fonctionnelles sont indispensables

Un projet sans spec, c'est un projet sans contrat. Les développeurs codent ce qu'ils comprennent, le client valide ce qu'il imagine, et l'écart entre les deux génère des cycles de corrections coûteux. Selon le Standish Group, **plus de 30 % des projets IT échouent à cause d'exigences mal définies**.

Une spécification fonctionnelle bien rédigée répond à une question simple : *"Qu'est-ce que le système doit faire ?"* — sans rentrer dans le comment (qui est du ressort de la spec technique).

---

## Qu'est-ce qu'une spécification fonctionnelle ?

Une spec fonctionnelle (ou cahier des charges fonctionnel) décrit le **comportement attendu d'un système** du point de vue de l'utilisateur. Elle inclut :

- Les **fonctionnalités** à développer
- Les **acteurs** qui interagissent avec le système (personas)
- Les **règles métier** à respecter
- Les **critères d'acceptance** (comment valider que c'est fait)
- Le **périmètre** : ce qui est inclus ET ce qui est exclu

---

## La structure d'une bonne spécification fonctionnelle

### 1. Résumé exécutif

2 à 4 phrases qui posent le contexte : quel problème résout-on, pour qui, et quel est l'objectif business. C'est la seule partie que lira votre direction.

### 2. Contexte et objectifs

Décrivez le projet en détail : historique, existant, contraintes connues, stack technique si pertinente. Incluez les KPIs que le projet doit impacter.

### 3. Personas

Qui sont les utilisateurs cibles ? Pour chaque persona, définissez :
- Son rôle et contexte
- Ses objectifs principaux
- Ses points de friction actuels
- Sa fréquence d'utilisation

### 4. User stories

C'est le cœur de la spec. Chaque user story suit le format :

> **En tant que** [persona], **je veux** [action], **afin de** [bénéfice]

Les stories sont organisées par **épic** (grande fonctionnalité) et priorisées avec la méthode **MoSCoW**.

### 5. Critères d'acceptance

Pour chaque story, listez les conditions qui permettent de valider qu'elle est terminée. Utilisez le format **Gherkin** (Given/When/Then) pour les rendre testables.

### 6. Règles métier

Toutes les règles qui conditionnent le comportement du système : calculs, workflows, permissions, règles de validation. Exemple : *"Un utilisateur ne peut pas passer commande si son panier dépasse 10 000 €"*.

### 7. Hors périmètre

Liste explicite de ce qui **n'est pas** dans le scope. C'est votre protection contre le scope creep. Exemple : *"La gestion des retours produits est hors périmètre de la v1"*.

### 8. Questions ouvertes

Les points qui nécessitent une décision client avant de démarrer le développement. Chaque question doit préciser son impact si non résolue.

---

## Les erreurs les plus fréquentes

### Confondre fonctionnel et technique

Une spec fonctionnelle dit **quoi**, pas **comment**. *"L'utilisateur peut s'authentifier"* est fonctionnel. *"Utiliser OAuth 2.0 avec JWT"* est technique.

### Rédiger au passif et dans le vague

*"Les données sont sauvegardées"* — par qui ? quand ? comment sait-on que c'est fait ? Préférez : *"Lorsque l'utilisateur clique sur Enregistrer, ses modifications sont persistées et un message de confirmation s'affiche."*

### Oublier les cas d'erreur

90 % des specs ne couvrent que le happy path. Or, les bugs se cachent dans les cas limites : que se passe-t-il si le réseau coupe ? Si le fichier est trop lourd ? Si la session expire pendant le formulaire ?

### Ne pas dater ni versionner

Une spec non datée devient rapidement obsolète. Ajoutez systématiquement une date de révision et un numéro de version.

---

## Template de spec fonctionnelle

\`\`\`
# [Nom du projet] — Spécifications fonctionnelles
Version : 1.0 | Date : [JJ/MM/AAAA] | Auteur : [Nom]

## 1. Résumé exécutif
[2-4 phrases]

## 2. Contexte
[Historique, existant, objectifs business]

## 3. Personas
### Persona 1 : [Nom]
- Rôle : ...
- Objectifs : ...
- Points de friction : ...

## 4. User stories
### Épic 1 : [Nom de l'épic]
| Priorité | Story |
|----------|-------|
| MUST | En tant que..., je veux... afin de... |

## 5. Critères d'acceptance
### US-01 : [Titre]
Given ... When ... Then ...

## 6. Règles métier
- RG-01 : ...

## 7. Hors périmètre
- ...

## 8. Questions ouvertes
- Q1 : ... (Impact si non résolu : ...)
\`\`\`

---

## Gagner du temps sur la rédaction

Rédiger une spec complète prend en moyenne 2 à 3 jours. Entre la collecte des besoins, la structuration, les aller-retours clients et la mise en forme, c'est l'une des tâches les plus chronophages du Product Manager.

SpecFlow génère automatiquement ce document complet à partir d'un brief de 10 minutes : personas, user stories MoSCoW, critères Gherkin, hors-périmètre et questions de clarification. En 45 secondes, vous avez une base solide — que vous n'avez plus qu'à affiner avec votre client.
    `,
  },
];

// ─── Utilities ─────────────────────────────────────────────────────────────

/** Returns all articles sorted from newest to oldest */
export function getAllArticles(): BlogArticle[] {
  return [...ARTICLES].sort(
    (a, b) =>
      new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );
}

export function getArticleBySlug(slug: string): BlogArticle | undefined {
  return ARTICLES.find((a) => a.slug === slug);
}

export function getAllSlugs(): string[] {
  return ARTICLES.map((a) => a.slug);
}

export function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(iso));
}
