describe('Authentification - E2E', () => {
  const email = 'testuser@example.com'
  const password = 'Password123!'

  it('Affiche la page de login', () => {
    cy.visit('/login')
    cy.contains('Connexion à votre compte')
  })

  it('Refuse la connexion avec mauvais mot de passe', () => {
    cy.visit('/login')
    cy.get('input[type=email]').type(email)
    cy.get('input[type=password]').type('wrongpassword')
    cy.contains('Se connecter').click()
    cy.contains('Erreur').should('exist')
  })

  it('Permet la connexion avec de bons identifiants', () => {
    cy.visit('/login')
    cy.get('input[type=email]').type(email)
    cy.get('input[type=password]').type(password)
    cy.contains('Se connecter').click()
    cy.url().should('include', '/dashboard')
    cy.contains('Déconnexion').should('exist')
  })

  it('Accès refusé au dashboard si non connecté', () => {
    cy.clearCookies()
    cy.visit('/dashboard')
    cy.url().should('include', '/login')
  })

  it('Permet la déconnexion', () => {
    // Connexion d'abord
    cy.visit('/login')
    cy.get('input[type=email]').type(email)
    cy.get('input[type=password]').type(password)
    cy.contains('Se connecter').click()
    cy.url().should('include', '/dashboard')
    // Déconnexion
    cy.contains('Déconnexion').click()
    cy.url().should('include', '/login')
  })
}) 