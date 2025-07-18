#!/bin/bash
set -e

# Variables
REGISTRY="docker.io/yassblh"
NAMESPACE="aquaerp"
CURRENT_DIR=$(pwd)

echo "🔧 Reconstruisant et déployant les services api-gateway et auth-service..."

# Construire et pousser l'image API Gateway
echo "🔄 Reconstruisant l'API Gateway..."
cd ${CURRENT_DIR}/services/api-gateway
docker build -t ${REGISTRY}/api-gateway:latest .
docker push ${REGISTRY}/api-gateway:latest

# Construire et pousser l'image Auth Service
echo "🔄 Reconstruisant Auth Service..."
cd ${CURRENT_DIR}/services/auth-service
docker build -t ${REGISTRY}/auth-service:latest .
docker push ${REGISTRY}/auth-service:latest

# Redéployer les services
echo "🚀 Redéployant les services dans Kubernetes..."
kubectl rollout restart deployment/api-gateway -n ${NAMESPACE}
kubectl rollout restart deployment/auth-service -n ${NAMESPACE}

# Attendre que les nouveaux pods soient prêts
echo "⏳ Attente du déploiement des nouveaux pods..."
kubectl rollout status deployment/api-gateway -n ${NAMESPACE} --timeout=2m
kubectl rollout status deployment/auth-service -n ${NAMESPACE} --timeout=2m

echo "✅ Déploiement terminé!"
echo "📋 Liste des pods mis à jour:"
kubectl get pods -n ${NAMESPACE} -l 'app in (api-gateway,auth-service)'
