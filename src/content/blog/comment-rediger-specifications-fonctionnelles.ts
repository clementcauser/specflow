import type { BlogArticle } from "@/lib/blog";

const article: BlogArticle = {
  slug: "comment-rediger-specifications-fonctionnelles",
  title: "Comment rédiger des spécifications fonctionnelles : le guide complet",
  description:
    "Les spécifications fonctionnelles sont le contrat entre le métier et la technique. Découvrez la méthode et le template pour rédiger des specs claires, complètes et exploitables.",
  publishedAt: "2026-02-24T08:00:00Z",
  author: "Équipe SpecFlow",
  authorTitle: "Product & Engineering",
  category: "Gestion de projet",
  tags: ["spécifications fonctionnelles", "documentation", "product management", "template"],
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
};

export default article;
