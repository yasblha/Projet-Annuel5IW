/**
 * Script de test pour vérifier la communication RabbitMQ entre l'API Gateway et le service contract-service-v2
 * 
 * Ce script se connecte directement à RabbitMQ pour observer les messages échangés entre les services
 */

const amqp = require('amqplib');
const axios = require('axios');

// Configuration
const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://admin:admin@localhost:5672';
const API_URL = process.env.API_URL || 'http://localhost:3000';
const QUEUE_NAME = 'contract_queue_v2';
let token = null;

// Fonction utilitaire pour logger les informations
function log(message, data = null) {
  console.log(`[${new Date().toISOString()}] ${message}`);
  if (data) {
    console.log(JSON.stringify(data, null, 2));
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
    console.error('Échec de la connexion:', error.message);
    if (error.response) {
      console.error('Réponse:', error.response.data);
    }
    throw error;
  }
}

// Configuration Axios avec le token
function getAxiosConfig() {
  return {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  };
}

// Fonction pour écouter les messages sur la file RabbitMQ
async function listenToQueue() {
  try {
    log(`Connexion à RabbitMQ: ${RABBITMQ_URL}`);
    const connection = await amqp.connect(RABBITMQ_URL);
    log('Connexion établie avec RabbitMQ');
    
    const channel = await connection.createChannel();
    log(`Canal créé, écoute de la file: ${QUEUE_NAME}`);
    
    // S'assurer que la file existe
    await channel.assertQueue(QUEUE_NAME, { durable: true });
    
    // Commencer à écouter les messages
    log('En attente de messages...');
    channel.consume(QUEUE_NAME, (msg) => {
      if (msg !== null) {
        const content = msg.content.toString();
        const pattern = msg.properties.headers.pattern || 'unknown';
        
        log(`Message reçu sur pattern: ${pattern}`);
        try {
          const parsedContent = JSON.parse(content);
          log('Contenu du message:', parsedContent);
        } catch (e) {
          log('Contenu du message (non-JSON):', content);
        }
        
        // Ne pas acquitter le message pour ne pas le retirer de la file
        // channel.ack(msg);
      }
    }, { noAck: true }); // noAck: true pour ne pas acquitter les messages
    
    return { connection, channel };
  } catch (error) {
    console.error('Erreur lors de la connexion à RabbitMQ:', error);
    throw error;
  }
}

// Fonction pour déclencher une requête API qui générera des messages RabbitMQ
async function triggerApiRequests() {
  try {
    // 1. Récupérer les templates
    log('Déclenchement de la requête GET /contrats/v2/templates');
    const templatesResponse = await axios.get(`${API_URL}/contrats/v2/templates`, getAxiosConfig());
    log(`Réponse reçue, statut: ${templatesResponse.status}`);
    
    // 2. Récupérer les contrats
    log('Déclenchement de la requête GET /contrats/v2');
    const contractsResponse = await axios.get(`${API_URL}/contrats/v2`, getAxiosConfig());
    log(`Réponse reçue, statut: ${contractsResponse.status}`);
    
    return {
      templates: templatesResponse.data,
      contracts: contractsResponse.data
    };
  } catch (error) {
    console.error('Erreur lors du déclenchement des requêtes API:', error.message);
    if (error.response) {
      console.error('Statut:', error.response.status);
      console.error('Données:', error.response.data);
    } else if (error.request) {
      console.error('Pas de réponse reçue');
    }
    throw error;
  }
}

// Fonction principale
async function main() {
  try {
    // Se connecter à RabbitMQ et commencer à écouter
    const { connection, channel } = await listenToQueue();
    
    // Se connecter à l'API
    await login();
    
    // Déclencher des requêtes API qui généreront des messages RabbitMQ
    log('=== DÉCLENCHEMENT DES REQUÊTES API ===');
    await triggerApiRequests();
    
    // Garder le script en vie pour continuer à écouter les messages
    log('Écoute des messages en cours... (Ctrl+C pour arrêter)');
    
    // Gérer la fermeture propre
    process.on('SIGINT', async () => {
      log('Fermeture de la connexion RabbitMQ...');
      await channel.close();
      await connection.close();
      log('Connexion fermée, arrêt du script');
      process.exit(0);
    });
  } catch (error) {
    console.error('Erreur dans le programme principal:', error);
    process.exit(1);
  }
}

// Exécuter le programme
main();
