#!/bin/bash

# Script pour restaurer les ressources normales des services

echo "Restauration des ressources normales des services..."

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
        
        # Restaurer les ressources CPU et mémoire normales
        sed -i '' 's/cpu: "100m"/cpu: "250m"/g' "$file"
        sed -i '' 's/cpu: "200m"/cpu: "500m"/g' "$file"
        sed -i '' 's/memory: "128Mi"/memory: "256Mi"/g' "$file"
        sed -i '' 's/memory: "256Mi"/memory: "512Mi"/g' "$file"
        
        # Restaurer le nombre de replicas à 2
        sed -i '' 's/replicas: 1/replicas: 2/g' "$file"
        
        echo "✅ $file modifié"
    else
        echo "❌ Fichier $file non trouvé"
    fi
done

echo ""
echo "🎉 Ressources restaurées pour le cluster étendu"
echo "Tu peux maintenant redéployer avec: kubectl apply -f k8s/services/" 