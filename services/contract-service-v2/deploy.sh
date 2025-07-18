#!/bin/bash

# Script de déploiement pour contract-service

echo "Déploiement du service contract-service..."

# Vérifier si nous sommes dans le répertoire du service
if [ ! -f "package.json" ]; then
  echo "Erreur: Vous devez exécuter ce script depuis le répertoire du service contract-service"
  exit 1
fi

# Copier le script SQL dans le dossier de migrations de la base de données
echo "Copie du script SQL dans le dossier de migrations..."
mkdir -p ../Database/migrations
cp init-db.sql ../Database/migrations/contract-service-tables.sql

# Aller à la racine du projet pour utiliser docker-compose
cd ../..

# Construire uniquement le service contract-service
echo "Construction du service contract-service..."
docker-compose build contract-service

# Arrêter le service existant s'il est en cours d'exécution
echo "Arrêt du service existant s'il est en cours d'exécution..."
docker-compose stop contract-service

# Démarrer uniquement le service contract-service
echo "Démarrage du service contract-service..."
docker-compose up -d contract-service

echo "Exécution du script SQL de migration..."
docker exec postgres psql -U postgres -d main -f /var/lib/postgresql/data/contract-service-tables.sql

echo "Déploiement terminé!"
