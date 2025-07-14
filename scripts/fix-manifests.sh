#!/bin/bash

# Script pour corriger tous les manifests avec la bonne structure YAML

echo "Correction des manifests Kubernetes..."

# Liste des fichiers à corriger
FILES=(
    "k8s/services/api-gateway.yaml"
    "k8s/services/contrat-service.yaml"
    "k8s/services/facture-service.yaml"
    "k8s/services/intervention-service.yaml"
    "k8s/services/mailer-service.yaml"
    "k8s/services/operation-service.yaml"
    "k8s/services/workflow-service.yaml"
)

# Correction de chaque fichier
for file in "${FILES[@]}"; do
    if [ -f "$file" ]; then
        echo "Correction de $file..."
        
        # Supprime les lignes mal ajoutées et corrige la structure
        sed -i '' '/imagePullSecrets:/d' "$file"
        sed -i '' '/- name: docr-secret/d' "$file"
        sed -i '' 's/      replicas:/  replicas:/g' "$file"
        sed -i '' 's/      selector:/  selector:/g' "$file"
        sed -i '' 's/      containers:/      containers:/g' "$file"
        
        # Ajoute correctement imagePullSecrets
        sed -i '' '/spec:/a\
      imagePullSecrets:\
      - name: docr-secret' "$file"
        
        echo "✅ $file corrigé"
    else
        echo "❌ Fichier $file non trouvé"
    fi
done

echo ""
echo "🎉 Tous les manifests ont été corrigés"
echo "Tu peux maintenant redéployer avec: kubectl apply -f k8s/services/" 