describe('Authentication Workflows', () => {
  beforeEach(() => {
    // Clear cookies and local storage to ensure a clean state
    cy.clearCookies();
    cy.clearLocalStorage();
  });

  let createdEmail: string | null = null;

  after(() => {
    if (createdEmail) {
      cy.task('deleteUser', createdEmail);
    }
  });

  it('should redirect back to sign-in when accessing protected dashboard', () => {
    // ... (rest of file remains same)
    cy.visit('/dashboard');
    cy.url().should('include', '/sign-in');
  });

  it('should show error message with invalid credentials', () => {
    cy.visit('/sign-in');
    cy.get('#email-pw').type('wrong@example.com');
    cy.get('#password').type('wrongpassword');
    cy.get('button[type="submit"]').contains('Se connecter').click();
    cy.contains('Email ou mot de passe incorrect.').should('be.visible');
  });

  it('should navigate between sign-in and sign-up pages', () => {
    cy.visit('/sign-in');
    cy.contains('Créer un compte').click();
    cy.url().should('include', '/sign-up');
    cy.contains('Se connecter').click();
    cy.url().should('include', '/sign-in');
  });

  it('should show verification message after successful sign-up', () => {
    createdEmail = `test-auth-${Math.random().toString(36).substring(7)}@example.com`;
    
    cy.visit('/sign-up');
    cy.get('#name').type('Test User');
    cy.get('#email').type(createdEmail);
    cy.get('#password').type('Password123!');
    cy.get('#confirm').type('Password123!');
    cy.get('button[type="submit"]').contains('Créer mon compte').click();
    
    cy.contains('Vérifiez votre email').should('be.visible');
    cy.contains('Un lien de vérification vous a été envoyé').should('be.visible');
  });

  // Note: Testing actual sign-in requires a verified user in the database.
  // This would typically involve a seeding step or using a mock auth provider for E2E.
});
