// Slugs des articles actuellement en production
const ARTICLES = [
  {
    slug: "gherkin-bdd-criteres-acceptance",
    title: "Gherkin et BDD : rédiger des critères d'acceptance exploitables",
    firstH2: "Pourquoi les critères d'acceptance sont souvent inutilisables",
  },
  {
    slug: "user-stories-methode-moscow-prioriser-backlog",
    title:
      "User stories et méthode MoSCoW : prioriser son backlog efficacement",
    firstH2: 'Le piège du "tout est prioritaire"',
  },
  {
    slug: "comment-rediger-specifications-fonctionnelles",
    title:
      "Comment rédiger des spécifications fonctionnelles : le guide complet",
    firstH2: "Pourquoi les spécifications fonctionnelles sont indispensables",
  },
];

const FIRST_ARTICLE = ARTICLES[0];

describe("Blog — liste des articles", () => {
  beforeEach(() => {
    cy.visit("/blog");
  });

  it("affiche le titre de la page blog", () => {
    cy.get("h1").should("contain", "Méthodes");
  });

  it("affiche le lien Blog actif dans la navbar", () => {
    cy.get("nav").first().contains("Blog").should("be.visible");
  });

  it(`affiche les ${ARTICLES.length} articles`, () => {
    cy.get("ol li").should("have.length", ARTICLES.length);
  });

  it("chaque article affiche son titre, sa date et son temps de lecture", () => {
    cy.get("ol li").each(($li) => {
      cy.wrap($li).find("h2").should("not.be.empty");
      cy.wrap($li).contains("min de lecture").should("be.visible");
    });
  });

  it("cliquer sur un article navigue vers sa page", () => {
    cy.get("ol li").first().find("a").click();
    cy.url().should("match", /\/blog\/.+/);
  });

  ARTICLES.forEach(({ slug, title }) => {
    it(`affiche l'article "${title.slice(0, 40)}..."`, () => {
      cy.contains(title).should("be.visible");
    });
  });
});

describe("Blog — lecture d'un article", () => {
  beforeEach(() => {
    cy.visit(`/blog/${FIRST_ARTICLE.slug}`);
  });

  // ── Structure de la page ─────────────────────────────────────────────────

  it("affiche le titre de l'article dans le header", () => {
    cy.get("h1").should("contain", "Gherkin");
  });

  it("affiche le fil d'Ariane avec le lien vers /blog", () => {
    cy.get('nav[aria-label="Fil d\'Ariane"]').within(() => {
      cy.contains("a", "Blog").should("have.attr", "href", "/blog");
    });
  });

  it("affiche la catégorie et le temps de lecture", () => {
    cy.contains("Méthodes agiles").should("be.visible");
    cy.contains("min de lecture").should("be.visible");
  });

  it("affiche le nom de l'auteur", () => {
    cy.contains("Équipe SpecFlow").should("be.visible");
  });

  // ── Contenu de l'article ─────────────────────────────────────────────────

  it("affiche le contenu Markdown rendu", () => {
    cy.get("article").within(() => {
      cy.get("h2").first().should("contain", FIRST_ARTICLE.firstH2);
    });
  });

  it("affiche les tags en bas de l'article", () => {
    cy.contains("Gherkin").should("be.visible");
    cy.contains("BDD").should("be.visible");
  });

  it("affiche le CTA SpecFlow", () => {
    cy.contains("Générez vos specs en 30 minutes").should("be.visible");
    cy.contains("a", "Essayer gratuitement").should(
      "have.attr",
      "href",
      "/register",
    );
  });

  // ── Sidebar TOC ──────────────────────────────────────────────────────────

  it("affiche le sommaire dans la sidebar (desktop)", () => {
    cy.viewport(1280, 720);
    cy.get("aside").should("be.visible");
    cy.get("aside").contains("Sommaire").should("be.visible");
  });

  it("le sommaire liste les sections h2 de l'article", () => {
    cy.viewport(1280, 720);
    cy.get('aside nav[aria-label="Table des matières"] a').should(
      "have.length.at.least",
      3,
    );
  });

  it("un lien du sommaire pointe vers l'ancre correspondante", () => {
    cy.viewport(1280, 720);
    cy.get("aside nav a")
      .first()
      .then(($a) => {
        const href = $a.attr("href");
        expect(href).to.match(/^#/);
      });
  });

  it("la sidebar est masquée sur mobile", () => {
    cy.viewport(375, 812);
    cy.get("aside").should("not.be.visible");
  });

  // ── Navigation entre articles ─────────────────────────────────────────────

  it("affiche la navigation précédent / suivant", () => {
    cy.get('nav[aria-label="Articles précédent et suivant"]').should("exist");
  });

  it('le lien "Article suivant" navigue vers un autre article', () => {
    // gherkin est le plus récent → pas de "Article suivant →" ; on visite l'article du milieu
    cy.visit(`/blog/${ARTICLES[1].slug}`);
    cy.contains("Article suivant →")
      .closest("a")
      .then(($a) => {
        const href = $a.attr("href");
        expect(href).to.match(/^\/blog\/.+/);
        cy.visit(href!);
        cy.url().should("match", /\/blog\/.+/);
      });
  });
});

describe("Blog — navigation entre articles", () => {
  it("peut lire tous les articles en enchaînant les liens", () => {
    ARTICLES.forEach(({ slug, title }) => {
      cy.visit(`/blog/${slug}`);
      cy.get("h1").should("contain", title.slice(0, 20));
    });
  });

  it("le bouton retour blog ramène à /blog", () => {
    cy.visit(`/blog/${FIRST_ARTICLE.slug}`);
    cy.get('nav[aria-label="Fil d\'Ariane"]').contains("a", "Blog").click();
    cy.url().should("include", "/blog");
    cy.url().should("not.match", /\/blog\/.+/);
  });
});
