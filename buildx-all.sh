#!/bin/bash

# Script pour builder et pousser toutes les images AquaERP sur Docker Hub en linux/amd64
# Usage : chmod +x buildx-all.sh && ./buildx-all.sh

set -e

services=(
  auth-service
  api-gateway
  contrat-service
  facture-service
  intervention-service
  mailer-service
  operation-service
  workflow-service
  frontend
)

for service in "${services[@]}"; do
  echo "⏳ Build et push $service..."
  docker buildx build --platform linux/amd64 -t docker.io/yassblh/$service:latest -f services/$service/Dockerfile . --push
  echo "✅ $service pushé sur Docker Hub."
done

echo "✅ Toutes les images ont été rebuild et poussées sur Docker Hub en linux/amd64 !" 