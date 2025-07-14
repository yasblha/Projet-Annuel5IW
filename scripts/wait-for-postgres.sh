#!/bin/bash

# Script pour attendre que PostgreSQL soit prêt

echo "Waiting for PostgreSQL to be ready..."

until nc -z postgres-service 5432; do
  echo "PostgreSQL is not ready yet. Waiting..."
  sleep 2
done

echo "PostgreSQL is ready! Starting application..."

# Exécute la commande passée en argument
exec "$@" 