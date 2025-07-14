#!/bin/bash

# Script pour réduire temporairement les ressources des services

echo "Réduction des ressources pour permettre le déploiement..."

# Liste des fichiers à modifier
FILES=(
    "k8s/services/auth-service.yaml"
    "k8s/services/api-gateway.yaml"
    "k8s/services/contrat-service.yaml"
    "k8s/services/facture-service.yaml"
    "k8s/services/intervention-service.yaml"
    "k8s/services/mailer-service.yaml"
    "k8s/services/operation-service.yaml"
    "k8s/services/workflow-service.yaml"
)

# Modification de chaque fichier
for file in "${FILES[@]}"; do
    if [ -f "$file" ]; then
        echo "Modification de $file..."
        
        # Réduire les ressources CPU et mémoire
        sed -i '' 's/cpu: "250m"/cpu: "100m"/g' "$file"
        sed -i '' 's/cpu: "500m"/cpu: "200m"/g' "$file"
        sed -i '' 's/memory: "256Mi"/memory: "128Mi"/g' "$file"
        sed -i '' 's/memory: "512Mi"/memory: "256Mi"/g' "$file"
        
        # Réduire le nombre de replicas à 1
        sed -i '' 's/replicas: 2/replicas: 1/g' "$file"
        
        echo "✅ $file modifié"
    else
        echo "❌ Fichier $file non trouvé"
    fi
done

echo ""
echo "🎉 Ressources réduites pour permettre le déploiement"
echo "Tu peux maintenant redéployer avec: kubectl apply -f k8s/services/" 