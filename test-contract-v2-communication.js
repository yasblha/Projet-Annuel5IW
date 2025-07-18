/**
 * Script de test pour vérifier la communication entre l'API Gateway et le service contract-service-v2
 * via RabbitMQ.
 * 
 * Ce script simule des requêtes pour tester les différents endpoints du service de contrats V2.
 */

const axios = require('axios');
const API_URL = process.env.API_URL || 'http://localhost:3000';
let token = null;

// Configuration pour les logs
const enableDetailedLogs = true;

// Fonction utilitaire pour logger les informations
function log(message, data = null) {
  console.log(`[${new Date().toISOString()}] ${message}`);
  if (data && enableDetailedLogs) {
    console.log(JSON.stringify(data, null, 2));
  }
}

// Fonction utilitaire pour logger les erreurs
function logError(message, error) {
  console.error(`[${new Date().toISOString()}] ERROR: ${message}`);
  if (error.response) {
    console.error(`Status: ${error.response.status}`);
    console.error(`Data:`, error.response.data);
    console.error(`Headers:`, error.response.headers);
  } else if (error.request) {
    console.error('Pas de réponse reçue du serveur');
    console.error(error.request);
  } else {
    console.error('Erreur:', error.message);
  }
  console.error(error.config);
}

// Fonction pour s'authentifier et récupérer un token
async function login() {
  try {
    log('Tentative de connexion...');
    const response = await axios.post(`${API_URL}/auth/v2/login`, {
      email: 'admin@example.com',
      password: 'password'
    });
    token = response.data.token;
    log('Connexion réussie, token récupéré');
    return token;
  } catch (error) {
    logError('Échec de la connexion', error);
    throw error;
  }
}

// Configuration Axios avec le token
function getAxiosConfig() {
  return {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    timeout: 30000 // 30 secondes
  };
}

// Test de récupération de tous les templates
async function testListTemplates() {
  try {
    log('Test: Récupération de tous les templates');
    const startTime = Date.now();
    const response = await axios.get(`${API_URL}/contrats/v2/templates`, getAxiosConfig());
    const endTime = Date.now();
    log(`Succès! Temps de réponse: ${endTime - startTime}ms`, response.data);
    return response.data;
  } catch (error) {
    logError('Échec de la récupération des templates', error);
    throw error;
  }
}

// Test de récupération de tous les contrats
async function testListContracts() {
  try {
    log('Test: Récupération de tous les contrats');
    const startTime = Date.now();
    const response = await axios.get(`${API_URL}/contrats/v2`, getAxiosConfig());
    const endTime = Date.now();
    log(`Succès! Temps de réponse: ${endTime - startTime}ms`, response.data);
    return response.data;
  } catch (error) {
    logError('Échec de la récupération des contrats', error);
    throw error;
  }
}

// Test de création d'un template
async function testCreateTemplate() {
  try {
    log('Test: Création d\'un template');
    const templateData = {
      name: `Test Template ${Date.now()}`,
      bodyMd: '# Contrat de test\n\nCeci est un contrat de test créé le {{date}}.',
      periodicity: 'MONTHLY',
      price: 99.99
    };
    const startTime = Date.now();
    const response = await axios.post(`${API_URL}/contrats/v2/templates`, templateData, getAxiosConfig());
    const endTime = Date.now();
    log(`Succès! Temps de réponse: ${endTime - startTime}ms`, response.data);
    return response.data;
  } catch (error) {
    logError('Échec de la création du template', error);
    throw error;
  }
}

// Test de création d'un contrat
async function testCreateContract(templateId, clientId) {
  try {
    log(`Test: Création d'un contrat (templateId: ${templateId}, clientId: ${clientId})`);
    const contractData = {
      clientId,
      templateId,
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    };
    const startTime = Date.now();
    const response = await axios.post(`${API_URL}/contrats/v2`, contractData, getAxiosConfig());
    const endTime = Date.now();
    log(`Succès! Temps de réponse: ${endTime - startTime}ms`, response.data);
    return response.data;
  } catch (error) {
    logError('Échec de la création du contrat', error);
    throw error;
  }
}

// Exécution des tests
async function runTests() {
  try {
    // Authentification
    await login();
    
    // Test des templates
    log('=== DÉBUT DES TESTS DE TEMPLATES ===');
    const templates = await testListTemplates();
    let templateId = null;
    
    if (templates && templates.length > 0) {
      log(`${templates.length} templates trouvés, utilisation du premier pour les tests`);
      templateId = templates[0].id;
    } else {
      log('Aucun template trouvé, création d\'un nouveau template');
      const newTemplate = await testCreateTemplate();
      templateId = newTemplate.id;
    }
    
    // Test des contrats
    log('=== DÉBUT DES TESTS DE CONTRATS ===');
    const contracts = await testListContracts();
    log(`${contracts?.items?.length || 0} contrats trouvés`);
    
    // Pour créer un contrat, nous aurions besoin d'un ID client
    // Ce test est commenté car nous n'avons pas récupéré de client
    // Si vous avez un ID client, décommentez et remplacez 'YOUR_CLIENT_ID'
    /*
    if (templateId) {
      log('Création d\'un nouveau contrat avec le template');
      await testCreateContract(templateId, 'YOUR_CLIENT_ID');
    }
    */
    
    log('=== TESTS TERMINÉS AVEC SUCCÈS ===');
  } catch (error) {
    console.error('=== ÉCHEC DES TESTS ===');
    console.error(error);
  }
}

// Exécuter les tests
runTests();
