import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import type { Components } from "react-markdown";
import {
  getArticleBySlug,
  getAllSlugs,
  getAllArticles,
  formatDate,
  SITE_URL,
} from "@/lib/blog";

// ─── Static params ─────────────────────────────────────────────────────────

export function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }));
}

// ─── Metadata ──────────────────────────────────────────────────────────────

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = getArticleBySlug(slug);

  if (!article) {
    return { title: "Article introuvable" };
  }

  const url = `${SITE_URL}/blog/${article.slug}`;

  return {
    title: article.title,
    description: article.description,
    alternates: {
      canonical: url,
    },
    authors: [{ name: article.author }],
    openGraph: {
      title: article.title,
      description: article.description,
      url,
      siteName: "SpecFlow",
      locale: "fr_FR",
      type: "article",
      publishedTime: article.publishedAt,
      modifiedTime: article.updatedAt ?? article.publishedAt,
      authors: [article.author],
      tags: article.tags,
    },
    twitter: {
      card: "summary_large_image",
      title: article.title,
      description: article.description,
    },
  };
}

// ─── Markdown components ───────────────────────────────────────────────────

const mdComponents: Components = {
  h2: ({ children }) => (
    <h2
      className="font-serif text-2xl font-bold text-foreground mt-10 mb-4 leading-snug tracking-tight"
      style={{ fontFamily: "Merriweather, serif" }}
    >
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3
      className="font-serif text-lg font-bold text-foreground mt-6 mb-3 leading-snug"
      style={{ fontFamily: "Merriweather, serif" }}
    >
      {children}
    </h3>
  ),
  p: ({ children }) => (
    <p className="text-sm text-muted-foreground leading-relaxed mb-4">
      {children}
    </p>
  ),
  strong: ({ children }) => (
    <strong className="font-semibold text-foreground">{children}</strong>
  ),
  em: ({ children }) => (
    <em className="italic text-muted-foreground">{children}</em>
  ),
  ul: ({ children }) => (
    <ul className="space-y-1.5 mb-4 pl-4 list-disc marker:text-primary">
      {children}
    </ul>
  ),
  ol: ({ children }) => (
    <ol className="space-y-1.5 mb-4 pl-4 list-decimal marker:text-primary">
      {children}
    </ol>
  ),
  li: ({ children }) => (
    <li className="text-sm text-muted-foreground leading-relaxed">{children}</li>
  ),
  blockquote: ({ children }) => (
    <blockquote className="border-l-2 border-primary pl-4 my-4 italic text-muted-foreground text-sm">
      {children}
    </blockquote>
  ),
  code: ({ children, className }) => {
    const isBlock = className?.includes("language-");
    if (isBlock) {
      return (
        <code className="block font-mono text-xs bg-card border border-border rounded-xl p-4 overflow-x-auto whitespace-pre text-foreground leading-relaxed mb-4">
          {children}
        </code>
      );
    }
    return (
      <code className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded text-foreground">
        {children}
      </code>
    );
  },
  pre: ({ children }) => <div className="mb-4">{children}</div>,
  hr: () => <hr className="border-border my-8" />,
  a: ({ href, children }) => (
    <a
      href={href}
      className="text-primary hover:underline"
      target={href?.startsWith("http") ? "_blank" : undefined}
      rel={href?.startsWith("http") ? "noopener noreferrer" : undefined}
    >
      {children}
    </a>
  ),
  table: ({ children }) => (
    <div className="overflow-x-auto mb-6">
      <table className="w-full text-sm border-collapse">{children}</table>
    </div>
  ),
  th: ({ children }) => (
    <th className="text-left font-semibold text-foreground border border-border px-3 py-2 bg-muted/40 text-xs">
      {children}
    </th>
  ),
  td: ({ children }) => (
    <td className="text-muted-foreground border border-border px-3 py-2 text-xs">
      {children}
    </td>
  ),
};

// ─── Page ──────────────────────────────────────────────────────────────────

