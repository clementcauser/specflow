import type { Metadata } from "next";
import "./globals.css";
// Note: use next/font/google to load Merriweather with preloading in production:
// import { Merriweather } from "next/font/google";
// const merriweather = Merriweather({ subsets: ["latin"], weight: ["300","400","700","900"], style: ["normal","italic"], variable: "--font-serif", display: "swap" });

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://specflow.app";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "SpecFlow — Spécifications fonctionnelles IA en 30 minutes",
    template: "%s | SpecFlow",
  },
  description:
    "Générez des spécifications fonctionnelles complètes — user stories MoSCoW, critères Gherkin, personas — en 30 secondes grâce à l'IA. De brief à spec en 3 étapes, sans carte bancaire.",
  keywords: [
    "spécifications fonctionnelles",
    "user stories",
    "critères Gherkin",
    "spec technique",
    "IA",
    "product manager",
    "chef de projet",
    "MoSCoW",
    "backlog",
    "générateur de spec",
  ],
  authors: [{ name: "SpecFlow" }],
  creator: "SpecFlow",
  publisher: "SpecFlow",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-snippet": -1,
      "max-image-preview": "large",
    },
  },
  openGraph: {
    type: "website",
    locale: "fr_FR",
    url: BASE_URL,
    siteName: "SpecFlow",
    title: "SpecFlow — Spécifications fonctionnelles IA en 30 minutes",
    description:
      "Générez des spécifications fonctionnelles complètes — user stories, critères Gherkin, personas — en 30 secondes grâce à l'IA.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "SpecFlow — Générateur de spécifications fonctionnelles par IA",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "SpecFlow — Spécifications fonctionnelles IA en 30 minutes",
    description:
      "Générez des spécifications fonctionnelles complètes en 30 secondes grâce à l'IA. User stories, Gherkin, personas.",
    images: ["/og-image.png"],
  },
  alternates: {
    canonical: BASE_URL,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className="antialiased">{children}</body>
    </html>
  );
}
