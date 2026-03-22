import Link from “next/link”;

// ─── Static data ──────────────────────────────────────────────────────────────

const PAIN_POINTS = [
{
stat: “2–3”,
unit: “jours”,
title: “Perdus par spec”,
desc: “Entre les réunions de cadrage, les aller-retours client et la rédaction. Pour chaque projet.”,
},
{
stat: “∅”,
unit: “”,
title: “Aucun format standard”,
desc: “Chaque chef de projet rédige à sa façon. Les devs ne savent jamais à quoi s’attendre.”,
},
{
stat: “⅓”,
unit: “”,
title: “Critères souvent absents”,
desc: “Les critères d’acceptance sont flous ou inexistants. On découvre les ambiguïtés en dev.”,
},
];

const STEPS = [
{
n: “01”,
title: “Décris ton projet”,
desc: “Type de projet, stack technique, description libre du besoin. Le formulaire guidé te prend 10 minutes.”,
tag: “4 champs · pas de jargon”,
},
{
n: “02”,
title: “SpecFlow génère”,
desc: “L’IA structure et génère le document complet en 30 à 60 secondes. Chaque section est régénérable.”,
tag: “~45s · streaming temps réel”,
},
{
n: “03”,
title: “Exporte et livre”,
desc: “PDF client-ready, export Notion ou import direct dans Jira. Prêt pour le sprint planning.”,
tag: “PDF · Notion · Jira”,
},
];

const SECTIONS = [
{ icon: “📋”, title: “Résumé exécutif”, desc: “3-4 phrases professionnelles qui posent le contexte. Parfait pour le brief client.”, tag: “toujours inclus” },
{ icon: “👤”, title: “Personas”, desc: “Identifiés automatiquement depuis la description, avec besoins et points de friction.”, tag: “contextuel” },
{ icon: “📝”, title: “User stories MoSCoW”, desc: “Toutes les stories priorisées MUST / SHOULD / COULD / WON’T. Prêtes pour le sprint.”, tag: “priorisé” },
{ icon: “✅”, title: “Critères Gherkin”, desc: “Given / When / Then pour chaque story. Directement utilisables pour les tests.”, tag: “format standard” },
{ icon: “🚫”, title: “Hors-périmètre”, desc: “Ce qui n’est explicitement pas dans le scope. Évite les malentendus en fin de projet.”, tag: “contractuel” },
{ icon: “❓”, title: “Questions de clarification”, desc: “Les points ambigus détectés par l’IA, avec l’impact sur la spec si non répondus.”, tag: “actionnable” },
];

