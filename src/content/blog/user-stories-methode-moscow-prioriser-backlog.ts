import type { BlogArticle } from "@/lib/blog";

const article: BlogArticle = {
  slug: "user-stories-methode-moscow-prioriser-backlog",
  title: "User stories et méthode MoSCoW : prioriser son backlog efficacement",
  description:
    "La méthode MoSCoW est un outil de priorisation incontournable en agile. Apprenez à l'appliquer à vos user stories pour des sprints mieux cadrés et moins de scope creep.",
  publishedAt: "2026-03-03T08:00:00Z",
  author: "Équipe SpecFlow",
  authorTitle: "Product & Engineering",
  category: "Méthodes agiles",
  tags: ["MoSCoW", "user stories", "backlog", "priorisation", "gestion de projet"],
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
};

export default article;
