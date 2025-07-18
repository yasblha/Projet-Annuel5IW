/**
 * Script de diagnostic pour la communication entre l'API Gateway et contract-service-v2
 * Ce script teste spécifiquement les problèmes liés au token JWT et à la communication RabbitMQ
 */

const axios = require('axios');
const amqplib = require('amqplib');

// Configuration
const API_URL = 'http://localhost:3000';
const RABBITMQ_URL = 'amqp://admin:admin@localhost:5672';
const QUEUE_NAME = 'contract_queue_v2';
const TOKEN = process.env.JWT_TOKEN || '';

// Couleurs pour les logs
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

// Fonction pour logger avec couleur
function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

// Fonction pour logger une erreur
function logError(message, error) {
  log(`❌ ${message}`, colors.red);
  if (error) {
    if (error.response) {
      log(`  Status: ${error.response.status}`, colors.red);
      log(`  Data: ${JSON.stringify(error.response.data, null, 2)}`, colors.red);
    } else if (error.message) {
      log(`  Message: ${error.message}`, colors.red);
    } else {
      log(`  ${JSON.stringify(error, null, 2)}`, colors.red);
    }
  }
}

// Fonction pour logger un succès
function logSuccess(message, data) {
  log(`✅ ${message}`, colors.green);
  if (data) {
    log(`  ${JSON.stringify(data, null, 2)}`, colors.green);
  }
}

// Fonction pour logger une info
function logInfo(message) {
  log(`ℹ️ ${message}`, colors.blue);
}

// Fonction pour logger un avertissement
function logWarning(message) {
  log(`⚠️ ${message}`, colors.yellow);
}

// Fonction pour vérifier le token JWT
async function checkToken() {
  logInfo('Vérification du token JWT...');
  
  if (!TOKEN) {
    logWarning('Aucun token JWT fourni. Utilisez JWT_TOKEN=votre_token node token-diagnostic-contract-v2.js');
    return false;
  }
  
  try {
    // Décodage du token (sans vérification de la signature)
    const parts = TOKEN.split('.');
    if (parts.length !== 3) {
      logError('Format de token invalide');
      return false;
    }
    
    const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
    logSuccess('Token décodé avec succès', {
      exp: new Date(payload.exp * 1000).toISOString(),
      sub: payload.sub,
      email: payload.email,
      agencyId: payload.agencyId,
      // Autres champs importants
    });
    
    // Vérifier si le token est expiré
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < now) {
      logError('Le token est expiré', {
        expiration: new Date(payload.exp * 1000).toISOString(),
        now: new Date().toISOString()
      });
      return false;
    }
    
    logSuccess('Le token est valide et non expiré');
    return true;
  } catch (error) {
    logError('Erreur lors du décodage du token', error);
    return false;
  }
}

// Fonction pour tester l'API Gateway
async function testApiGateway() {
  logInfo('Test de l\'API Gateway...');
  
  try {
    const response = await axios.get(`${API_URL}/health`);
    logSuccess('API Gateway accessible', response.data);
    return true;
  } catch (error) {
    logError('Erreur lors de l\'accès à l\'API Gateway', error);
    return false;
  }
}

// Fonction pour tester les endpoints de debug
async function testDebugEndpoints() {
  logInfo('Test des endpoints de debug...');
  
  const headers = TOKEN ? { Authorization: `Bearer ${TOKEN}` } : {};
  
  try {
    logInfo('Test de /debug/contrats/v2/ping...');
    const pingResponse = await axios.get(`${API_URL}/debug/contrats/v2/ping`, { headers });
    logSuccess('Ping réussi', pingResponse.data);
  } catch (error) {
    logError('Erreur lors du ping', error);
  }
  
  try {
    logInfo('Test de /debug/contrats/v2/templates...');
    const templatesResponse = await axios.get(`${API_URL}/debug/contrats/v2/templates`, { headers });
    logSuccess('Récupération des templates réussie', templatesResponse.data);
  } catch (error) {
    logError('Erreur lors de la récupération des templates', error);
  }
  
  try {
    logInfo('Test de /debug/contrats/v2/contracts...');
    const contractsResponse = await axios.get(`${API_URL}/debug/contrats/v2/contracts`, { headers });
    logSuccess('Récupération des contrats réussie', contractsResponse.data);
  } catch (error) {
    logError('Erreur lors de la récupération des contrats', error);
  }
}

