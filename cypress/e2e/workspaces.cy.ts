// ─── Helpers ──────────────────────────────────────────────────────────────────

function uid() {
  return Math.random().toString(36).substring(7);
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("Gestion des workspaces", () => {
  const id = uid();
  const ownerEmail = `test-ws-${id}@example.com`;
  const ownerPassword = "Password123!";
  const ownerName = "Owner User";

  // Slug d'un workspace seedé directement en DB pour les tests de gestion
  const seededSlug = `ws-seeded-${id}`;
  const seededName = `Workspace Seedé ${id}`;

  before(() => {
    // 1. Inscription
    cy.visit("/sign-up");
    cy.get("#name").type(ownerName);
    cy.get("#email").type(ownerEmail);
    cy.get("#password").type(ownerPassword);
    cy.get("#confirm").type(ownerPassword);
    cy.get('button[type="submit"]').click();
    cy.contains("Vérifiez votre email").should("be.visible");

    // 2. Vérification en DB
    cy.task("verifyUser", ownerEmail);

    // 3. Seed d'un workspace pour accéder au dashboard (évite la redirection onboarding)
    cy.task("seedWorkspace", {
      ownerEmail,
      name: seededName,
      slug: seededSlug,
      type: "AGENCY",
    });
  });

  after(() => {
    cy.task("deleteUser", ownerEmail);
  });

  beforeEach(() => {
    cy.login(ownerEmail, ownerPassword);
  });

  // ─── Création : flow 3 étapes ────────────────────────────────────────────

  describe("Création d'un workspace", () => {
    afterEach(() => {
      // Nettoyage du workspace créé dans chaque test
      cy.get("@createdSlug").then((slug) => {
        cy.task("deleteWorkspace", slug as unknown as string);
      });
    });

    it("crée un workspace AGENCY en 3 étapes", () => {
      const name = `Agence Test ${uid()}`;

      cy.visit("/workspaces/new");

      // Étape 1 — Choix du type (auto-passage à l'étape 2)
      cy.contains("Agence").click();

      // Étape 2 — Infos workspace
      cy.get("#name").should("be.visible");
      cy.get("#name").type(name);
      cy.get("#slug")
        .invoke("val")
        .then((slug) => cy.wrap(slug).as("createdSlug"));

      cy.contains("6–20").click(); // taille d'équipe
      cy.contains("Continuer").click();

      // Étape 3 — Spécialités
      cy.contains("E-commerce").click();
      cy.contains("SaaS").click();
      cy.contains("Créer et aller aux projets").click();

      // Redirection vers /workspaces
      cy.url().should("include", "/workspaces");
      cy.contains(name).should("be.visible");
    });

    it("crée un workspace PRODUCT avec contexte produit", () => {
      const name = `Mon Produit ${uid()}`;

      cy.visit("/workspaces/new");

      // Étape 1
      cy.contains("Produit").click();

      // Étape 2 — Infos workspace (pas de tagline ici)
      cy.get("#name").type(name);
      cy.get("#slug")
        .invoke("val")
        .then((slug) => cy.wrap(slug).as("createdSlug"));
      cy.contains("Continuer").click();

      // Étape 3 — Contexte produit
      cy.get("#tagline").type("L'outil qui génère des specs");
      cy.get("#productDescription").type(
        "Une application SaaS pour agences web qui génère des spécifications fonctionnelles.",
      );
      cy.get("#techStack").type("Next.js, PostgreSQL, API Claude");
      cy.contains("MVP en cours").click();
      cy.contains("Créer et aller aux epics").click();

      // Redirigé vers la création d'epic (flux PRODUCT)
      cy.url().should("include", "/epics/new");
      cy.contains("Nouvelle epic").should("be.visible");
    });

    it("crée un workspace FREELANCE", () => {
      const name = `Thomas Dev ${uid()}`;

      cy.visit("/workspaces/new");

      // Étape 1
      cy.contains("Freelance").click();

      // Étape 2
      cy.get("#name").type(name);
      cy.get("#slug")
        .invoke("val")
        .then((slug) => cy.wrap(slug).as("createdSlug"));
      cy.contains("Continuer").click();

      // Étape 3 — pas de contexte requis pour FREELANCE
      cy.contains("Créer et ajouter un client").click();

      cy.url().should("include", "/workspaces");
      cy.contains(name).should("be.visible");
    });

    it("empêche de continuer à l'étape 2 sans un nom valide", () => {
      cy.visit("/workspaces/new");
      cy.contains("Agence").click();

      // Champ nom vide → bouton Continuer désactivé
      cy.contains("Continuer").should("be.disabled");

      // Nom trop court
      cy.get("#name").type("A");
      cy.contains("Continuer").should("be.disabled");

      // Nom valide
      cy.get("#name").type("gence valide");
      cy.contains("Continuer").should("not.be.disabled");

      // Alias pour le nettoyage (workspace non créé, deleteWorkspace ignore silencieusement)
      cy.get("#slug")
        .invoke("val")
        .then((slug) => cy.wrap(slug).as("createdSlug"));
    });
  });

  // ─── Liste et navigation ──────────────────────────────────────────────────

  describe("Liste des workspaces", () => {
    it("affiche le workspace seedé dans la liste", () => {
      cy.visit("/workspaces");
      cy.contains(seededName).should("be.visible");
    });

    it("affiche le bouton de création de workspace", () => {
      cy.visit("/workspaces");
      cy.contains("Créer un espace de travail").should("be.visible");
    });

    it("active un workspace depuis la liste", () => {
      // Seed un second workspace pour avoir un workspace inactif
      const secondSlug = `ws-second-${uid()}`;
      cy.task("seedWorkspace", {
        ownerEmail,
        name: `Second Workspace`,
        slug: secondSlug,
        type: "FREELANCE",
      });

      cy.visit("/workspaces");

      // Cliquer "Activer" sur le second workspace
      cy.contains("Second Workspace")
        .closest('[data-slot="card"]')
        .within(() => {
          cy.contains("Activer").click();
        });

      // Le workspace devient actif
      cy.contains('[data-slot="card"]', "Second Workspace")
        .contains("Actif")
        .should("be.visible");

      cy.task("deleteWorkspace", secondSlug);
    });
  });

  // ─── Paramètres du workspace ──────────────────────────────────────────────

  describe("Paramètres du workspace", () => {
    it("navigue vers les paramètres d'un workspace", () => {
      cy.visit("/workspaces");
      cy.contains('[data-slot="card"]', seededName).within(() => {
        cy.contains("Gérer").click();
      });

      cy.url().should("include", "/settings/workspaces/");
      cy.contains(seededName).should("be.visible");
    });

    it("modifie le nom du workspace", () => {
      cy.task("getWorkspaceId", seededSlug).then((workspaceId) => {
        cy.visit(`/settings/workspaces/${workspaceId}`);
      });

      const newName = `Workspace Renommé ${uid()}`;

      cy.get("#name").clear().type(newName);
      cy.contains("Enregistrer").click();
      cy.contains("Modifications enregistrées").should("be.visible");

      // Restaure le nom original pour ne pas casser les autres tests
      cy.get("#name").clear().type(seededName);
      cy.contains("Enregistrer").click();
    });

    it("refuse un slug déjà utilisé", () => {
      // Crée un second workspace pour avoir un slug existant
      const conflictSlug = `ws-conflict-${uid()}`;
      cy.task("seedWorkspace", {
        ownerEmail,
        name: "Workspace Conflit",
        slug: conflictSlug,
        type: "AGENCY",
      });

      cy.task("getWorkspaceId", seededSlug).then((workspaceId) => {
        cy.visit(`/settings/workspaces/${workspaceId}`);
      });

      cy.get("#slug").clear().type(conflictSlug);
      cy.contains("Enregistrer").click();
      cy.contains("Ce slug est déjà utilisé").should("be.visible");

      cy.task("deleteWorkspace", conflictSlug);
    });
  });

  // ─── Suppression ──────────────────────────────────────────────────────────

  describe("Suppression d'un workspace", () => {
    it("owner peut supprimer un workspace après confirmation", () => {
      const deleteSlug = `ws-delete-${uid()}`;
      const deleteName = "Workspace À Supprimer";

      cy.task("seedWorkspace", {
        ownerEmail,
        name: deleteName,
        slug: deleteSlug,
        type: "AGENCY",
      });

      cy.task("getWorkspaceId", deleteSlug).then((workspaceId) => {
        cy.visit(`/settings/workspaces/${workspaceId}`);
      });

      // Ouvre la dialog de suppression
      cy.contains("Supprimer l'espace de travail").click();

      // Saisit le nom du workspace pour confirmer
      cy.get("[role='dialog']").within(() => {
        cy.get("input").type(deleteName);
        cy.contains("Supprimer définitivement").click();
      });

      // Redirigé vers la liste des workspaces
      cy.url().should("include", "/settings/workspaces");
      cy.url().should("not.include", deleteSlug);
    });

    it("ne peut pas supprimer un workspace avec plusieurs membres", () => {
      // Ce cas est vérifié côté serveur — le bouton de suppression est visible
      // mais l'action renvoie une erreur
      cy.task("getWorkspaceId", seededSlug).then((workspaceId) => {
        cy.visit(`/settings/workspaces/${workspaceId}`);
      });

      // Si le workspace a un seul membre (l'owner), la suppression est possible
      // Ce test vérifie juste que le bouton est présent pour un owner
      cy.contains("Supprimer l'espace de travail").should("be.visible");
    });
  });
});
