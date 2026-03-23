import Link from "next/link";

interface PublicNavbarProps {
  activePage?: "blog";
}

export function PublicNavbar({ activePage }: PublicNavbarProps) {
  return (
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
            href="/#output"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Fonctionnalités
          </Link>
          <Link
            href="/#pricing"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Tarifs
          </Link>
          <Link
            href="/blog"
            aria-current={activePage === "blog" ? "page" : undefined}
            className={`text-sm transition-colors ${
              activePage === "blog"
                ? "font-medium text-primary hover:text-primary/80"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Blog
          </Link>
          <Link
            href="/sign-in"
            className="text-sm font-medium text-primary hover:text-primary/80 transition-colors"
          >
            Aller sur SpecFlow
          </Link>
        </div>
      </div>
    </nav>
  );
}
