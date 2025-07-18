/**
 * Script de diagnostic pour identifier les problèmes de communication entre
 * l'API Gateway et le service contract-service-v2
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

// Test de récupération de tous les templates avec retry et diagnostic
async function testListTemplatesWithDiagnostic() {
  log('=== DIAGNOSTIC DE RÉCUPÉRATION DES TEMPLATES ===');
  let attempts = 0;
  const maxAttempts = 3;
  const delayBetweenAttempts = 2000; // 2 secondes

  while (attempts < maxAttempts) {
    attempts++;
    log(`Tentative ${attempts}/${maxAttempts}`);
    
    try {
      const startTime = Date.now();
      log(`Envoi de la requête GET ${API_URL}/contrats/v2/templates`);
      log('En-têtes:', getAxiosConfig().headers);
      
      const response = await axios.get(`${API_URL}/contrats/v2/templates`, getAxiosConfig());
      
      const endTime = Date.now();
      log(`Succès! Temps de réponse: ${endTime - startTime}ms`);
      log(`Nombre de templates reçus: ${response.data.length}`);
      return response.data;
    } catch (error) {
      logError(`Échec de la tentative ${attempts}`, error);
      
      // Analyse détaillée de l'erreur
      if (error.response) {
        log(`Statut de l'erreur: ${error.response.status}`);
        log('Données de réponse:', error.response.data);
        
        // Vérifier si c'est une erreur d'authentification
        if (error.response.status === 401) {
          log('Problème d\'authentification détecté, tentative de rafraîchissement du token...');
          try {
            await login(); // Rafraîchir le token
            log('Token rafraîchi avec succès');
          } catch (loginError) {
            logError('Échec du rafraîchissement du token', loginError);
          }
        }
        
        // Vérifier si c'est une erreur de timeout
        if (error.code === 'ECONNABORTED') {
          log('Timeout détecté. Le service contract-service-v2 prend trop de temps pour répondre.');
          log('Vérifiez les logs du service pour identifier les goulots d\'étranglement.');
        }
        
        // Vérifier si c'est une erreur serveur
        if (error.response.status === 500) {
          log('Erreur serveur 500 détectée. Causes possibles:');
          log('1. Problème de connexion à RabbitMQ');
          log('2. Exception non gérée dans le service contract-service-v2');
          log('3. Problème de base de données');
          log('4. Problème de format des messages échangés');
        }
      } else if (error.request) {
        log('Aucune réponse reçue. Le service est peut-être indisponible.');
      }
      
      if (attempts < maxAttempts) {
        log(`Attente de ${delayBetweenAttempts}ms avant la prochaine tentative...`);
        await new Promise(resolve => setTimeout(resolve, delayBetweenAttempts));
      }
    }
  }
  
  log(`Échec après ${maxAttempts} tentatives.`);
  return null;
}

// Test de récupération de tous les contrats avec retry et diagnostic
async function testListContractsWithDiagnostic() {
  log('=== DIAGNOSTIC DE RÉCUPÉRATION DES CONTRATS ===');
  let attempts = 0;
  const maxAttempts = 3;
  const delayBetweenAttempts = 2000; // 2 secondes

  while (attempts < maxAttempts) {
    attempts++;
    log(`Tentative ${attempts}/${maxAttempts}`);
    
    try {
      const startTime = Date.now();
      log(`Envoi de la requête GET ${API_URL}/contrats/v2`);
      log('En-têtes:', getAxiosConfig().headers);
      
      const response = await axios.get(`${API_URL}/contrats/v2`, getAxiosConfig());
      
      const endTime = Date.now();
      log(`Succès! Temps de réponse: ${endTime - startTime}ms`);
      log(`Nombre de contrats reçus: ${response.data.items?.length || 0}`);
      return response.data;
    } catch (error) {
      logError(`Échec de la tentative ${attempts}`, error);
      
      // Analyse détaillée de l'erreur (même logique que pour les templates)
      if (error.response) {
        log(`Statut de l'erreur: ${error.response.status}`);
        log('Données de réponse:', error.response.data);
        
        if (error.response.status === 401) {
          log('Problème d\'authentification détecté, tentative de rafraîchissement du token...');
          try {
            await login();
            log('Token rafraîchi avec succès');
          } catch (loginError) {
            logError('Échec du rafraîchissement du token', loginError);
          }
        }
        
        if (error.code === 'ECONNABORTED') {
          log('Timeout détecté. Le service contract-service-v2 prend trop de temps pour répondre.');
        }
        
        if (error.response.status === 500) {
          log('Erreur serveur 500 détectée. Vérifiez les logs du service.');
        }
      } else if (error.request) {
        log('Aucune réponse reçue. Le service est peut-être indisponible.');
      }
      
      if (attempts < maxAttempts) {
        log(`Attente de ${delayBetweenAttempts}ms avant la prochaine tentative...`);
        await new Promise(resolve => setTimeout(resolve, delayBetweenAttempts));
      }
    }
  }
  
  log(`Échec après ${maxAttempts} tentatives.`);
  return null;
}

// Vérifier la configuration RabbitMQ
async function checkRabbitMQConfig() {
  log('=== VÉRIFICATION DE LA CONFIGURATION RABBITMQ ===');
  
  try {
    // Vérifier la configuration dans l'API Gateway
    log('Vérification de la configuration RabbitMQ dans l\'API Gateway:');
    log('- Queue name: contract_queue_v2');
    log('- Service name: CONTRACT_SERVICE_V2');
    
    log('Recommandations:');
    log('1. Vérifier que le service contract-service-v2 est bien en écoute sur la file "contract_queue_v2"');
    log('2. Vérifier que RabbitMQ est accessible depuis les deux services');
    log('3. Vérifier les logs de RabbitMQ pour détecter d\'éventuelles erreurs de connexion');
    log('4. Vérifier que les messages sont correctement formatés et contiennent le token JWT');
  } catch (error) {
    logError('Erreur lors de la vérification de la configuration RabbitMQ', error);
  }
}

// Exécution des diagnostics
async function runDiagnostics() {
  try {
    // Authentification
    await login();
    
    // Vérifier la configuration RabbitMQ
    await checkRabbitMQConfig();
    
    // Test des templates avec diagnostic
    await testListTemplatesWithDiagnostic();
    
    // Test des contrats avec diagnostic
    await testListContractsWithDiagnostic();
    
    log('=== DIAGNOSTICS TERMINÉS ===');
    log('Recommandations générales:');
    log('1. Vérifier les logs du service contract-service-v2 pour identifier les erreurs spécifiques');
    log('2. Vérifier que le service est correctement démarré et connecté à RabbitMQ');
    log('3. Vérifier que la base de données du service est accessible');
    log('4. Augmenter les timeouts dans l\'API Gateway si nécessaire');
    log('5. Implémenter un mécanisme de retry avec backoff exponentiel dans le frontend');
  } catch (error) {
    console.error('=== ÉCHEC DES DIAGNOSTICS ===');
    console.error(error);
  }
}

// Exécuter les diagnostics
runDiagnostics();
