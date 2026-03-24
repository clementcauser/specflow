import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Site en maintenance | SpecFlow",
  description: "SpecFlow est temporairement indisponible. Nous serons bientôt de retour.",
  robots: { index: false, follow: false },
};

export default function MaintenancePage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center px-6 relative overflow-hidden">
      {/* Radial background */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 80% 50% at 50% -10%, oklch(0.5854 0.2041 277.1173 / 0.07), transparent)",
        }}
      />

      <div className="relative flex flex-col items-center text-center max-w-lg">
        {/* Logo */}
        <span className="font-mono text-xl font-semibold mb-12 tracking-tight">
          Spec<span className="text-primary">Flow</span>
        </span>

        {/* Status badge */}
        <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-1.5 mb-8">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
          <span className="font-mono text-xs text-muted-foreground">
            Maintenance en cours
          </span>
        </div>

        {/* Headline */}
        <h1
          className="font-serif text-4xl md:text-5xl font-bold leading-tight tracking-tight text-foreground mb-4"
          style={{ fontFamily: "Merriweather, serif" }}
        >
          Site temporairement
          <br />
          <span className="text-primary italic">indisponible.</span>
        </h1>

        {/* Description */}
        <p className="text-muted-foreground font-light text-lg leading-relaxed mt-4 mb-2">
          Nous effectuons une maintenance pour améliorer votre expérience.
        </p>
        <p className="text-foreground font-normal text-base">
          SpecFlow sera de nouveau disponible très bientôt.
        </p>

        {/* Divider */}
        <div className="w-12 h-px bg-border my-10" />

        {/* Footer note */}
        <p className="font-mono text-xs text-muted-foreground">
          Merci pour votre patience — à tout de suite.
        </p>
      </div>
    </div>
  );
}
