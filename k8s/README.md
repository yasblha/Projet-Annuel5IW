# Manifests Kubernetes AquaERP

Ce dossier contient les manifests de déploiement Kubernetes pour chaque microservice et le frontend de l'application AquaERP.

## Structure des fichiers

### Services Backend
- `auth-service.yaml` - Service d'authentification
- `api-gateway.yaml` - Gateway API
- `contrat-service.yaml` - Service de gestion des contrats
- `facture-service.yaml` - Service de facturation
- `intervention-service.yaml` - Service d'interventions
- `mailer-service.yaml` - Service d'envoi d'emails
- `operation-service.yaml` - Service d'opérations
- `workflow-service.yaml` - Service de workflows

### Frontend
- `frontend.yaml` - Application Vue.js

### Infrastructure
- `ingress.yaml` - Ingress Nginx pour exposer les services
- `secrets-example.yaml` - Exemple de Secret Kubernetes
- `configmap-example.yaml` - Exemple de ConfigMap
- `monitoring.yaml` - Prometheus et Grafana
- `database-init.yaml` - Job d'initialisation de la base de données

## Déploiement

### Prérequis
- Cluster DOKS configuré
- Registre DOCR accessible
- Secrets et ConfigMaps créés

### Commandes de déploiement

```bash
# Déploiement complet
kubectl apply -f k8s/

# Déploiement par service
kubectl apply -f k8s/auth-service.yaml
kubectl apply -f k8s/api-gateway.yaml
# ... etc

# Vérification
kubectl get pods
kubectl get services
kubectl get ingress
```

### Variables d'environnement

Chaque service nécessite des variables d'environnement spécifiques. Voir les exemples dans :
- `secrets-example.yaml` pour les variables sensibles
- `configmap-example.yaml` pour la configuration non-sensible

### Monitoring

Le monitoring est déployé via `monitoring.yaml` :
- Prometheus pour la collecte de métriques
- Grafana pour les dashboards

### Initialisation de la base de données

Le job `database-init.yaml` exécute les migrations Sequelize au démarrage.

## Configuration

### Ingress
- Domaine : aquaerp.cloud
- TLS : Certificats Let's Encrypt automatiques
- Frontend : https://aquaerp.cloud
- API : https://aquaerp.cloud/api/

### Health Checks
Tous les services incluent des probes de santé :
- Readiness Probe : Vérifie si le service est prêt
- Liveness Probe : Vérifie si le service est vivant

### Réplicas
- Services backend : 2 réplicas
- Frontend : 2 réplicas
- Monitoring : 1 réplica

## Maintenance

### Mise à jour d'un service
```bash
# Mettre à jour l'image
kubectl set image deployment/auth-service auth-service=registry.digitalocean.com/factu-reg/auth-service:new-tag

# Vérifier le rollout
kubectl rollout status deployment/auth-service
```

### Rollback
```bash
kubectl rollout undo deployment/auth-service
```

### Logs
```bash
kubectl logs -l app=auth-service
kubectl logs -f deployment/auth-service
```

---

**Note** : Ces manifests sont optimisés pour DigitalOcean Kubernetes (DOKS) avec le registre DOCR. 