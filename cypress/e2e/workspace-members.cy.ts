// ─── Helpers ──────────────────────────────────────────────────────────────────

import { Invitation, InvitationStatus } from "../../src/generated/prisma";

function uid() {
  return Math.random().toString(36).substring(7);
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("Gestion des membres d'un workspace", () => {
  const id = uid();

  // Utilisateur propriétaire
  const ownerEmail = `test-owner-${id}@example.com`;
  const ownerPassword = "Password123!";

  // Utilisateur membre (invité / à gérer)
  const memberEmail = `test-member-${id}@example.com`;
  const memberPassword = "Password123!";

  const workspaceSlug = `ws-members-${id}`;
  const workspaceName = `Workspace Members ${id}`;

  // Helper pour naviguer vers les paramètres membres du workspace
  function visitMembersTab() {
    cy.task("getWorkspaceId", workspaceSlug).then((workspaceId) => {
      cy.visit(`/settings/workspaces/${workspaceId}`);
    });
    cy.contains("Membres").click();
  }

  before(() => {
    // ── Créer l'utilisateur owner ──
    cy.visit("/sign-up");
    cy.get("#name").type("Owner User");
    cy.get("#email").type(ownerEmail);
    cy.get("#password").type(ownerPassword);
    cy.get("#confirm").type(ownerPassword);
    cy.get('button[type="submit"]').click();
    // Attendre que l'inscription soit confirmée avant de vérifier en DB
    cy.contains("Vérifiez votre email").should("be.visible");
    cy.task("verifyUser", ownerEmail);

    // ── Créer l'utilisateur membre ──
    cy.clearCookies();
    cy.clearLocalStorage();
    cy.visit("/sign-up");
    cy.get("#name").type("Member User");
    cy.get("#email").type(memberEmail);
    cy.get("#password").type(memberPassword);
    cy.get("#confirm").type(memberPassword);
    cy.get('button[type="submit"]').click();
    cy.contains("Vérifiez votre email").should("be.visible");
    cy.task("verifyUser", memberEmail);

    // ── Seed le workspace pour l'owner ──
    cy.task("seedWorkspace", {
      ownerEmail,
      name: workspaceName,
      slug: workspaceSlug,
      type: "AGENCY",
    });

    // ── Seed un second workspace pour le membre (évite la redirection /onboarding) ──
    cy.task("seedWorkspace", {
      ownerEmail: memberEmail,
      name: `Workspace Membre ${id}`,
      slug: `ws-membre-own-${id}`,
      type: "FREELANCE",
    });
  });

  after(() => {
    cy.task("deleteUser", ownerEmail);
    cy.task("deleteUser", memberEmail);
  });

  beforeEach(() => {
    cy.clearCookies();
    cy.clearLocalStorage();
  });

  // ─── Invitations ──────────────────────────────────────────────────────────

  describe("Invitations", () => {
    afterEach(() => {
      // Nettoyage : supprime l'invitation si elle existe encore
      cy.task("deleteInvitation", {
        workspaceSlug,
        email: memberEmail,
      });
    });

    it("l'owner peut inviter un utilisateur par email", () => {
      cy.login(ownerEmail, ownerPassword);
      visitMembersTab();

      cy.contains("Inviter un membre").click();

      cy.get("[role='dialog']").within(() => {
        cy.get('input[type="email"]').type(memberEmail);
        cy.contains("Envoyer l'invitation").click();
      });

      // L'invitation apparaît dans la liste des invitations en attente
      cy.contains("Invitations en attente").should("be.visible");
      cy.contains(memberEmail).should("be.visible");
    });

    it("seul un ADMIN ou OWNER peut accéder au bouton d'invitation", () => {
      // Seed le membre en tant que MEMBER simple
      cy.task("seedMember", {
        workspaceSlug,
        memberEmail,
        role: "MEMBER",
      });

      cy.login(memberEmail, memberPassword);

      cy.task("getWorkspaceId", workspaceSlug).then((workspaceId) => {
        cy.visit(`/settings/workspaces/${workspaceId}`);
      });
      cy.contains("Membres").click();

      // Le bouton n'est pas visible pour un MEMBER simple
      cy.contains("Inviter un membre").should("not.exist");

      // Cleanup
      cy.task("removeMember", { workspaceSlug, memberEmail });
    });

    it("l'owner peut annuler une invitation en attente", () => {
      cy.login(ownerEmail, ownerPassword);
      visitMembersTab();

      // Invite d'abord
      cy.contains("Inviter un membre").click();
      cy.get("[role='dialog']").within(() => {
        cy.get('input[type="email"]').type(memberEmail);
        cy.contains("Envoyer l'invitation").click();
      });

      // Attendre que le dialog se ferme avant d'interagir avec la table
      cy.get("[role='dialog']").should("not.exist");
      cy.contains(memberEmail).should("be.visible");

      // Annule l'invitation
      cy.contains("tr", memberEmail).within(() => {
        cy.contains("Annuler").click();
      });

      // L'invitation disparaît
      cy.contains(memberEmail).should("not.exist");

      // Vérifie en DB
      cy.task("getPendingInvitation", {
        workspaceSlug,
        email: memberEmail,
      }).then((invitation) => {
        expect((invitation as Invitation).status).to.eq(
          InvitationStatus.CANCELLED,
        );
      });
    });

    it("refuse d'inviter un email déjà membre", () => {
      // Seed le membre
      cy.task("seedMember", {
        workspaceSlug,
        memberEmail,
        role: "MEMBER",
      });

      cy.login(ownerEmail, ownerPassword);
      visitMembersTab();

      cy.contains("Inviter un membre").click();
      cy.get("[role='dialog']").within(() => {
        cy.get('input[type="email"]').type(memberEmail);
        cy.contains("Envoyer l'invitation").click();
      });

      // Message d'erreur
      cy.contains("déjà membre").should("be.visible");

      cy.task("removeMember", { workspaceSlug, memberEmail });
    });
  });

  // ─── Gestion des rôles ────────────────────────────────────────────────────

  describe("Gestion des rôles", () => {
    before(() => {
      // Seed le membre en tant que MEMBER pour ces tests
      cy.task("seedMember", {
        workspaceSlug,
        memberEmail,
        role: "MEMBER",
      });
    });

    after(() => {
      cy.task("removeMember", { workspaceSlug, memberEmail });
    });

    it("l'owner peut promouvoir un membre en ADMIN", () => {
      cy.login(ownerEmail, ownerPassword);
      visitMembersTab();

      // Trouve la ligne du membre et ouvre le sélecteur de rôle
      cy.contains("Member User")
        .closest("tr")
        .within(() => {
          cy.get("[role='combobox']").click();
        });

      // Sélectionne ADMIN dans le dropdown (Radix portal, hors du within)
      cy.contains("[role='option']", "Administrateur").click();

      // Vérifie que le rôle est affiché comme Administrateur dans la ligne
      cy.contains("Member User")
        .closest("tr")
        .within(() => {
          cy.contains("Administrateur").should("be.visible");
        });
    });

    it("l'owner peut rétrograder un admin en membre", () => {
      // S'assure que le membre est ADMIN d'abord
      cy.task("seedMember", {
        workspaceSlug,
        memberEmail,
        role: "ADMIN",
      });

      cy.login(ownerEmail, ownerPassword);
      visitMembersTab();

      cy.contains("Member User")
        .closest("tr")
        .within(() => {
          cy.get("[role='combobox']").click();
        });

      cy.contains("[role='option']", "Membre").click();

      cy.contains("Member User")
        .closest("tr")
        .within(() => {
          cy.contains("Membre").should("be.visible");
        });
    });

    it("un membre ne peut pas modifier son propre rôle", () => {
      cy.login(memberEmail, memberPassword);

      cy.task("getWorkspaceId", workspaceSlug).then((workspaceId) => {
        cy.visit(`/settings/workspaces/${workspaceId}`);
      });
      cy.contains("Membres").click();

      // Pour sa propre ligne, le Select n'est pas rendu (Badge à la place)
      cy.contains("tr", "Member User").within(() => {
        cy.get("[role='combobox']").should("not.exist");
      });
    });

    it("un member ne peut pas voir les contrôles de gestion des autres membres", () => {
      cy.login(memberEmail, memberPassword);

      cy.task("getWorkspaceId", workspaceSlug).then((workspaceId) => {
        cy.visit(`/settings/workspaces/${workspaceId}`);
      });
      cy.contains("Membres").click();

      // Vérifie que le bouton "Retirer" n'est pas visible sur les autres membres
      cy.contains("Owner User")
        .closest("tr")
        .within(() => {
          cy.contains("Retirer").should("not.exist");
        });
    });
  });

  // ─── Retrait de membre ────────────────────────────────────────────────────

  describe("Retrait et départ", () => {
    beforeEach(() => {
      // Seed le membre pour chaque test de cette section
      cy.task("seedMember", {
        workspaceSlug,
        memberEmail,
        role: "MEMBER",
      });
    });

    afterEach(() => {
      cy.task("removeMember", { workspaceSlug, memberEmail });
    });

    it("l'owner peut retirer un membre du workspace", () => {
      cy.login(ownerEmail, ownerPassword);
      visitMembersTab();

      cy.contains("Member User")
        .closest("tr")
        .within(() => {
          cy.contains("Retirer").click();
        });

      // Le membre n'apparaît plus dans la liste (action directe, pas de dialog)
      cy.contains("Member User").should("not.exist");
    });

    it("un membre peut quitter le workspace", () => {
      cy.login(memberEmail, memberPassword);

      cy.task("getWorkspaceId", workspaceSlug).then((workspaceId) => {
        cy.visit(`/settings/workspaces/${workspaceId}`);
        cy.contains("Membres").click();

        // Le membre peut se retirer lui-même
        cy.contains("tr", "Member User").within(() => {
          cy.contains("Quitter").click();
        });

        // Redirigé vers la liste des workspaces (sans ID de workspace dans l'URL)
        cy.url().should("not.include", workspaceId as string);
      });
    });

    it("l'owner ne peut pas être retiré", () => {
      cy.login(ownerEmail, ownerPassword);
      visitMembersTab();

      // La ligne de l'owner n'a pas de bouton "Retirer"
      cy.contains("tr", "Owner User").within(() => {
        cy.contains("Retirer").should("not.exist");
      });
    });
  });

  // ─── Affichage de la liste des membres ────────────────────────────────────

  describe("Affichage des membres", () => {
    before(() => {
      cy.task("seedMember", {
        workspaceSlug,
        memberEmail,
        role: "MEMBER",
      });
    });

    after(() => {
      cy.task("removeMember", { workspaceSlug, memberEmail });
    });

    it("affiche tous les membres avec leur rôle", () => {
      cy.login(ownerEmail, ownerPassword);
      visitMembersTab();

      // Owner visible avec son rôle
      cy.contains("Owner User").should("be.visible");
      cy.contains("Propriétaire").should("be.visible");

      // Membre visible avec son rôle
      cy.contains("Member User").should("be.visible");
      cy.contains("Membre").should("be.visible");
    });

    it("affiche le nombre de membres correct dans l'onglet", () => {
      cy.login(ownerEmail, ownerPassword);

      cy.task("getWorkspaceId", workspaceSlug).then((workspaceId) => {
        cy.visit(`/settings/workspaces/${workspaceId}`);
      });

      // L'onglet membres doit indiquer 2 membres (owner + member)
      cy.contains("Membres (2)").should("be.visible");
    });
  });
});
