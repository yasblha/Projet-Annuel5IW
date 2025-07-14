#!/bin/bash

# Script pour ajouter le secret d'authentification DOCR dans tous les manifests

echo "Ajout du secret d'authentification DOCR dans tous les manifests..."

# Liste des fichiers à mettre à jour
FILES=(
    "k8s/services/auth-service.yaml"
    "k8s/services/api-gateway.yaml"
    "k8s/services/contrat-service.yaml"
    "k8s/services/facture-service.yaml"
    "k8s/services/intervention-service.yaml"
    "k8s/services/mailer-service.yaml"
    "k8s/services/operation-service.yaml"
    "k8s/services/workflow-service.yaml"
    "k8s/frontend.yaml"
)

# Mise à jour de chaque fichier
for file in "${FILES[@]}"; do
    if [ -f "$file" ]; then
        echo "Mise à jour de $file..."
        
        # Ajoute imagePullSecrets après spec.template.spec
        sed -i '' '/spec:/a\
      imagePullSecrets:\
      - name: docr-secret' "$file"
        
        echo "✅ $file mis à jour"
    else
        echo "❌ Fichier $file non trouvé"
    fi
done

echo ""
echo "🎉 Tous les manifests ont été mis à jour avec le secret d'authentification"
echo "Tu peux maintenant redéployer avec: kubectl apply -f k8s/services/ && kubectl apply -f k8s/frontend.yaml" 