import Link from "next/link";
import type { Metadata } from "next";
import { getAllPosts } from "@/lib/blog";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

export const metadata: Metadata = {
  title: "Blog — Méthodes et guides pour les product managers",
  description:
    "Guides pratiques sur la rédaction de spécifications fonctionnelles, user stories, critères Gherkin et la gestion de projet agile.",
};

export default function BlogPage() {
  const posts = getAllPosts();

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-background/90 backdrop-blur-md">
        <div className="mx-auto max-w-5xl px-6 h-14 flex items-center justify-between">
          <Link href="/" className="font-mono text-sm font-medium text-foreground">
            Spec<span className="text-primary">Flow</span>
          </Link>
          <div className="flex items-center gap-6">
            <Link href="/blog" className="text-sm text-foreground font-medium">
              Blog
            </Link>
            <Link
              href="/login"
              className="text-sm font-medium text-primary hover:text-primary/80 transition-colors"
            >
              Connexion
            </Link>
          </div>
        </div>
      </nav>

      <main className="pt-28 pb-24 px-6">
        <div className="mx-auto max-w-3xl">
          <p className="font-mono text-xs text-primary uppercase tracking-widest mb-4">
            Blog
          </p>
          <h1 className="font-serif text-4xl md:text-5xl font-bold leading-tight tracking-tight text-foreground mb-4">
            Méthodes & guides
          </h1>
          <p className="text-muted-foreground text-lg font-light mb-16">
            Conseils pratiques pour les product managers et chefs de projet qui
            veulent livrer des specs claires.
          </p>

          <div className="divide-y divide-border">
            {posts.map((post) => (
              <article key={post.slug} className="py-10 group">
                <Link href={`/blog/${post.slug}`}>
                  <div className="flex items-center gap-3 mb-3">
                    {post.category && (
                      <span className="font-mono text-[10px] uppercase tracking-widest text-primary bg-primary/8 border border-primary/15 px-2 py-0.5 rounded">
                        {post.category}
                      </span>
                    )}
                    <span className="font-mono text-xs text-muted-foreground">
                      {format(new Date(post.publishedAt), "d MMMM yyyy", {
                        locale: fr,
                      })}
                    </span>
                    <span className="font-mono text-xs text-muted-foreground">
                      · {post.readingTime} min de lecture
                    </span>
                  </div>
                  <h2 className="font-serif text-xl md:text-2xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors leading-snug">
                    {post.title}
                  </h2>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {post.description}
                  </p>
                  <div className="mt-4 inline-flex items-center gap-1.5 font-mono text-xs text-primary">
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
                  </div>
                </Link>
              </article>
            ))}
          </div>
        </div>
      </main>

      <footer className="border-t border-border py-10 px-6">
        <div className="mx-auto max-w-5xl flex flex-wrap items-center justify-between gap-6">
          <Link href="/" className="font-mono text-sm text-muted-foreground">
            Spec<span className="text-primary">Flow</span>
          </Link>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2 text-xs font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Essayer gratuitement — sans CB
          </Link>
          <span className="font-mono text-xs text-muted-foreground">
            © 2026 SpecFlow
          </span>
        </div>
      </footer>
    </div>
  );
}
