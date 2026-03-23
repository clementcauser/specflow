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

import gherkinBdd from "@/content/blog/gherkin-bdd-criteres-acceptance";
import userStoriesMoscow from "@/content/blog/user-stories-methode-moscow-prioriser-backlog";
import commentRediger from "@/content/blog/comment-rediger-specifications-fonctionnelles";
const ARTICLES: BlogArticle[] = [gherkinBdd, userStoriesMoscow, commentRediger];

// ─── Utilities ─────────────────────────────────────────────────────────────

export function getAllArticles(): BlogArticle[] {
  return [...ARTICLES].sort(
    (a, b) =>
      new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
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
