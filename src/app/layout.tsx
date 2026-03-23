import type { Metadata } from "next";
import "./globals.css";

const SITE_URL = "https://specflow.io";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "SpecFlow — Spécifications fonctionnelles générées par IA",
    template: "%s | SpecFlow",
  },
  description:
    "SpecFlow génère des spécifications fonctionnelles complètes (user stories MoSCoW, critères Gherkin, personas) à partir de votre brief en 30 secondes.",
  alternates: {
    canonical: SITE_URL,
  },
  openGraph: {
    title: "SpecFlow — Vos specs en 30 minutes. Pas 3 jours.",
    description:
      "SpecFlow génère des spécifications fonctionnelles complètes (user stories MoSCoW, critères Gherkin, personas) à partir de votre brief en 30 secondes.",
    url: SITE_URL,
    siteName: "SpecFlow",
    locale: "fr_FR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "SpecFlow — Vos specs en 30 minutes. Pas 3 jours.",
    description:
      "SpecFlow génère des spécifications fonctionnelles complètes (user stories MoSCoW, critères Gherkin, personas) à partir de votre brief en 30 secondes.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-snippet": -1,
      "max-image-preview": "large",
      "max-video-preview": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "SpecFlow",
    url: SITE_URL,
    description:
      "Génération de spécifications fonctionnelles par IA — user stories, critères Gherkin, personas.",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE_URL}/blog?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <html lang="fr">
      <body className="antialiased">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {children}
      </body>
    </html>
  );
}
