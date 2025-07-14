#!/bin/bash

# Script de déploiement AquaERP sur Kubernetes
# Usage: ./deploy.sh [namespace]

set -e

NAMESPACE=${1:-aquaerp}
REGISTRY=${2:-localhost:5000}

echo "🚀 Déploiement d'AquaERP sur Kubernetes"
echo "Namespace: $NAMESPACE"
echo "Registry: $REGISTRY"

# Créer le namespace
echo "📦 Création du namespace..."
kubectl apply -f k8s/namespace.yaml

# Créer les secrets et configmaps
echo "🔐 Création des secrets et configmaps..."
kubectl apply -f k8s/secrets.yaml

# Créer les volumes persistants
echo "💾 Création des volumes persistants..."
kubectl apply -f k8s/postgresql/persistent-volume.yaml

# Déployer PostgreSQL
echo "🐘 Déploiement de PostgreSQL..."
kubectl apply -f k8s/postgresql/deployment.yaml

# Attendre que PostgreSQL soit prêt
echo "⏳ Attente que PostgreSQL soit prêt..."
kubectl wait --for=condition=ready pod -l app=postgres -n $NAMESPACE --timeout=300s

# Déployer les services backend
echo "🔧 Déploiement des services backend..."
kubectl apply -f k8s/services/

# Déployer le frontend
echo "🎨 Déploiement du frontend..."
kubectl apply -f k8s/frontend/

# Déployer l'ingress
echo "🌐 Déploiement de l'ingress..."
kubectl apply -f k8s/ingress.yaml

# Déployer les NetworkPolicies (bonus)
echo "🔒 Déploiement des NetworkPolicies..."
kubectl apply -f k8s/network-policy.yaml

# Déployer les HPA (bonus)
echo "📈 Déploiement des HPA..."
kubectl apply -f k8s/hpa.yaml

# Vérifier le déploiement
echo "✅ Vérification du déploiement..."
kubectl get pods -n $NAMESPACE
kubectl get services -n $NAMESPACE
kubectl get ingress -n $NAMESPACE

echo "🎉 Déploiement terminé!"
echo "📱 Accès à l'application:"
echo "   Frontend: https://app.aquaerp.local"
echo "   API: https://api.aquaerp.local"
echo ""
echo "🔍 Commandes utiles:"
echo "   kubectl get pods -n $NAMESPACE"
echo "   kubectl logs -f deployment/frontend -n $NAMESPACE"
echo "   kubectl scale deployment frontend --replicas=5 -n $NAMESPACE" 