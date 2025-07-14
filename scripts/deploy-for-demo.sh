#!/bin/bash

# Script de déploiement complet pour démonstration
# Usage: ./deploy-for-demo.sh

set -e

echo "🚀 Déploiement AquaERP pour démonstration"
NAMESPACE="aquaerp"

# 1. S'authentifier auprès de DigitalOcean (remplacer par vos propres tokens)
echo "🔑 Authentification DigitalOcean..."
read -p "Entrez votre token DigitalOcean: " DO_TOKEN
doctl auth init -t $DO_TOKEN

# 2. Configuration du Kubernetes Cluster
echo "☸️  Configuration du Kubernetes cluster..."
doctl kubernetes cluster kubeconfig save factu

# 3. Mise à jour des registres d'images dans tous les manifests
echo "🖼️  Mise à jour des registres d'images..."
./scripts/update-registry.sh

# 4. Création du namespace
echo "📦 Création du namespace..."
kubectl apply -f k8s/namespace.yaml

# 5. Création des secrets pour le registre d'images
echo "🔒 Création du secret pour le registre DigitalOcean..."
kubectl create secret docker-registry docr-secret \
  --namespace=$NAMESPACE \
  --docker-server=registry.digitalocean.com \
  --docker-username=$DO_TOKEN \
  --docker-password=$DO_TOKEN \
  --docker-email=your.email@example.com

# 6. Ajout des secrets d'extraction d'images dans les manifests
echo "🔐 Ajout des secrets dans les manifests..."
./scripts/add-image-pull-secret.sh

# 7. Déploiement des composants de l'infrastructure
echo "🏗️  Déploiement des composants d'infrastructure..."
kubectl apply -f k8s/postgresql/ -n $NAMESPACE
kubectl apply -f k8s/services/rabbitmq.yaml -n $NAMESPACE

# 8. Déploiement de la base de données et attente
echo "🐘 Déploiement de PostgreSQL et attente..."
kubectl wait --for=condition=ready pod -l app=postgres -n $NAMESPACE --timeout=300s

# 9. Déploiement des microservices
echo "🔧 Déploiement des microservices..."
kubectl apply -f k8s/services/ -n $NAMESPACE

# 10. Déploiement du frontend
echo "🎨 Déploiement du frontend..."
kubectl apply -f k8s/frontend.yaml -n $NAMESPACE

# 11. Déploiement de l'ingress
echo "🌐 Déploiement de l'ingress..."
kubectl apply -f k8s/ingress.yaml -n $NAMESPACE

# 12. Déploiement des fonctionnalités bonus
echo "⭐ Déploiement des fonctionnalités bonus..."
kubectl apply -f k8s/network-policy.yaml -n $NAMESPACE
kubectl apply -f k8s/hpa.yaml -n $NAMESPACE

# 13. Déploiement de la stack de monitoring
echo "📊 Déploiement de Prometheus et Grafana..."
kubectl apply -f k8s/monitoring/namespace.yaml
kubectl apply -f k8s/monitoring/prometheus-rbac.yaml
kubectl apply -f k8s/monitoring/prometheus-configmap.yaml
kubectl apply -f k8s/monitoring/prometheus-deployment.yaml
kubectl apply -f k8s/monitoring/prometheus-service.yaml
kubectl apply -f k8s/monitoring/grafana-credentials.yaml
kubectl apply -f k8s/monitoring/grafana-deployment.yaml
kubectl apply -f k8s/monitoring/grafana-service.yaml

# 14. Configuration d'un Ingress pour Grafana
echo "🌍 Configuration de l'accès à Grafana..."
cat <<EOF | kubectl apply -f -
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: grafana-ingress
  namespace: monitoring
  annotations:
    kubernetes.io/ingress.class: "traefik"
    cert-manager.io/cluster-issuer: "letsencrypt-prod"
spec:
  tls:
  - hosts:
    - monitoring.aquaerp.cloud
    secretName: grafana-tls
  rules:
  - host: monitoring.aquaerp.cloud
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: grafana
            port:
              number: 3000
EOF

# 15. Exécution des tests de disponibilité pour les captures d'écran
echo "🔍 Exécution des tests pour démonstration..."
echo ""
echo "📊 Vérification des replicas:"
kubectl get deployments -n $NAMESPACE

echo ""
echo "🧪 Test de kill d'un pod (simulation de panne):"
POD_TO_DELETE=$(kubectl get pods -n $NAMESPACE | grep auth-service | head -n 1 | awk '{print $1}')
kubectl delete pod $POD_TO_DELETE -n $NAMESPACE
sleep 5
kubectl get pods -n $NAMESPACE | grep auth-service

echo ""
echo "📈 Test de scale up:"
kubectl scale deployment api-gateway --replicas=5 -n $NAMESPACE
sleep 10
kubectl get pods -n $NAMESPACE | grep api-gateway

echo ""
echo "📉 Test de scale down:"
kubectl scale deployment api-gateway --replicas=2 -n $NAMESPACE
sleep 10
kubectl get pods -n $NAMESPACE | grep api-gateway

echo ""
echo "💾 Test de persistance des données:"
POD_PG=$(kubectl get pods -n $NAMESPACE | grep postgres | awk '{print $1}')
kubectl exec -it $POD_PG -n $NAMESPACE -- psql -U postgres -d aquaerp -c "SELECT COUNT(*) FROM users;"

echo ""
echo "✅ Vérification du HPA:"
kubectl get hpa -n $NAMESPACE

echo ""
echo "🔒 Vérification des NetworkPolicies:"
kubectl get networkpolicies -n $NAMESPACE

echo ""
echo "📊 Vérification de la stack de monitoring:"
kubectl get pods -n monitoring

echo ""
echo "🏆 Déploiement pour démonstration terminé avec succès!"
echo "📸 N'oubliez pas de faire des captures d'écran des résultats ci-dessus"
echo ""
echo "📱 Accès à l'application:"
echo "   Frontend: https://app.aquaerp.local"
echo "   API: https://api.aquaerp.local"
echo "   Grafana: https://monitoring.aquaerp.cloud (admin/AquaERP2025)"
echo ""
echo "💡 Astuce pour accéder à Grafana en port-forward:"
echo "   kubectl port-forward svc/grafana 3000:3000 -n monitoring"
echo "   Puis accédez à http://localhost:3000 (admin/AquaERP2025)"
