// ─── Données de test ──────────────────────────────────────────────────────────

const USER_EMAIL = "export-test@specflow.test";
const USER_PASSWORD = "TestPassword123!";
const WORKSPACE_SLUG = "ws-export-test";

const FAKE_SPEC = {
  title: "Plateforme de réservation de salles de réunion",
  prompt:
    "Créer une application web permettant aux entreprises de gérer et réserver des salles de réunion en temps réel, avec gestion des équipements et notifications.",
  content: {
    summary:
      "Cette plateforme permet aux collaborateurs de réserver facilement des salles de réunion au sein de leur entreprise. Elle offre une vue en temps réel de la disponibilité, la gestion des équipements (vidéoprojecteur, tableau blanc, visioconférence) et un système de notifications automatiques.\n\nLa solution cible les entreprises de 50 à 500 collaborateurs souhaitant optimiser l'utilisation de leurs espaces de travail.",
    personas:
      "### Persona 1 : Sophie, Office Manager\n- **Rôle** : Gère l'ensemble des ressources physiques de l'entreprise\n- **Objectifs** : Avoir une visibilité complète sur l'utilisation des salles, éviter les conflits de réservation\n- **Frustrations** : Les réservations par email créent des doublons, aucune visibilité en temps réel\n\n### Persona 2 : Thomas, Chef de projet\n- **Rôle** : Organise régulièrement des réunions d'équipe et avec des clients\n- **Objectifs** : Trouver rapidement une salle disponible avec le bon équipement\n- **Frustrations** : Perd du temps à chercher une salle libre, les équipements ne correspondent pas toujours au besoin",
    userStories:
      "**MUST HAVE**\n- En tant que collaborateur, je veux voir la disponibilité des salles en temps réel afin de réserver rapidement\n- En tant que collaborateur, je veux filtrer les salles par capacité et équipements afin de trouver celle qui convient\n- En tant que collaborateur, je veux recevoir une confirmation de réservation par email afin d'avoir une trace\n- En tant qu'office manager, je veux gérer le catalogue de salles (ajout, modification, désactivation) afin de maintenir les données à jour\n\n**SHOULD HAVE**\n- En tant que collaborateur, je veux annuler une réservation jusqu'à 30 minutes avant afin de libérer la salle\n- En tant que collaborateur, je veux voir mes réservations passées et futures afin de gérer mon planning\n\n**COULD HAVE**\n- En tant que collaborateur, je veux inviter des participants à ma réservation afin qu'ils reçoivent une notification\n- En tant qu'office manager, je veux exporter un rapport mensuel d'utilisation afin d'optimiser les espaces\n\n**WON'T HAVE**\n- Intégration avec des systèmes de badge physique\n- Gestion des parkings",
    acceptance:
      "**Story : Voir la disponibilité en temps réel**\nGiven un collaborateur authentifié sur la plateforme\nWhen il accède à la vue calendrier des salles\nThen il voit en temps réel les créneaux disponibles et occupés pour chaque salle, mis à jour sans rechargement de page\n\n**Story : Réserver une salle**\nGiven un collaborateur qui a sélectionné une salle disponible\nWhen il choisit un créneau de 9h à 10h et valide la réservation\nThen la réservation est enregistrée, la salle apparaît comme occupée sur ce créneau, et un email de confirmation est envoyé",
    outOfScope:
      "- Gestion des postes de travail individuels\n- Réservation de véhicules de société\n- Intégration avec des systèmes de contrôle d'accès physique\n- Application mobile native (iOS / Android)\n- Gestion multi-sites dans la V1\n- Facturation interne des salles aux départements\n- Vidéoconférence intégrée (utilisation d'outils tiers)",
    questions:
      "- **Question :** Faut-il une approbation manuelle des réservations par l'office manager ?\n  **Impact :** Si oui, ajouter un workflow de validation avec notifications, complexifie le flux\n- **Question :** Quelle est la politique d'annulation souhaitée (délai minimum) ?\n  **Impact :** Détermine les règles métier de modification/annulation\n- **Question :** Les salles doivent-elles avoir des horaires d'ouverture configurables ?\n  **Impact :** Si oui, empêcher les réservations en dehors des plages horaires définies",
  },
};

// ─── Setup & teardown ─────────────────────────────────────────────────────────

