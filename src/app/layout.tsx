import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SpecFlow",
  description: "Générez vos spécifications techniques en un clin d'œil",
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
