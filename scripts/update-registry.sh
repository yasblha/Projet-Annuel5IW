#!/bin/bash

# Script pour mettre à jour les images dans tous les manifests Kubernetes
# Remplace factu-reg par aquaerp-registry et ajoute le registre complet

echo "Mise à jour des manifests Kubernetes avec le bon registre DOCR..."

# Liste des fichiers à mettre à jour (dossier principal)
FILES_MAIN=(
    "k8s/auth-service.yaml"
    "k8s/api-gateway.yaml"
    "k8s/contrat-service.yaml"
    "k8s/facture-service.yaml"
    "k8s/intervention-service.yaml"
    "k8s/mailer-service.yaml"
    "k8s/operation-service.yaml"
    "k8s/workflow-service.yaml"
    "k8s/frontend.yaml"
)

# Liste des fichiers dans k8s/services/
FILES_SERVICES=(
    "k8s/services/auth-service.yaml"
    "k8s/services/api-gateway.yaml"
    "k8s/services/contrat-service.yaml"
    "k8s/services/facture-service.yaml"
    "k8s/services/intervention-service.yaml"
    "k8s/services/mailer-service.yaml"
    "k8s/services/operation-service.yaml"
    "k8s/services/workflow-service.yaml"
)

echo "📁 Mise à jour des manifests dans k8s/..."
# Mise à jour des fichiers du dossier principal
for file in "${FILES_MAIN[@]}"; do
    if [ -f "$file" ]; then
        echo "Mise à jour de $file..."
        # Remplace factu-reg par aquaerp-registry
        sed -i '' 's|registry.digitalocean.com/factu-reg/|registry.digitalocean.com/aquaerp-registry/|g' "$file"
        echo "✅ $file mis à jour"
    else
        echo "❌ Fichier $file non trouvé"
    fi
done

echo ""
echo "📁 Mise à jour des manifests dans k8s/services/..."
# Mise à jour des fichiers dans k8s/services/
for file in "${FILES_SERVICES[@]}"; do
    if [ -f "$file" ]; then
        echo "Mise à jour de $file..."
        # Remplace aquaerp/ par registry.digitalocean.com/aquaerp-registry/
        sed -i '' 's|image: aquaerp/|image: registry.digitalocean.com/aquaerp-registry/|g' "$file"
        echo "✅ $file mis à jour"
    else
        echo "❌ Fichier $file non trouvé"
    fi
done

echo ""
echo "🎉 Tous les manifests ont été mis à jour avec le registre aquaerp-registry"
echo "Tu peux maintenant déployer ton application avec: kubectl apply -f k8s/" 