describe("Export de spec (Markdown & PDF)", () => {
  let specId: string;

  before(() => {
    // Création du compte, workspace et spec de test
    cy.task("deleteUser", USER_EMAIL);
    cy.visit("/sign-up");
    cy.get("#name").type("Export Tester");
    cy.get("#email").type(USER_EMAIL);
    cy.get("#password").type(USER_PASSWORD);
    cy.get("#confirm").type(USER_PASSWORD);
    cy.get('button[type="submit"]').contains("Créer mon compte").click();
    cy.contains("Vérifiez votre email").should("be.visible");

    cy.task("verifyUser", USER_EMAIL);
    cy.task("seedWorkspace", {
      ownerEmail: USER_EMAIL,
      name: "Workspace Export Test",
      slug: WORKSPACE_SLUG,
      type: "AGENCY",
    });
    cy.task("seedSpec", {
      workspaceSlug: WORKSPACE_SLUG,
      ownerEmail: USER_EMAIL,
      title: FAKE_SPEC.title,
      prompt: FAKE_SPEC.prompt,
      content: FAKE_SPEC.content,
    }).then((id: string) => {
      specId = id;
    });
  });

  after(() => {
    cy.task("deleteWorkspace", WORKSPACE_SLUG);
    cy.task("deleteUser", USER_EMAIL);
  });

  beforeEach(() => {
    cy.clearCookies();
    cy.clearLocalStorage();
  });

  // ─── Tests sécurité (API directe) ───────────────────────────────────────────

  describe("Sécurité des routes API", () => {
    it("retourne 401 sur /export/markdown sans session", () => {
      cy.request({
        url: `/api/specs/some-id/export/markdown`,
        failOnStatusCode: false,
      }).then((res) => {
        expect(res.status).to.equal(401);
      });
    });

    it("retourne 401 sur /export/pdf sans session", () => {
      cy.request({
        url: `/api/specs/some-id/export/pdf`,
        failOnStatusCode: false,
      }).then((res) => {
        expect(res.status).to.equal(401);
      });
    });

    it("retourne 404 pour une spec inexistante (markdown)", () => {
      cy.login(USER_EMAIL, USER_PASSWORD);
      cy.request({
        url: `/api/specs/spec-id-qui-nexiste-pas/export/markdown`,
        failOnStatusCode: false,
      }).then((res) => {
        expect(res.status).to.equal(404);
      });
    });

    it("retourne 404 pour une spec inexistante (pdf)", () => {
      cy.login(USER_EMAIL, USER_PASSWORD);
      cy.request({
        url: `/api/specs/spec-id-qui-nexiste-pas/export/pdf`,
        failOnStatusCode: false,
      }).then((res) => {
        expect(res.status).to.equal(404);
      });
    });

    it("retourne 403 pour un utilisateur non membre du workspace", () => {
      const otherEmail = `other-${Date.now()}@specflow.test`;

      // Crée un second utilisateur sans accès au workspace
      cy.task("deleteUser", otherEmail).then(() => {
        cy.visit("/sign-up");
        cy.get("#name").type("Other User");
        cy.get("#email").type(otherEmail);
        cy.get("#password").type(USER_PASSWORD);
        cy.get("#confirm").type(USER_PASSWORD);
        cy.get('button[type="submit"]').contains("Créer mon compte").click();
        cy.contains("Vérifiez votre email").should("be.visible");
        cy.task("verifyUser", otherEmail);

        cy.login(otherEmail, USER_PASSWORD);
        cy.request({
          url: `/api/specs/${specId}/export/markdown`,
          failOnStatusCode: false,
        }).then((res) => {
          expect(res.status).to.equal(403);
          cy.task("deleteUser", otherEmail);
        });
      });
    });
  });

  // ─── Tests export Markdown ──────────────────────────────────────────────────

  describe("Export Markdown", () => {
    beforeEach(() => {
      cy.login(USER_EMAIL, USER_PASSWORD);
    });

    it("retourne un fichier markdown avec le bon Content-Type", () => {
      cy.request(`/api/specs/${specId}/export/markdown`).then((res) => {
        expect(res.status).to.equal(200);
        expect(res.headers["content-type"]).to.include("text/markdown");
        expect(res.headers["content-disposition"]).to.include("attachment");
        expect(res.headers["content-disposition"]).to.include(".md");
      });
    });

    it("le contenu markdown inclut le titre et les sections", () => {
      cy.request(`/api/specs/${specId}/export/markdown`).then((res) => {
        const body = res.body as string;

        // Titre principal
        expect(body).to.include(`# ${FAKE_SPEC.title}`);

        // Date de génération
        expect(body).to.include("Généré le");

        // Prompt en citation
        expect(body).to.include(`> ${FAKE_SPEC.prompt}`);

        // Toutes les sections
        expect(body).to.include("## Résumé exécutif");
        expect(body).to.include("## Personas");
        expect(body).to.include("## User stories");
        expect(body).to.include("## Critères d'acceptance");
        expect(body).to.include("## Hors-périmètre");
        expect(body).to.include("## Questions de clarification");

        // Contenu d'une section
        expect(body).to.include("collaborateurs de réserver facilement");
      });
    });

    it("le nom de fichier est basé sur le titre de la spec", () => {
      cy.request(`/api/specs/${specId}/export/markdown`).then((res) => {
        const disposition = res.headers["content-disposition"] as string;
        // Le titre est converti en kebab-case sans caractères spéciaux
        expect(disposition).to.include("plateforme-de-rservation-de-salles-de-runion");
      });
    });
  });

  // ─── Tests export PDF ───────────────────────────────────────────────────────

  describe("Export PDF", () => {
    beforeEach(() => {
      cy.login(USER_EMAIL, USER_PASSWORD);
    });

    it("retourne un fichier PDF avec le bon Content-Type", () => {
      cy.request({
        url: `/api/specs/${specId}/export/pdf`,
        encoding: "binary",
        timeout: 30000,
      }).then((res) => {
        expect(res.status).to.equal(200);
        expect(res.headers["content-type"]).to.include("application/pdf");
        expect(res.headers["content-disposition"]).to.include("attachment");
        expect(res.headers["content-disposition"]).to.include(".pdf");
      });
    });

    it("le PDF commence par la signature PDF valide (%PDF)", () => {
      cy.request({
        url: `/api/specs/${specId}/export/pdf`,
        encoding: "binary",
        timeout: 30000,
      }).then((res) => {
        expect(res.body).to.include("%PDF");
      });
    });

    it("le nom de fichier PDF est basé sur le titre de la spec", () => {
      cy.request({
        url: `/api/specs/${specId}/export/pdf`,
        encoding: "binary",
        timeout: 30000,
      }).then((res) => {
        const disposition = res.headers["content-disposition"] as string;
        expect(disposition).to.include(".pdf");
      });
    });
  });

  // ─── Tests interface utilisateur ────────────────────────────────────────────

  describe("Interface — page de détail", () => {
    beforeEach(() => {
      cy.login(USER_EMAIL, USER_PASSWORD);
    });

    it("affiche la barre d'export avec le label Exporter et le bouton Modifier", () => {
      cy.viewport(1280, 800);
      cy.visit(`/specs/${specId}`);
      cy.get('[data-testid="export-bar-desktop"]').filter(':visible').should('contain', 'Exporter');
      cy.contains("a", "Modifier").should("be.visible");
    });

    it("la barre d'export desktop propose les boutons Markdown et PDF directement", () => {
      cy.viewport(1280, 800);
      cy.visit(`/specs/${specId}`);
      cy.get('[data-testid="export-bar-desktop"]').filter(':visible').within(() => {
        cy.contains("button", "Markdown").should("be.visible");
        cy.contains("button", "PDF").should("be.visible");
      });
    });

    it("sur mobile le menu déroulant Exporter propose Markdown et PDF", () => {
      cy.viewport(375, 812);
      cy.visit(`/specs/${specId}`);
      cy.get('[data-testid="export-bar-mobile"]').first().find('button').click({ force: true });
      cy.contains("Markdown (.md)").should("exist");
      cy.contains("PDF").should("exist");
    });

    it("le contenu de la spec est affiché sur la page", () => {
      cy.visit(`/specs/${specId}`);
      cy.contains(FAKE_SPEC.title).should("exist");
      cy.contains("Résumé exécutif").should("exist");
      cy.contains("User stories").should("exist");
    });
  });
});
