import type { Metadata } from "next";
import Link from "next/link";
import { getAllArticles, formatDate, SITE_URL } from "@/lib/blog";

export const metadata: Metadata = {
  title: "Blog — Méthodes agiles, specs et product management | SpecFlow",
  description:
    "Guides pratiques sur les spécifications fonctionnelles, les user stories, la méthode MoSCoW et le format Gherkin. Devenez un expert de la documentation produit.",
  alternates: {
    canonical: `${SITE_URL}/blog`,
  },
  openGraph: {
    title: "Blog SpecFlow — Méthodes agiles et spécifications fonctionnelles",
    description:
      "Guides pratiques sur les spécifications fonctionnelles, les user stories, la méthode MoSCoW et le format Gherkin.",
    url: `${SITE_URL}/blog`,
    siteName: "SpecFlow",
    locale: "fr_FR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Blog SpecFlow — Méthodes agiles et spécifications fonctionnelles",
    description:
      "Guides pratiques sur les spécifications fonctionnelles, les user stories, la méthode MoSCoW et le format Gherkin.",
  },
};

export default function BlogListPage() {
  const articles = getAllArticles();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: "Blog SpecFlow",
    description:
      "Guides pratiques sur les spécifications fonctionnelles, les user stories et les méthodes agiles.",
    url: `${SITE_URL}/blog`,
    publisher: {
      "@type": "Organization",
      name: "SpecFlow",
      url: SITE_URL,
    },
    blogPost: articles.map((a) => ({
      "@type": "BlogPosting",
      headline: a.title,
      description: a.description,
      url: `${SITE_URL}/blog/${a.slug}`,
      datePublished: a.publishedAt,
      ...(a.updatedAt && { dateModified: a.updatedAt }),
      author: {
        "@type": "Organization",
        name: a.author,
      },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="min-h-screen bg-background text-foreground">
        {/* ── NAV ─────────────────────────────────────────────────────────── */}
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
                aria-current="page"
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

        {/* ── HEADER ──────────────────────────────────────────────────────── */}
        <header className="pt-36 pb-16 px-6 border-b border-border">
          <div className="mx-auto max-w-5xl">
            <p className="font-mono text-xs text-primary uppercase tracking-widest mb-4">
              Blog
            </p>
            <h1
              className="font-serif text-4xl md:text-5xl font-bold leading-tight tracking-tight text-foreground mb-4"
              style={{ fontFamily: "Merriweather, serif" }}
            >
              Méthodes, specs
              <br />
              et product management.
            </h1>
            <p className="text-lg text-muted-foreground font-light max-w-xl">
              Guides pratiques pour rédiger de meilleures spécifications, des
              user stories exploitables et des critères d&apos;acceptance
              précis.
            </p>
          </div>
        </header>

        {/* ── ARTICLES ────────────────────────────────────────────────────── */}
        <main className="py-16 px-6">
          <div className="mx-auto max-w-5xl">
            <ol className="space-y-0 divide-y divide-border" reversed>
              {articles.map((article) => (
                <li key={article.slug}>
                  <Link
                    href={`/blog/${article.slug}`}
                    className="group flex flex-col md:flex-row md:items-start gap-4 py-8 hover:bg-muted/30 -mx-4 px-4 rounded-lg transition-colors"
                  >
                    {/* Date + meta */}
                    <div className="shrink-0 md:w-44">
                      <time
                        dateTime={article.publishedAt}
                        className="font-mono text-xs text-muted-foreground"
                      >
                        {formatDate(article.publishedAt)}
                      </time>
                      <p className="font-mono text-[10px] text-muted-foreground/60 mt-1">
                        {article.readingTime} min de lecture
                      </p>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-mono text-[10px] text-primary bg-primary/8 px-2 py-0.5 rounded">
                          {article.category}
                        </span>
                      </div>
                      <h2 className="text-lg font-semibold text-foreground mb-2 leading-snug group-hover:text-primary transition-colors">
                        {article.title}
                      </h2>
                      <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
                        {article.description}
                      </p>
                      <p className="mt-3 font-mono text-xs text-primary flex items-center gap-1">
                        Lire l&apos;article
                        <svg
                          width="12"
                          height="12"
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
                      </p>
                    </div>
                  </Link>
                </li>
              ))}
            </ol>
          </div>
        </main>

        {/* ── FOOTER ──────────────────────────────────────────────────────── */}
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