// Fonction pour tester la connexion RabbitMQ
async function testRabbitMQConnection() {
  logInfo('Test de la connexion RabbitMQ...');
  
  try {
    const connection = await amqplib.connect(RABBITMQ_URL);
    logSuccess('Connexion RabbitMQ établie');
    
    const channel = await connection.createChannel();
    logSuccess('Canal RabbitMQ créé');
    
    // Vérifier si la queue existe
    try {
      await channel.checkQueue(QUEUE_NAME);
      logSuccess(`Queue '${QUEUE_NAME}' existe`);
    } catch (error) {
      logError(`Queue '${QUEUE_NAME}' n'existe pas ou n'est pas accessible`, error);
    }
    
    // Fermer la connexion
    await channel.close();
    await connection.close();
    logInfo('Connexion RabbitMQ fermée');
    
    return true;
  } catch (error) {
    logError('Erreur lors de la connexion à RabbitMQ', error);
    return false;
  }
}

// Fonction pour écouter les messages RabbitMQ
async function listenToRabbitMQMessages() {
  logInfo('Écoute des messages RabbitMQ sur la queue contract_queue_v2...');
  
  try {
    const connection = await amqplib.connect(RABBITMQ_URL);
    const channel = await connection.createChannel();
    
    // Créer une queue temporaire pour recevoir les messages
    const { queue } = await channel.assertQueue('', { exclusive: true });
    
    // Bind cette queue à un exchange pour recevoir une copie des messages
    await channel.bindQueue(queue, 'amq.topic', '#');
    
    logInfo(`En attente de messages. Appuyez sur Ctrl+C pour quitter.`);
    
    // Consommer les messages
    channel.consume(queue, (msg) => {
      if (msg !== null) {
        try {
          const content = JSON.parse(msg.content.toString());
          const routingKey = msg.fields.routingKey;
          
          log(`📨 Message reçu sur ${routingKey}:`, colors.magenta);
          log(JSON.stringify(content, null, 2), colors.cyan);
          
          // Vérifier si le message contient un token
          if (content.data && content.data.token) {
            logSuccess('Le message contient un token JWT');
          } else {
            logWarning('Le message ne contient pas de token JWT');
          }
        } catch (error) {
          logError('Erreur lors du traitement du message', error);
        }
        
        channel.ack(msg);
      }
    });
    
    // Garder le processus en vie
    return new Promise(() => {});
  } catch (error) {
    logError('Erreur lors de l\'écoute des messages RabbitMQ', error);
  }
}

// Fonction pour envoyer un message de test à RabbitMQ
async function sendTestMessage() {
  logInfo('Envoi d\'un message de test à RabbitMQ...');
  
  try {
    const connection = await amqplib.connect(RABBITMQ_URL);
    const channel = await connection.createChannel();
    
    // Message de test
    const message = {
      pattern: 'ping',
      data: {
        token: TOKEN
      }
    };
    
    // Publier le message
    await channel.assertQueue(QUEUE_NAME, { durable: true });
    channel.sendToQueue(QUEUE_NAME, Buffer.from(JSON.stringify(message)), {
      contentType: 'application/json',
      persistent: true
    });
    
    logSuccess(`Message envoyé à la queue ${QUEUE_NAME}`, message);
    
    // Fermer la connexion
    await channel.close();
    await connection.close();
    
    return true;
  } catch (error) {
    logError('Erreur lors de l\'envoi du message à RabbitMQ', error);
    return false;
  }
}

// Fonction principale
async function main() {
  log('🔍 DIAGNOSTIC DE COMMUNICATION CONTRACT-SERVICE-V2', colors.cyan);
  log('================================================', colors.cyan);
  
  // 1. Vérifier le token JWT
  const tokenValid = await checkToken();
  log('------------------------------------------------', colors.cyan);
  
  // 2. Tester l'API Gateway
  const apiGatewayAccessible = await testApiGateway();
  log('------------------------------------------------', colors.cyan);
  
  // 3. Tester les endpoints de debug
  if (apiGatewayAccessible) {
    await testDebugEndpoints();
    log('------------------------------------------------', colors.cyan);
  }
  
  // 4. Tester la connexion RabbitMQ
  const rabbitMQAccessible = await testRabbitMQConnection();
  log('------------------------------------------------', colors.cyan);
  
  // 5. Envoyer un message de test
  if (rabbitMQAccessible) {
    await sendTestMessage();
    log('------------------------------------------------', colors.cyan);
  }
  
  // 6. Écouter les messages RabbitMQ (bloquant)
  if (rabbitMQAccessible) {
    log('Démarrage de l\'écoute des messages RabbitMQ...', colors.cyan);
    log('Appuyez sur Ctrl+C pour quitter.', colors.cyan);
    log('------------------------------------------------', colors.cyan);
    await listenToRabbitMQMessages();
  }
}

// Exécuter le script
main().catch(error => {
  logError('Erreur non gérée', error);
  process.exit(1);
});
