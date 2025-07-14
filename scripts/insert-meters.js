/**
 * Script pour créer des compteurs et les associer aux contrats existants
 * Exécuter avec: node insert-meters.js
 */

const { Sequelize } = require('sequelize');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Charger les variables d'environnement depuis Database/.env
dotenv.config({ path: path.join(__dirname, '../Database/.env') });

// Configuration de la connexion
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASS,
  {
    host: process.env.DB_HOST,
    dialect: 'postgres',
    logging: console.log,
  }
);

async function createMetersAndAssociate() {
  try {
    await sequelize.authenticate();
    console.log('Connexion à la base de données établie avec succès.');

    // Récupérer les 10 premiers contrats
    const [contracts] = await sequelize.query(`
      SELECT id, numero, zone, "tenantId" 
      FROM contrats 
      WHERE statut = 'ACTIF'
      LIMIT 10;
    `);

    console.log(`Récupération de ${contracts.length} contrats.`);

    // Pour chaque contrat, créer un compteur et l'associer
    for (const contract of contracts) {
      // Générer un numéro de série unique basé sur la zone et un nombre aléatoire
      const serial = `${contract.zone}-${Math.floor(10000 + Math.random() * 90000)}`;
      
      // Insérer le compteur
      const [meterId] = await sequelize.query(`
        INSERT INTO compteurs (
          id, serial, type, statut, emplacement, "dateInstallation", 
          "dateDernierReleve", "valeurDernierReleve", marque, modele, 
          "dateCreation", "dateMaj", "tenantId"
        ) VALUES (
          gen_random_uuid(), '${serial}', 'EAU_POTABLE', 'ACTIF', 
          'ENTRÉE PRINCIPALE', CURRENT_DATE, CURRENT_DATE, 
          ${Math.floor(Math.random() * 100)}, 'AquaTech', 'Smart-X200', 
          CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, '${contract.tenantId}'
        )
        RETURNING id;
      `);

      console.log(`Compteur créé avec ID: ${meterId[0].id} pour le contrat ${contract.numero}`);

      // Associer le compteur au contrat dans l'historique
      await sequelize.query(`
        INSERT INTO contrat_compteur_historiques (
          id, "contratId", "compteurId", "typeAction", 
          "dateDebut", motif, "tenantId", 
          "dateCreation", "dateMaj"
        ) VALUES (
          gen_random_uuid(), '${contract.id}', '${meterId[0].id}', 'ASSOCIATION', 
          CURRENT_DATE, 'Installation initiale', '${contract.tenantId}', 
          CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
        );
      `);

      console.log(`Compteur associé au contrat ${contract.numero}`);
    }

    console.log('Insertion terminée avec succès !');
  } catch (error) {
    console.error('Erreur lors de l\'insertion des données:', error);
  } finally {
    await sequelize.close();
  }
}

createMetersAndAssociate();
