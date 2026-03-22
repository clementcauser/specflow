import Link from "next/link";
import ReactMarkdown from "react-markdown";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAllPosts, getPostBySlug } from "@/lib/blog";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  return getAllPosts().map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return {};

  const BASE_URL =
    process.env.NEXT_PUBLIC_SITE_URL || "https://specflow.app";

  return {
    title: post.title,
    description: post.description,
    alternates: {
      canonical: `${BASE_URL}/blog/${post.slug}`,
    },
    openGraph: {
      title: post.title,
      description: post.description,
      type: "article",
      publishedTime: post.publishedAt,
      url: `${BASE_URL}/blog/${post.slug}`,
    },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) notFound();

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-background/90 backdrop-blur-md">
        <div className="mx-auto max-w-5xl px-6 h-14 flex items-center justify-between">
          <Link href="/" className="font-mono text-sm font-medium text-foreground">
            Spec<span className="text-primary">Flow</span>
          </Link>
          <div className="flex items-center gap-6">
            <Link
              href="/blog"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
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
        <div className="mx-auto max-w-2xl">
          {/* Back */}
          <Link
            href="/blog"
            className="inline-flex items-center gap-1.5 font-mono text-xs text-muted-foreground hover:text-foreground transition-colors mb-10"
          >
            <svg
              width="12"
              height="12"
              viewBox="0 0 16 16"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M13 8H3M7 4l-4 4 4 4"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Retour au blog
          </Link>

          {/* Header */}
          <header className="mb-12">
            <div className="flex items-center gap-3 mb-5">
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
            <h1 className="font-serif text-3xl md:text-4xl font-bold leading-tight tracking-tight text-foreground mb-4">
              {post.title}
            </h1>
            <p className="text-muted-foreground text-lg font-light leading-relaxed">
              {post.description}
            </p>
          </header>

          {/* Content */}
          <div className="prose prose-neutral dark:prose-invert max-w-none prose-headings:font-serif prose-headings:font-bold prose-headings:tracking-tight prose-h2:text-2xl prose-h3:text-lg prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-code:font-mono prose-pre:bg-muted prose-pre:border prose-pre:border-border prose-blockquote:border-l-primary prose-blockquote:text-muted-foreground">
            <ReactMarkdown>{post.content}</ReactMarkdown>
          </div>

          {/* CTA */}
          <div className="mt-16 rounded-xl border border-border bg-card p-8 text-center">
            <p className="font-mono text-xs text-primary uppercase tracking-widest mb-3">
              SpecFlow
            </p>
            <h2 className="font-serif text-2xl font-bold text-foreground mb-3">
              Générez cette structure automatiquement
            </h2>
            <p className="text-muted-foreground text-sm mb-6 font-light">
              Décrivez votre projet en quelques phrases. SpecFlow génère la
              spec complète — personas, user stories MoSCoW, critères Gherkin
              — en 30 secondes.
            </p>
            <Link
              href="/register"
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors shadow-md"
            >
              Essayer gratuitement — sans CB
              <svg
                width="16"
                height="16"
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
            <p className="font-mono text-xs text-muted-foreground mt-3">
              3 specs offertes · Pas de carte bancaire
            </p>
          </div>
        </div>
      </main>

      <footer className="border-t border-border py-10 px-6">
        <div className="mx-auto max-w-5xl flex flex-wrap items-center justify-between gap-6">
          <Link href="/" className="font-mono text-sm text-muted-foreground">
            Spec<span className="text-primary">Flow</span>
          </Link>
          <nav className="flex gap-6">
            <Link
              href="/blog"
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Blog
            </Link>
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
  );
}
