describe("Onboarding Workflow", () => {
  const testEmail = `test-onboarding-${Math.random().toString(36).substring(7)}@example.com`;
  const testPassword = "Password123!";

  before(() => {
    // Ensure clean state
    cy.clearCookies();
    cy.clearLocalStorage();
  });

  after(() => {
    // Cleanup test user
    cy.task("deleteUser", testEmail);
  });

  it("should redirect a new user without a team to the onboarding page", () => {
    // 1. Sign up
    cy.visit("/sign-up");
    cy.get("#name").type("Onboarding User");
    cy.get("#email").type(testEmail);
    cy.get("#password").type(testPassword);
    cy.get("#confirm").type(testPassword);
    cy.get('button[type="submit"]').click();

    cy.contains("Vérifiez votre email").should("be.visible");

    // 2. Manually verify user in DB via Cypress task
    cy.task("verifyUser", testEmail);

    // 3. Sign in via custom command
    cy.login(testEmail, testPassword);

    // 4. Should be redirected to onboarding because no team exists
    cy.url().should("include", "/onboarding");
    cy.contains("Bienvenue sur SpecFlow").should("be.visible");
  });

  it("je créé une équipe et suis redirigé sur la page dashboard", () => {
    // Ensure we are logged in and on the onboarding page
    cy.login(testEmail, testPassword);
    cy.visit("/onboarding");

    const teamName = "Test Team " + Math.random().toString(36).substring(7);
    cy.get("#name").type(teamName);

    // Wait for slug to be generated
    cy.get("#slug").should("not.have.value", "");

    cy.get('button[type="submit"]').contains("Créer et continuer").click();

    // Redirection to dashboard
    cy.url().should("include", "/dashboard");
    cy.contains(`Bonjour`).should("be.visible");
    cy.contains(`Vous travaillez dans l'équipe "${teamName}"`).should(
      "be.visible",
    );
  });

  it("should still allow access to the onboarding page even with a team", () => {
    // User requested: "quand mon équipe est créée alors j'ai accès à la page onboarding"
    cy.visit("/onboarding");
    cy.url().should("include", "/onboarding");
    cy.contains("Créer une équipe").should("be.visible");
  });
});
