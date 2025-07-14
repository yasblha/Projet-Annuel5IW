#!/bin/bash

# Script pour régénérer tous les manifests avec la bonne structure

echo "Régénération des manifests Kubernetes..."

# Template pour les services
generate_service_manifest() {
    local service_name=$1
    local port=$2
    local env_vars=$3
    
    cat > "k8s/services/${service_name}.yaml" << EOF
apiVersion: apps/v1
kind: Deployment
metadata:
  name: ${service_name}
  namespace: aquaerp
spec:
  replicas: 2
  selector:
    matchLabels:
      app: ${service_name}
  template:
    metadata:
      labels:
        app: ${service_name}
    spec:
      imagePullSecrets:
      - name: docr-secret
      containers:
      - name: ${service_name}
        image: registry.digitalocean.com/aquaerp-registry/${service_name}:latest
        ports:
        - containerPort: ${port}
        env:
        - name: NODE_ENV
          valueFrom:
            configMapKeyRef:
              name: app-config
              key: NODE_ENV
        - name: DATABASE_HOST
          valueFrom:
            configMapKeyRef:
              name: app-config
              key: DATABASE_HOST
        - name: DATABASE_PORT
          valueFrom:
            configMapKeyRef:
              name: app-config
              key: DATABASE_PORT
        - name: DATABASE_NAME
          valueFrom:
            configMapKeyRef:
              name: app-config
              key: DATABASE_NAME
        - name: DATABASE_USERNAME
          valueFrom:
            secretKeyRef:
              name: postgres-secret
              key: username
        - name: DATABASE_PASSWORD
          valueFrom:
            secretKeyRef:
              name: postgres-secret
              key: password
        - name: JWT_SECRET
          valueFrom:
            secretKeyRef:
              name: jwt-secret
              key: secret
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /health
            port: ${port}
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /health
            port: ${port}
          initialDelaySeconds: 5
          periodSeconds: 5
---
apiVersion: v1
kind: Service
metadata:
  name: ${service_name}
  namespace: aquaerp
spec:
  selector:
    app: ${service_name}
  ports:
  - port: ${port}
    targetPort: ${port}
  type: ClusterIP
EOF
}

# Régénération des services
echo "Régénération des services..."
generate_service_manifest "contrat-service" "3002"
generate_service_manifest "facture-service" "3003"
generate_service_manifest "intervention-service" "3004"
generate_service_manifest "mailer-service" "3005"
generate_service_manifest "operation-service" "3006"
generate_service_manifest "workflow-service" "3007"

echo ""
echo "🎉 Tous les manifests ont été régénérés"
echo "Tu peux maintenant redéployer avec: kubectl apply -f k8s/services/" 