const PLANS = [
{
name: “Free”,
price: “0”,
period: “pour toujours”,
limit: “3 specs offertes — sans CB”,
features: [
{ ok: true,  text: “3 specs (à vie)” },
{ ok: true,  text: “Toutes les sections” },
{ ok: true,  text: “Export PDF” },
{ ok: true,  text: “1 workspace · 1 membre” },
{ ok: false, text: “Export Notion / Jira” },
{ ok: false, text: “Membres d’équipe” },
],
cta: “Commencer gratuitement”,
href: “/register”,
highlight: false,
},
{
name: “Pro”,
price: “29”,
period: “par mois · par workspace”,
limit: “30 specs / mois”,
badge: “Le plus populaire”,
features: [
{ ok: true, text: “30 specs par mois” },
{ ok: true, text: “Toutes les sections” },
{ ok: true, text: “Export PDF + Notion + Jira” },
{ ok: true, text: “Jusqu’à 5 membres” },
{ ok: true, text: “Workspaces illimités” },
{ ok: true, text: “Support prioritaire” },
],
cta: “Essayer 14 jours gratuits”,
href: “/register”,
highlight: true,
},
{
name: “Max”,
price: “79”,
period: “par mois · par workspace”,
limit: “Specs illimitées”,
features: [
{ ok: true, text: “Specs illimitées” },
{ ok: true, text: “Toutes les sections” },
{ ok: true, text: “Export PDF + Notion + Jira” },
{ ok: true, text: “Membres illimités” },
{ ok: true, text: “Templates personnalisés” },
{ ok: true, text: “Support dédié + onboarding” },
],
cta: “Contacter l’équipe”,
href: “/register”,
highlight: false,
},
];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function LandingPage() {
return (
<div className="min-h-screen bg-background text-foreground">

```
  {/* ── NAV ─────────────────────────────────────────────────────────────── */}
  <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-background/90 backdrop-blur-md">
    <div className="mx-auto max-w-5xl px-6 h-14 flex items-center justify-between">
      <span className="font-mono text-sm font-medium text-foreground">
        Spec<span className="text-primary">Flow</span>
      </span>
      <div className="hidden md:flex items-center gap-8">
        <a href="#how" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
          Comment ça marche
        </a>
        <a href="#output" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
          Fonctionnalités
        </a>
        <a href="#pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
          Tarifs
        </a>
        <Link
          href="/login"
          className="text-sm font-medium text-primary hover:text-primary/80 transition-colors"
        >
          Connexion
        </Link>
      </div>
    </div>
  </nav>

  {/* ── ① HERO ──────────────────────────────────────────────────────────── */}
  <section className="pt-36 pb-24 px-6 relative overflow-hidden">
    {/* Subtle radial bg */}
    <div
      className="pointer-events-none absolute inset-0"
      style={{
        background:
          "radial-gradient(ellipse 80% 50% at 50% -10%, oklch(0.5854 0.2041 277.1173 / 0.07), transparent)",
      }}
    />

    <div className="mx-auto max-w-5xl relative">
      {/* Badge */}
      <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-1.5 mb-8">
        <span
          className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"
        />
        <span className="font-mono text-xs text-muted-foreground">
          Propulsé par Claude d'Anthropic
        </span>
      </div>

      {/* Headline */}
      <h1
        className="font-serif text-5xl md:text-7xl font-bold leading-[1.05] tracking-tight text-foreground mb-6"
        style={{ fontFamily: "Merriweather, serif" }}
      >
        Vos specs en{" "}
        <span className="text-primary italic">30 minutes.</span>
        <br />
        Pas 3 jours.
      </h1>

      <p className="text-lg text-muted-foreground max-w-xl mb-10 leading-relaxed font-light">
        SpecFlow génère des spécifications fonctionnelles complètes à partir
        d'un brief.{" "}
        <span className="text-foreground font-normal">
          User stories, critères Gherkin, personas, hors-périmètre
        </span>{" "}
        — en 30 secondes.
      </p>

      <div className="flex flex-wrap items-center gap-4 mb-4">
        <Link
          href="/register"
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors shadow-md"
        >
          Essayer gratuitement
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </Link>
        <a
          href="#how"
          className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-6 py-3 text-sm font-medium text-foreground hover:bg-muted transition-colors"
        >
          Voir comment ça marche
        </a>
      </div>
      <p className="font-mono text-xs text-muted-foreground">
        Sans carte bancaire · 3 specs offertes
      </p>

      {/* Terminal mockup */}
      <div className="mt-16 rounded-xl border border-border bg-card shadow-xl overflow-hidden">
        {/* Bar */}
        <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-muted/40">
          <span className="w-3 h-3 rounded-full bg-red-400" />
          <span className="w-3 h-3 rounded-full bg-amber-400" />
          <span className="w-3 h-3 rounded-full bg-green-400" />
          <span className="flex-1 text-center font-mono text-xs text-muted-foreground">
            specflow — génération en cours
          </span>
        </div>

        {/* Content */}
        <div className="p-6 font-mono text-sm leading-relaxed">
          <p className="text-muted-foreground text-xs mb-3">
            // Projet : Refonte e-commerce · Next.js + Shopify
          </p>
          <p className="text-xs mb-4">
            <span className="text-primary font-medium">generating</span>
            <span className="text-muted-foreground"> → </span>
            <span className="text-green-600 dark:text-green-400">personas</span>
            <span className="text-muted-foreground"> · </span>
            <span className="text-green-600 dark:text-green-400">user_stories</span>
            <span className="text-muted-foreground"> · </span>
            <span className="text-amber-600 dark:text-amber-400">acceptance_criteria</span>
            <span className="inline-block w-1.5 h-3.5 bg-primary ml-1 align-middle animate-pulse" />
          </p>

          {/* Generated block */}
          <div className="rounded-lg border border-border bg-muted/30 p-4">
            <div className="flex items-center gap-3 mb-3">
              <span className="rounded-md bg-primary/10 border border-primary/20 px-2 py-0.5 font-mono text-xs text-primary font-medium">
                USER STORIES
              </span>
              <span className="ml-auto flex items-center gap-1.5 font-mono text-xs text-green-600">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                done — 24 stories
              </span>
            </div>
            <ul className="space-y-2">
              {[
                { p: "MUST",   c: "bg-green-100 text-green-700",  text: "En tant qu'acheteur, je peux filtrer les produits par taille et couleur" },
                { p: "MUST",   c: "bg-green-100 text-green-700",  text: "En tant qu'acheteur, je peux ajouter un produit au panier depuis la fiche" },
                { p: "SHOULD", c: "bg-primary/10 text-primary",    text: "En tant qu'acheteur, je reçois une confirmation par email après commande" },
                { p: "COULD",  c: "bg-amber-100 text-amber-700",  text: "En tant qu'acheteur, je peux sauvegarder une wishlist et la partager" },
              ].map((us, i) => (
                <li key={i} className="flex items-start gap-2 text-xs">
                  <span className={`mt-0.5 shrink-0 rounded px-1.5 py-0.5 text-[10px] font-semibold ${us.c}`}>
                    {us.p}
                  </span>
                  <span className="text-muted-foreground leading-snug">{us.text}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  </section>

  {/* ── ② PROBLÈME ──────────────────────────────────────────────────────── */}
  <section className="py-24 px-6 border-t border-border" id="problem">
    <div className="mx-auto max-w-5xl">
      <p className="font-mono text-xs text-primary uppercase tracking-widest mb-5">
        Le problème
      </p>
      <h2
        className="font-serif text-4xl md:text-5xl font-bold leading-tight tracking-tight text-foreground mb-16"
        style={{ fontFamily: "Merriweather, serif" }}
      >
        Rédiger une spec,<br />
        c'est <span className="text-muted-foreground italic">long, ingrat</span><br />
        et souvent raté.
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-border border border-border rounded-xl overflow-hidden">
        {PAIN_POINTS.map((p, i) => (
          <div key={i} className="bg-card p-8 group hover:bg-muted/40 transition-colors">
            <div className="font-mono text-5xl font-light text-primary/30 mb-4 leading-none">
              {p.stat}
              {p.unit && <span className="text-2xl ml-1">{p.unit}</span>}
            </div>
            <div className="text-base font-semibold text-foreground mb-2">{p.title}</div>
            <div className="text-sm text-muted-foreground leading-relaxed">{p.desc}</div>
          </div>
        ))}
      </div>
    </div>
  </section>

  {/* ── ③ COMMENT ÇA MARCHE ─────────────────────────────────────────────── */}
  <section className="py-24 px-6 border-t border-border" id="how">
    <div className="mx-auto max-w-5xl">
      <p className="font-mono text-xs text-primary uppercase tracking-widest mb-5">
        Le processus
      </p>
      <h2
        className="font-serif text-4xl md:text-5xl font-bold leading-tight tracking-tight text-foreground mb-16"
        style={{ fontFamily: "Merriweather, serif" }}
      >
        De brief à spec<br />en trois étapes.
      </h2>

      <div className="relative grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Connecting line */}
        <div className="hidden md:block absolute top-7 left-[18%] right-[18%] h-px bg-gradient-to-r from-primary/30 via-primary/60 to-primary/30" />

        {STEPS.map((s, i) => (
          <div key={i} className="relative">
            <div className="w-14 h-14 rounded-full border-2 border-border bg-card flex items-center justify-center font-mono text-lg font-medium text-primary mb-6 relative z-10 shadow-sm group-hover:border-primary transition-colors">
              {s.n}
            </div>
            <h3 className="text-base font-semibold text-foreground mb-2">{s.title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed mb-3">{s.desc}</p>
            <span className="font-mono text-xs text-muted-foreground/60">// {s.tag}</span>
          </div>
        ))}
      </div>
    </div>
  </section>

  {/* ── ④ CE QUI EST GÉNÉRÉ ─────────────────────────────────────────────── */}
  <section className="py-24 px-6 border-t border-border" id="output">
    <div className="mx-auto max-w-5xl">
      <p className="font-mono text-xs text-primary uppercase tracking-widest mb-5">
        Le contenu
      </p>
      <div className="flex flex-wrap items-end justify-between gap-6 mb-16">
        <h2
          className="font-serif text-4xl md:text-5xl font-bold leading-tight tracking-tight text-foreground"
          style={{ fontFamily: "Merriweather, serif" }}
        >
          Une spec complète,<br />pas un brouillon.
        </h2>
        <span className="font-mono text-xs text-muted-foreground">
          6 sections · format Gherkin · MoSCoW
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-12">
        {SECTIONS.map((s, i) => (
          <div
            key={i}
            className="group rounded-xl border border-border bg-card p-5 hover:border-primary/40 hover:shadow-md transition-all"
          >
            <div className="w-9 h-9 rounded-lg bg-primary/8 border border-primary/15 flex items-center justify-center text-base mb-4">
              {s.icon}
            </div>
            <h3 className="text-sm font-semibold text-foreground mb-1.5">{s.title}</h3>
            <p className="text-xs text-muted-foreground leading-relaxed mb-3">{s.desc}</p>
            <span className="font-mono text-[10px] text-primary bg-primary/8 px-2 py-0.5 rounded">
              {s.tag}
            </span>
          </div>
        ))}
      </div>

      {/* Gherkin example */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-muted/30">
          <span className="w-3 h-3 rounded-full bg-red-400" />
          <span className="w-3 h-3 rounded-full bg-amber-400" />
          <span className="w-3 h-3 rounded-full bg-green-400" />
          <span className="font-mono text-xs text-muted-foreground ml-2">
            spec_ecommerce.md — Critères d'acceptance
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-[200px_1fr]">
          {/* TOC */}
          <div className="hidden md:block border-r border-border py-3">
            {["Résumé", "Personas", "User stories", "Acceptance", "Hors-périmètre", "Questions"].map(
              (item, i) => (
                <div
                  key={i}
                  className={`flex items-center gap-2.5 px-4 py-2 font-mono text-xs cursor-default transition-colors ${
                    i === 3
                      ? "text-primary bg-primary/8 border-r-2 border-primary"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${i === 3 ? "bg-primary" : "bg-border"}`} />
                  {item}
                </div>
              )
            )}
          </div>
          {/* Content */}
          <div className="p-6 font-mono text-xs leading-relaxed overflow-x-auto">
            <p className="text-muted-foreground mb-4 text-[11px]">
              ## US-04 · Ajout au panier depuis la fiche produit
            </p>
            <div className="rounded-lg bg-muted/40 border border-border p-4 space-y-1">
              <p><span className="text-pink-500 font-medium">Feature:</span> <span className="text-foreground">Ajout au panier</span></p>
              <p className="pt-1"><span className="text-amber-600 font-medium">Scenario:</span> <span className="text-foreground">Ajout d'un produit disponible</span></p>
              <p className="pl-4"><span className="text-primary font-medium">Given</span> <span className="text-muted-foreground">je suis sur la fiche d'un produit en stock</span></p>
              <p className="pl-4"><span className="text-green-600 font-medium">When</span>  <span className="text-muted-foreground">je clique sur "Ajouter au panier"</span></p>
              <p className="pl-4"><span className="text-violet-500 font-medium">Then</span>  <span className="text-muted-foreground">le produit apparaît dans mon panier</span></p>
              <p className="pl-4"><span className="text-violet-500 font-medium">And</span>   <span className="text-muted-foreground">le compteur du panier s'incrémente de 1</span></p>
              <p className="pt-2"><span className="text-amber-600 font-medium">Scenario:</span> <span className="text-foreground">Tentative d'ajout hors stock</span></p>
              <p className="pl-4"><span className="text-primary font-medium">Given</span> <span className="text-muted-foreground">je suis sur la fiche d'un produit épuisé</span></p>
              <p className="pl-4"><span className="text-green-600 font-medium">When</span>  <span className="text-muted-foreground">j'arrive sur la page</span></p>
              <p className="pl-4"><span className="text-violet-500 font-medium">Then</span>  <span className="text-muted-foreground">le bouton "Ajouter au panier" est désactivé</span></p>
              <p className="pl-4"><span className="text-violet-500 font-medium">And</span>   <span className="text-muted-foreground">un badge "Rupture de stock" est visible</span></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>

  {/* ── ⑤ PRICING ───────────────────────────────────────────────────────── */}
  <section className="py-24 px-6 border-t border-border" id="pricing">
    <div className="mx-auto max-w-5xl">
      <div className="text-center mb-16">
        <p className="font-mono text-xs text-primary uppercase tracking-widest mb-4">
          Tarifs
        </p>
        <h2
          className="font-serif text-4xl md:text-5xl font-bold leading-tight tracking-tight text-foreground mb-4"
          style={{ fontFamily: "Merriweather, serif" }}
        >
          Simple. Transparent.<br />Pas de surprise.
        </h2>
        <p className="text-muted-foreground font-light">
          Commencez gratuitement, passez au Pro quand vous êtes prêt.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
        {PLANS.map((plan, i) => (
          <div
            key={i}
            className={`relative rounded-xl border p-8 transition-all ${
              plan.highlight
                ? "border-primary bg-card shadow-lg shadow-primary/10 scale-[1.02]"
                : "border-border bg-card hover:border-primary/30 hover:shadow-md"
            }`}
          >
            {plan.badge && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-4 py-1 font-mono text-[10px] font-semibold text-primary-foreground whitespace-nowrap">
                {plan.badge}
              </div>
            )}

            <p className="font-mono text-xs text-muted-foreground uppercase tracking-widest mb-5">
              {plan.name}
            </p>

            <div className="mb-6">
              <div className="flex items-start gap-0.5 leading-none mb-1">
                <span className="font-mono text-lg text-muted-foreground mt-2">€</span>
                <span
                  className="font-serif text-5xl font-bold text-foreground"
                  style={{ fontFamily: "Merriweather, serif" }}
                >
                  {plan.price}
                </span>
              </div>
              <p className="font-mono text-xs text-muted-foreground">{plan.period}</p>
            </div>

            <div className="rounded-lg bg-primary/8 border border-primary/15 px-3 py-2 font-mono text-xs text-primary mb-6">
              {plan.limit}
            </div>

            <ul className="space-y-0 mb-8 divide-y divide-border">
              {plan.features.map((f, j) => (
                <li key={j} className="flex items-center gap-2.5 py-2.5 text-sm">
                  <span className={f.ok ? "text-green-600" : "text-muted-foreground/40"}>
                    {f.ok ? "✓" : "✗"}
                  </span>
                  <span className={f.ok ? "text-foreground" : "text-muted-foreground/50"}>
                    {f.text}
                  </span>
                </li>
              ))}
            </ul>

            <Link
              href={plan.href}
              className={`block w-full rounded-lg py-2.5 text-center text-sm font-medium transition-colors ${
                plan.highlight
                  ? "bg-primary text-primary-foreground hover:bg-primary/90"
                  : "border border-border text-foreground hover:bg-muted"
              }`}
            >
              {plan.cta}
            </Link>
          </div>
        ))}
      </div>
    </div>
  </section>

  {/* ── CTA FINAL ───────────────────────────────────────────────────────── */}
  <section className="py-24 px-6 border-t border-border">
    <div className="mx-auto max-w-2xl text-center">
      <h2
        className="font-serif text-4xl md:text-5xl font-bold leading-tight tracking-tight text-foreground mb-6"
        style={{ fontFamily: "Merriweather, serif" }}
      >
        Votre prochaine spec<br />
        en <span className="text-primary italic">30 minutes.</span>
      </h2>
      <p className="text-muted-foreground mb-10 font-light text-lg">
        Rejoignez les équipes qui ont arrêté de passer 3 jours sur leurs specs.
      </p>
      <Link
        href="/register"
        className="inline-flex items-center gap-2 rounded-lg bg-primary px-8 py-3.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors shadow-md"
      >
        Essayer gratuitement — sans CB
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </Link>
      <p className="font-mono text-xs text-muted-foreground mt-4">
        3 specs offertes · Pas de carte bancaire
      </p>
    </div>
  </section>

  {/* ── FOOTER ──────────────────────────────────────────────────────────── */}
  <footer className="border-t border-border py-10 px-6">
    <div className="mx-auto max-w-5xl flex flex-wrap items-center justify-between gap-6">
      <span className="font-mono text-sm text-muted-foreground">
        Spec<span className="text-primary">Flow</span>
      </span>
      <nav className="flex gap-6">
        {["Mentions légales", "CGV", "Confidentialité"].map((l) => (
          <a key={l} href="#" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
            {l}
          </a>
        ))}
        <Link href="/login" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
          Connexion
        </Link>
      </nav>
      <span className="font-mono text-xs text-muted-foreground">© 2026 SpecFlow</span>
    </div>
  </footer>

</div>
```

);
}