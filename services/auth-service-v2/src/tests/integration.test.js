const axios = require('axios');

// Configuration
const API_URL = 'http://localhost:3000'; // URL de l'API Gateway
let adminToken = null;
let userId = null;
let invitedUserEmail = `test-user-${Date.now()}@example.com`;
let invitedUserToken = null;
let activationToken = null;
const TEST_PASSWORD = 'Password123456!'; // Mot de passe assez long pour respecter les exigences de sécurité

// Fonctions utilitaires pour les tests
const logStep = (message) => {
  console.log('\n');
  console.log('='.repeat(50));
  console.log(message);
  console.log('='.repeat(50));
};

const logSuccess = (message) => {
  console.log('\x1b[32m%s\x1b[0m', `✓ ${message}`);
};

const logError = (error) => {
  console.error('\x1b[31m%s\x1b[0m', '✗ ERREUR:');
  if (error.response) {
    console.error('  Status:', error.response.status);
    console.error('  Data:', JSON.stringify(error.response.data, null, 2));
  } else {
    console.error(error.message);
  }
};

// Tests
async function runTests() {
  try {
    // 1. Test d'enregistrement d'un admin
    await testRegister();
    
    // 2. Test de connexion
    await testLogin();
    
    // 3. Test de récupération du profil utilisateur
    await testGetUserProfile();
    
    // 4. Test d'invitation d'un utilisateur
    await testInviteUser();
    
    // 5. Simuler l'activation d'un compte
    // Note: Nécessite de récupérer le token d'activation de la base de données
    await testActivateAccount();
    
    // 6. Test de connexion avec l'utilisateur invité
    await testInvitedUserLogin();
    
    // 7. Test du rafraîchissement de token
    await testRefreshToken();
    
    console.log('\n');
    console.log('='.repeat(50));
    console.log('Tous les tests ont été complétés avec succès! 🎉');
    console.log('='.repeat(50));
    
  } catch (error) {
    console.error('\n');
    console.error('='.repeat(50));
    console.error('Les tests ont échoué!');
    console.error('='.repeat(50));
    process.exit(1);
  }
}

// Implémentation des tests
async function testRegister() {
  logStep('Test 1: Enregistrement d\'un admin');
  
  try {
    const adminEmail = `admin-${Date.now()}@example.com`;
    const response = await axios.post(`${API_URL}/auth/v2/register`, {
      email: adminEmail,
      password: TEST_PASSWORD,
      firstName: 'Admin',
      lastName: 'Test',
      agencyName: 'Test Agency',
      role: 'ADMIN'
    });
    
    adminToken = response.data.token;
    userId = response.data.user.id;
    
    logSuccess(`Admin enregistré avec succès: ${adminEmail}`);
    console.log('  Token:', adminToken.substring(0, 20) + '...');
    console.log('  UserId:', userId);
    
    return response.data;
  } catch (error) {
    logError(error);
    throw error;
  }
}

async function testLogin() {
  logStep('Test 2: Connexion');
  
  try {
    const adminEmail = `admin-${Date.now()}@example.com`;
    
    // D'abord, créons un nouvel utilisateur pour le test de login
    const registerResponse = await axios.post(`${API_URL}/auth/v2/register`, {
      email: adminEmail,
      password: TEST_PASSWORD,
      firstName: 'Admin',
      lastName: 'Login',
      agencyName: 'Login Test Agency',
      role: 'ADMIN'
    });
    
    // Maintenant, essayons de se connecter
    const loginResponse = await axios.post(`${API_URL}/auth/v2/login`, {
      email: adminEmail,
      password: TEST_PASSWORD
    });
    
    logSuccess(`Login réussi pour: ${adminEmail}`);
    console.log('  Token:', loginResponse.data.token.substring(0, 20) + '...');
    
    return loginResponse.data;
  } catch (error) {
    logError(error);
    throw error;
  }
}

async function testGetUserProfile() {
  logStep('Test 3: Récupération du profil utilisateur');
  
  try {
    const response = await axios.get(`${API_URL}/auth/v2/me`, {
      headers: {
        Authorization: `Bearer ${adminToken}`
      }
    });
    
    logSuccess('Profil utilisateur récupéré avec succès');
    console.log('  Utilisateur:', JSON.stringify(response.data.user, null, 2));
    
    return response.data;
  } catch (error) {
    logError(error);
    throw error;
  }
}

async function testInviteUser() {
  logStep('Test 4: Invitation d\'un utilisateur');
  
  try {
    const response = await axios.post(
      `${API_URL}/auth/v2/invite`,
      {
        email: invitedUserEmail,
        firstName: 'Invited',
        lastName: 'User',
        role: 'CLIENT'
      },
      {
        headers: {
          Authorization: `Bearer ${adminToken}`
        }
      }
    );
    
    logSuccess(`Utilisateur invité avec succès: ${invitedUserEmail}`);
    console.log('  Résultat:', JSON.stringify(response.data, null, 2));
    
    // Normalement, nous devrions récupérer le token d'activation à partir de la base de données
    // Mais pour simplifier, nous allons faire une requête directe à la base de données dans un test séparé
    
    return response.data;
  } catch (error) {
    logError(error);
    throw error;
  }
}

async function testActivateAccount() {
  logStep('Test 5: Activation d\'un compte (simulation)');
  
  try {
    // Dans un véritable test, nous ferions une requête SQL pour obtenir le token d'activation
    console.log('Note: Pour activer réellement le compte, il faudrait:');
    console.log('1. Récupérer le token d\'activation depuis la base de données');
    console.log('2. Appeler /auth/v2/activate avec ce token');
    
    // Simulation de l'activation
    console.log('\nSimulation d\'activation:');
    console.log('Pour tester réellement, exécutez cette requête SQL:');
    console.log(`SELECT activation_token FROM users WHERE email = '${invitedUserEmail}';`);
    console.log('\nPuis utilisez ce token pour activer le compte:');
    console.log(`curl -X POST ${API_URL}/auth/v2/activate -H 'Content-Type: application/json' -d '{"token": "ACTIVATION_TOKEN", "password": "NewPassword123!"}'`);
    
    logSuccess('Instructions d\'activation générées');
  } catch (error) {
    logError(error);
    throw error;
  }
}

async function testInvitedUserLogin() {
  logStep('Test 6: Connexion avec l\'utilisateur invité (simulation)');
  
  try {
    console.log('Note: Ce test nécessite que le compte ait été activé au préalable');
    console.log(`Pour tester manuellement, connectez-vous avec: ${invitedUserEmail}`);
    console.log('après avoir activé le compte');
    
    logSuccess('Instructions de connexion générées');
  } catch (error) {
    logError(error);
    throw error;
  }
}

async function testRefreshToken() {
  logStep('Test 7: Rafraîchissement de token');
  
  try {
    const response = await axios.post(
      `${API_URL}/auth/v2/refresh`,
      { userId: userId },
      {
        headers: {
          Authorization: `Bearer ${adminToken}`
        }
      }
    );
    
    const newToken = response.data.token;
    
    logSuccess('Token rafraîchi avec succès');
    console.log('  Nouveau token:', newToken.substring(0, 20) + '...');
    
    // Test du nouveau token
    const profileResponse = await axios.get(`${API_URL}/auth/v2/me`, {
      headers: {
        Authorization: `Bearer ${newToken}`
      }
    });
    
    logSuccess('Nouveau token valide - profil récupéré avec succès');
    
    return response.data;
  } catch (error) {
    logError(error);
    throw error;
  }
}

// Exécution des tests
runTests().catch(console.error);
