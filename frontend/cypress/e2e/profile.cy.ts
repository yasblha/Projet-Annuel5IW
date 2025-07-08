/// <reference types="cypress" />

describe('Profil utilisateur - E2E', () => {
  const email = 'testuser@example.com'
  const password = 'Password123!'

  beforeEach(() => {
    // Connexion avant chaque test
    cy.visit('/login')
    cy.get('input[type=email]').type(email)
    cy.get('input[type=password]').type(password)
    cy.contains('Se connecter').click()
    cy.url().should('include', '/dashboard')
  })

  it('Accès à la page profil', () => {
    cy.visit('/profile')
    cy.contains('Mon Profil')
    cy.get('input[type=text]').should('have.length.at.least', 2)
  })

  it('Refuse l’accès à /profile si non connecté', () => {
    cy.clearCookies()
    cy.visit('/profile')
    cy.url().should('include', '/login')
  })

  it('Met à jour le prénom et le nom', () => {
    cy.visit('/profile')
    cy.get('input[type=text]').eq(0).clear().type('JeanTest')
    cy.get('input[type=text]').eq(1).clear().type('DupontTest')
    cy.contains('Mettre à jour le profil').click()
    cy.contains('Profil mis à jour').should('exist')
  })

  it('Affiche une erreur si le prénom est trop court', () => {
    cy.visit('/profile')
    cy.get('input[type=text]').eq(0).clear().type('A')
    cy.contains('Mettre à jour le profil').click()
    cy.contains('Le prénom doit contenir au moins 2 caractères').should('exist')
  })
}) 