export default async function BlogArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = getArticleBySlug(slug);

  if (!article) notFound();

  const url = `${SITE_URL}/blog/${article.slug}`;
  const allArticles = getAllArticles();
  const currentIndex = allArticles.findIndex((a) => a.slug === article.slug);
  const prevArticle = allArticles[currentIndex + 1] ?? null; // older
  const nextArticle = allArticles[currentIndex - 1] ?? null; // newer

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      headline: article.title,
      description: article.description,
      url,
      datePublished: article.publishedAt,
      dateModified: article.updatedAt ?? article.publishedAt,
      author: {
        "@type": "Organization",
        name: article.author,
        url: SITE_URL,
      },
      publisher: {
        "@type": "Organization",
        name: "SpecFlow",
        url: SITE_URL,
      },
      mainEntityOfPage: {
        "@type": "WebPage",
        "@id": url,
      },
      keywords: article.tags.join(", "),
      articleSection: article.category,
      inLanguage: "fr-FR",
      timeRequired: `PT${article.readingTime}M`,
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Accueil", item: SITE_URL },
        {
          "@type": "ListItem",
          position: 2,
          name: "Blog",
          item: `${SITE_URL}/blog`,
        },
        { "@type": "ListItem", position: 3, name: article.title, item: url },
      ],
    },
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="min-h-screen bg-background text-foreground">
        {/* ── NAV ───────────────────────────────────────────────────────── */}
        <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-background/90 backdrop-blur-md">
          <div className="mx-auto max-w-5xl px-6 h-14 flex items-center justify-between">
            <Link
              href="/"
              className="font-mono text-sm font-medium text-foreground"
            >
              Spec<span className="text-primary">Flow</span>
            </Link>
            <div className="hidden md:flex items-center gap-8">
              <Link
                href="/#how"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Comment ça marche
              </Link>
              <Link
                href="/#pricing"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Tarifs
              </Link>
              <Link
                href="/blog"
                className="text-sm font-medium text-primary hover:text-primary/80 transition-colors"
              >
                Blog
              </Link>
              <Link
                href="/login"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Connexion
              </Link>
            </div>
          </div>
        </nav>

        {/* ── BREADCRUMB ────────────────────────────────────────────────── */}
        <div className="pt-20 px-6">
          <div className="mx-auto max-w-3xl">
            <nav aria-label="Fil d'Ariane">
              <ol className="flex items-center gap-2 font-mono text-xs text-muted-foreground">
                <li>
                  <Link
                    href="/"
                    className="hover:text-foreground transition-colors"
                  >
                    Accueil
                  </Link>
                </li>
                <li aria-hidden="true">/</li>
                <li>
                  <Link
                    href="/blog"
                    className="hover:text-foreground transition-colors"
                  >
                    Blog
                  </Link>
                </li>
                <li aria-hidden="true">/</li>
                <li className="text-foreground truncate max-w-[200px]">
                  {article.title}
                </li>
              </ol>
            </nav>
          </div>
        </div>

        {/* ── ARTICLE HEADER ────────────────────────────────────────────── */}
        <header className="pt-8 pb-12 px-6 border-b border-border">
          <div className="mx-auto max-w-3xl">
            <div className="flex items-center gap-3 mb-4">
              <span className="font-mono text-[10px] text-primary bg-primary/8 px-2 py-0.5 rounded">
                {article.category}
              </span>
              <span className="font-mono text-xs text-muted-foreground">
                {article.readingTime} min de lecture
              </span>
            </div>

            <h1
              className="font-serif text-3xl md:text-4xl font-bold leading-tight tracking-tight text-foreground mb-6"
              style={{ fontFamily: "Merriweather, serif" }}
            >
              {article.title}
            </h1>

            <p className="text-lg text-muted-foreground font-light leading-relaxed mb-8">
              {article.description}
            </p>

            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center font-mono text-xs text-primary font-medium select-none">
                SF
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">
                  {article.author}
                </p>
                <p className="font-mono text-xs text-muted-foreground">
                  <time dateTime={article.publishedAt}>
                    Publié le {formatDate(article.publishedAt)}
                  </time>
                  {article.updatedAt && (
                    <>
                      {" · "}
                      <time dateTime={article.updatedAt}>
                        Mis à jour le {formatDate(article.updatedAt)}
                      </time>
                    </>
                  )}
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* ── ARTICLE CONTENT ───────────────────────────────────────────── */}
        <main className="py-12 px-6">
          <div className="mx-auto max-w-3xl">
            <article>
              <ReactMarkdown components={mdComponents}>
                {article.content}
              </ReactMarkdown>
            </article>

            {/* Tags */}
            <div className="mt-12 pt-8 border-t border-border">
              <p className="font-mono text-xs text-muted-foreground mb-3">
                Tags
              </p>
              <div className="flex flex-wrap gap-2">
                {article.tags.map((tag) => (
                  <span
                    key={tag}
                    className="font-mono text-[11px] bg-muted text-muted-foreground px-2.5 py-1 rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* CTA */}
            <div className="mt-12 rounded-xl border border-primary/20 bg-primary/5 p-8">
              <p className="font-mono text-xs text-primary uppercase tracking-widest mb-3">
                SpecFlow
              </p>
              <h2
                className="font-serif text-2xl font-bold text-foreground mb-3 leading-snug"
                style={{ fontFamily: "Merriweather, serif" }}
              >
                Générez vos specs en 30 minutes.
              </h2>
              <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
                User stories MoSCoW, critères Gherkin, personas et
                hors-périmètre — générés automatiquement à partir de votre
                brief.
              </p>
              <Link
                href="/register"
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                Essayer gratuitement — sans CB
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 16 16"
                  fill="none"
                  aria-hidden="true"
                >
                  <path
                    d="M3 8h10M9 4l4 4-4 4"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </Link>
            </div>

            {/* Prev / Next navigation */}
            {(prevArticle || nextArticle) && (
              <nav
                className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-4"
                aria-label="Articles précédent et suivant"
              >
                {prevArticle ? (
                  <Link
                    href={`/blog/${prevArticle.slug}`}
                    className="group flex flex-col gap-1 rounded-xl border border-border bg-card p-5 hover:border-primary/40 transition-colors"
                  >
                    <p className="font-mono text-[10px] text-muted-foreground mb-1">
                      ← Article précédent
                    </p>
                    <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors leading-snug">
                      {prevArticle.title}
                    </p>
                  </Link>
                ) : (
                  <div />
                )}
                {nextArticle ? (
                  <Link
                    href={`/blog/${nextArticle.slug}`}
                    className="group flex flex-col items-end gap-1 rounded-xl border border-border bg-card p-5 hover:border-primary/40 transition-colors text-right"
                  >
                    <p className="font-mono text-[10px] text-muted-foreground mb-1">
                      Article suivant →
                    </p>
                    <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors leading-snug">
                      {nextArticle.title}
                    </p>
                  </Link>
                ) : (
                  <div />
                )}
              </nav>
            )}
          </div>
        </main>

        {/* ── FOOTER ────────────────────────────────────────────────────── */}
        <footer className="border-t border-border py-10 px-6 mt-8">
          <div className="mx-auto max-w-5xl flex flex-wrap items-center justify-between gap-6">
            <Link
              href="/"
              className="font-mono text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Spec<span className="text-primary">Flow</span>
            </Link>
            <nav aria-label="Footer" className="flex gap-6">
              {["Mentions légales", "CGV", "Confidentialité"].map((l) => (
                <a
                  key={l}
                  href="#"
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  {l}
                </a>
              ))}
              <Link
                href="/login"
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                Connexion
              </Link>
            </nav>
            <span className="font-mono text-xs text-muted-foreground">
              © 2026 SpecFlow
            </span>
          </div>
        </footer>
      </div>
    </>
  );
}
