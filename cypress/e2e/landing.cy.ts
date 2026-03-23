describe.skip("Landing page", () => {
  beforeEach(() => {
    cy.visit("/");
  });

  // ── Navigation ──────────────────────────────────────────────────────────

  it("affiche le logo SpecFlow dans la navbar", () => {
    cy.get("nav").first().contains("SpecFlow").should("be.visible");
  });

  it("affiche tous les liens de navigation", () => {
    cy.contains("Comment ça marche").should("be.visible");
    cy.contains("Fonctionnalités").should("be.visible");
    cy.contains("Tarifs").should("be.visible");
    cy.contains("Blog").should("be.visible");
  });

  it("navigue vers /blog depuis le lien nav", () => {
    cy.contains("a", "Blog").first().click();
    cy.url().should("include", "/blog");
  });

  // ── Hero ────────────────────────────────────────────────────────────────

  it("affiche le titre principal de la hero section", () => {
    cy.get("h1").should("contain", "30 minutes");
  });

  it("affiche les deux CTAs de la hero section", () => {
    cy.contains("a", "Essayer gratuitement").should(
      "have.attr",
      "href",
      "/register",
    );
    cy.contains("a", "Voir comment ça marche").should("be.visible");
  });

  it("affiche la mention 'Sans carte bancaire'", () => {
    cy.contains("Sans carte bancaire").should("be.visible");
  });

  // ── Sections ────────────────────────────────────────────────────────────

  it('la section "Comment ça marche" est présente', () => {
    cy.get("#how").should("exist");
    cy.get("#how").contains("trois étapes").should("be.visible");
  });

  it('le lien "Voir comment ça marche" scrolle vers #how', () => {
    cy.contains("a", "Voir comment ça marche").click();
    cy.url().should("include", "#how");
  });

  it("la section fonctionnalités liste les 6 sections générées", () => {
    cy.get("#output").within(() => {
      cy.contains("Résumé exécutif").should("be.visible");
      cy.contains("Personas").should("be.visible");
      cy.contains("User stories MoSCoW").should("be.visible");
      cy.contains("Critères Gherkin").should("be.visible");
      cy.contains("Hors-périmètre").should("be.visible");
      cy.contains("Questions de clarification").should("be.visible");
    });
  });

  it("la section pricing affiche les 3 plans", () => {
    cy.get("#pricing").within(() => {
      cy.contains("Free").should("be.visible");
      cy.contains("Pro").should("be.visible");
      cy.contains("Max").should("be.visible");
    });
  });

  it("le plan Pro est mis en avant", () => {
    cy.contains("Le plus populaire").should("be.visible");
  });

  it("les CTAs pricing pointent vers /register", () => {
    cy.get("#pricing")
      .find('a[href="/register"]')
      .should("have.length.at.least", 2);
  });

  // ── Footer ───────────────────────────────────────────────────────────────

  it("le footer contient le copyright SpecFlow", () => {
    cy.get("footer").last().contains("SpecFlow").should("be.visible");
  });

  it("le footer contient les liens légaux", () => {
    cy.get("footer")
      .last()
      .within(() => {
        cy.contains("Mentions légales").should("be.visible");
        cy.contains("Confidentialité").should("be.visible");
      });
  });
});
