# 💧 AquaERP - Plateforme de Gestion pour le Secteur de l'Eau

> Plateforme microservices pour la gestion des contrats, factures et interventions dans le secteur de l'eau, déployée sur Kubernetes.

## 🏗️ Architecture

- **Frontend**: Vue.js 3 + TypeScript + Pinia
- **Backend**: Microservices NestJS + SpringBoot
- **Communication**: API REST (externe), RabbitMQ (inter-services)
- **Base de données**: PostgreSQL avec volumes persistants
- **Déploiement**: Kubernetes sur DigitalOcean

## 📦 Microservices

| Service | Port | Description |
|---------|------|-------------|
| 🌐 **API Gateway** | 3000 | Point d'entrée unifié (reverse proxy) |
| 🛡️ **Auth Service** | 3001 | Authentification et utilisateurs |
| 📄 **Contrat Service** | 3002 | Gestion des contrats clients |
| 🔧 **Operation Service** | 3003 | Opérations techniques |
| 💳 **Facture Service** | 3004 | Facturation et paiements |
| 📬 **Mailer Service** | 3005 | Notifications par email |
| 📁 **Intervention Service** | 3006 | Interventions terrain |
| 🔄 **Workflow Service** | 3007 | Orchestration des processus |

Chaque service expose un endpoint `/health` sur son port assigné pour les health checks Kubernetes.

## 🚀 Déploiement Kubernetes

### Infrastructure déployée

- **Namespace**: `aquaerp` (application) et `monitoring` (observabilité)
- **Haute disponibilité**: Multiple replicas pour chaque service
- **Scaling**: Horizontal Pod Autoscaler (HPA)
- **Ingress**: Traefik avec HTTPS (cert-manager)
- **Sécurité**: NetworkPolicies, HTTPS
- **Monitoring**: Prometheus + Grafana

### Déploiement rapide

```bash
# Installation complète pour démonstration
./scripts/deploy-for-demo.sh

# Ou déploiement via CI/CD (GitHub Actions)
git push origin main
```

Le script `deploy-for-demo.sh` configure l'authentification DigitalOcean, déploie tous les composants et exécute les tests de haute disponibilité.

### Pipeline CI/CD

Le workflow GitHub Actions (`selective-deploy.yml`) offre:
- Détection des services modifiés
- Build et push des images Docker uniquement pour les services modifiés
- Mise à jour des deployments Kubernetes

## 📚 Documentation

Pour plus de détails, consultez:

- [📘 Guide de déploiement Kubernetes](/docs/kubernetes-deployment-guide.md)
- [🔍 Exemples de commandes](/docs/command-examples.md)
- [⭐ Fonctionnalités bonus](/docs/bonus-features-report.md)

## 🧪 Tests de haute disponibilité

- **Replicas**: Chaque service possède 2+ replicas
- **Tolérance aux pannes**: Test de kill de pods
- **Scaling horizontal**: Test de scale up/down
- **Persistance**: Test de redémarrage avec conservation des données

## 🌐 Accès en production

- **Frontend**: https://app.aquaerp.cloud
- **API**: https://api.aquaerp.cloud
- **Monitoring**: https://monitoring.aquaerp.cloud
