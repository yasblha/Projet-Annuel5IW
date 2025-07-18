#!/bin/bash
set -e

# Créer un pod temporaire avec les outils de débogage nécessaires
cat << EOF | kubectl apply -f -
apiVersion: v1
kind: Pod
metadata:
  name: network-debug
  namespace: aquaerp
spec:
  containers:
  - name: network-tools
    image: nicolaka/netshoot
    command:
      - sleep
      - "3600"
EOF

echo "⏳ Attendez que le pod de débogage soit prêt..."
kubectl wait --for=condition=Ready pod/network-debug -n aquaerp --timeout=60s

echo "✅ Pod de débogage prêt"
echo ""
echo "🔍 Vérification de la connectivité API Gateway depuis le réseau interne"
kubectl exec -n aquaerp network-debug -- curl -v http://api-gateway:3000/health

echo ""
echo "🔍 Vérification de la connectivité API Gateway depuis le pod frontend"
FRONTEND_POD=$(kubectl get pod -n aquaerp -l app=frontend -o name | head -1)
FRONTEND_IP=$(kubectl get $FRONTEND_POD -n aquaerp -o jsonpath='{.status.podIP}')
kubectl exec -n aquaerp network-debug -- curl -v http://${FRONTEND_IP}:8080

echo ""
echo "🔍 Analyse DNS du domaine api.aquaerp.cloud"
kubectl exec -n aquaerp network-debug -- dig api.aquaerp.cloud

echo ""
echo "🔍 Test de la connectivité externe vers api.aquaerp.cloud"
kubectl exec -n aquaerp network-debug -- curl -v https://api.aquaerp.cloud/health
