import { generateUid } from "../support/utils";

describe("Pages /settings", () => {
  const id = generateUid();
  const userEmail = `test-settings-${id}@example.com`;
  const userPassword = "Password123!";
  const userName = "Settings User";
  const workspaceSlug = `ws-settings-${id}`;
  const workspaceName = `Workspace Settings ${id}`;

  before(() => {
    cy.visit("/sign-up");
    cy.get("#name").type(userName);
    cy.get("#email").type(userEmail);
    cy.get("#password").type(userPassword);
    cy.get("#confirm").type(userPassword);
    cy.get('button[type="submit"]').click();
    cy.contains("Vérifiez votre email").should("be.visible");

    cy.task("verifyUser", userEmail);
    cy.task("seedWorkspace", {
      ownerEmail: userEmail,
      name: workspaceName,
      slug: workspaceSlug,
      type: "AGENCY",
    });
    cy.task("setActiveWorkspace", { email: userEmail, slug: workspaceSlug });
  });

  after(() => {
    cy.task("deleteUser", userEmail);
  });

  beforeEach(() => {
    cy.login(userEmail, userPassword);
  });

  // ─── /settings ────────────────────────────────────────────────────────────

  describe("/settings", () => {
    it("affiche les liens vers Profil, Facturation et Intégrations", () => {
      cy.visit("/settings");

      cy.contains("Paramètres").should("be.visible");
      cy.contains("Profil").should("be.visible");
      cy.contains("Facturation").should("be.visible");
      cy.contains("Intégrations").should("be.visible");
    });

    it("navigue vers /settings/profile depuis le lien Profil", () => {
      cy.visit("/settings");
      cy.contains("a", "Profil").click();
      cy.url().should("include", "/settings/profile");
    });

    it("navigue vers /settings/billing depuis le lien Facturation", () => {
      cy.visit("/settings");
      cy.contains("a", "Facturation").click();
      cy.url().should("include", "/settings/billing");
    });

    it("navigue vers /settings/integrations depuis le lien Intégrations", () => {
      cy.visit("/settings");
      cy.contains("a", "Intégrations").click();
      cy.url().should("include", "/settings/integrations");
    });
  });

  // ─── /settings/integrations ───────────────────────────────────────────────

  describe("/settings/integrations", () => {
    beforeEach(() => {
      cy.visit("/settings/integrations");
    });

    it("affiche le titre de la page", () => {
      cy.contains("h1", "Intégrations").should("be.visible");
    });

    it("affiche l'intégration Notion", () => {
      cy.contains("Notion").should("be.visible");
    });

    it("affiche l'intégration GitHub", () => {
      cy.contains("GitHub").should("be.visible");
    });

    it("affiche l'intégration Trello", () => {
      cy.contains("Trello").should("be.visible");
    });

    it("affiche l'intégration ClickUp", () => {
      cy.contains("ClickUp").should("be.visible");
    });

    it("affiche l'intégration Jira", () => {
      cy.contains("Jira").should("be.visible");
    });

    it("affiche les boutons de connexion pour les intégrations non connectées", () => {
      cy.contains("Connecter").should("be.visible");
    });
  });

  // ─── /settings/billing ────────────────────────────────────────────────────

  describe("/settings/billing", () => {
    beforeEach(() => {
      cy.visit("/settings/billing");
    });

    it("affiche le titre de la page", () => {
      cy.contains("h1", "Facturation").should("be.visible");
    });

    it("affiche le plan actuel", () => {
      cy.contains("Plan actuel").should("be.visible");
      cy.contains("Gratuit").should("be.visible");
    });

    it("affiche la section utilisation avec le compteur de specs", () => {
      cy.contains("Utilisation ce mois-ci").should("be.visible");
      cy.contains("Specs générées").should("be.visible");
      // Plan FREE : affiche X / 3
      cy.contains(/\d+ \/ 3/).should("be.visible");
    });

    it("affiche le bouton Passer au Pro pour un plan FREE", () => {
      cy.contains("Passer au Pro").should("be.visible");
    });

    it("n'affiche pas le bouton Gérer mon abonnement pour un plan FREE", () => {
      cy.contains("Gérer mon abonnement").should("not.exist");
    });

    it("affiche le compteur de specs correct après création d'une spec", () => {
      cy.task("seedSpec", {
        workspaceSlug,
        ownerEmail: userEmail,
        title: "Spec de test billing",
        prompt: "Une spec pour tester le compteur de billing",
      }).then((specId) => {
        cy.visit("/settings/billing");
        cy.contains(/[1-9]\d* \/ 3/).should("be.visible");
        cy.task("deleteSpec", specId as string);
      });
    });
  });

  // ─── /settings/profile ────────────────────────────────────────────────────

  describe("/settings/profile", () => {
    beforeEach(() => {
      cy.visit("/settings/profile");
    });

    it("affiche le titre de la page", () => {
      cy.contains("h1", "Profil").should("be.visible");
    });

    it("affiche le nom et l'email de l'utilisateur", () => {
      cy.contains(userName).should("be.visible");
      cy.contains(userEmail).should("be.visible");
    });

    it("affiche le formulaire de modification du nom", () => {
      cy.contains("Nom complet").should("be.visible");
      cy.get("#name").should("have.value", userName);
    });

    it("met à jour le nom de l'utilisateur", () => {
      const newName = `Settings User ${generateUid()}`;

      cy.get("#name").clear().type(newName);
      cy.contains("button", "Enregistrer").first().click();
      cy.contains("Profil mis à jour.").should("be.visible");

      // Restaure le nom original
      cy.get("#name").clear().type(userName);
      cy.contains("button", "Enregistrer").first().click();
    });

    it("affiche la section Sécurité avec le formulaire de changement de mot de passe", () => {
      cy.contains("h2", "Sécurité").should("be.visible");
      cy.contains("Modifier votre mot de passe").should("not.exist"); // label alternatif
      cy.contains("Mot de passe actuel").should("be.visible");
      cy.contains("Nouveau mot de passe").should("be.visible");
      cy.contains("Confirmer").should("be.visible");
      cy.contains("button", "Changer le mot de passe").should("be.visible");
    });

    it("affiche une erreur si les mots de passe ne correspondent pas", () => {
      cy.get("#current").type(userPassword);
      cy.get("#new").type("NewPassword123!");
      cy.get("#confirm").type("DifferentPassword!");
      cy.contains("button", "Changer le mot de passe").click();
      cy.contains("Les mots de passe ne correspondent pas.").should(
        "be.visible",
      );
    });

    it("affiche la zone dangereuse avec le bouton de suppression de compte", () => {
      cy.contains("h2", "Zone dangereuse").scrollIntoView().should("be.visible");
      cy.contains("button", "Supprimer mon compte").scrollIntoView().should("be.visible");
    });

    it("affiche la dialog de confirmation de suppression de compte", () => {
      cy.contains("button", "Supprimer mon compte").click();
      cy.get("[role='dialog']").within(() => {
        cy.contains("Supprimer le compte").should("be.visible");
        cy.contains("Cette action est irréversible").should("be.visible");
        cy.contains("supprimer").should("be.visible");
        cy.contains("button", "Supprimer définitivement").should("be.disabled");
      });
      // Ferme la dialog
      cy.contains("button", "Annuler").click();
    });

    it("active le bouton de suppression après saisie du mot de confirmation", () => {
      cy.contains("button", "Supprimer mon compte").click();
      cy.get("[role='dialog']").within(() => {
        cy.get("input").type("supprimer");
        cy.contains("button", "Supprimer définitivement").should(
          "not.be.disabled",
        );
      });
      cy.contains("button", "Annuler").click();
    });
  });
});
