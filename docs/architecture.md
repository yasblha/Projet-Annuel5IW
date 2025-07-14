# Architecture AquaERP - Déploiement Cloud

## Vue d'ensemble

AquaERP est une application microservices déployée sur DigitalOcean Kubernetes (DOKS) avec une architecture moderne et scalable.

## Schéma d'architecture

```mermaid
graph TB
    subgraph "Utilisateur"
        U1["Navigateur"]
    end
    
    subgraph "DigitalOcean Kubernetes Cluster"
        subgraph "Ingress Layer"
            ING["Nginx Ingress Controller"]
            CERT["cert-manager (Let's Encrypt)"]
        end
        
        subgraph "Frontend"
            FE["Frontend (Vue.js)"]
        end
        
        subgraph "API Gateway"
            GW["API Gateway (NestJS)"]
        end
        
        subgraph "Microservices"
            AUTH["Auth Service"]
            CONTRAT["Contrat Service"]
            FACTURE["Facture Service"]
            INTERV["Intervention Service"]
            MAILER["Mailer Service"]
            OP["Operation Service"]
            WF["Workflow Service"]
        end
        
        subgraph "Database"
            PG["PostgreSQL (DO Managed)"]
        end
        
        subgraph "Monitoring"
            PROM["Prometheus"]
            GRAF["Grafana"]
            SENTRY["Sentry"]
        end
    end
    
    subgraph "External Services"
        SMTP["SMTP Provider"]
        REG["DigitalOcean Container Registry"]
    end
    
    U1 -->|HTTPS| ING
    ING -->|/| FE
    ING -->|/api/| GW
    GW -->|REST/gRPC| AUTH
    GW -->|REST/gRPC| CONTRAT
    GW -->|REST/gRPC| FACTURE
    GW -->|REST/gRPC| INTERV
    GW -->|REST/gRPC| MAILER
    GW -->|REST/gRPC| OP
    GW -->|REST/gRPC| WF
    
    AUTH -->|DB| PG
    CONTRAT -->|DB| PG
    FACTURE -->|DB| PG
    INTERV -->|DB| PG
    OP -->|DB| PG
    WF -->|DB| PG
    
    MAILER -->|SMTP| SMTP
    
    REG -.->|Images| AUTH
    REG -.->|Images| CONTRAT
    REG -.->|Images| FACTURE
    REG -.->|Images| INTERV
    REG -.->|Images| MAILER
    REG -.->|Images| OP
    REG -.->|Images| WF
    REG -.->|Images| GW
    REG -.->|Images| FE
    
    PROM -->|Metrics| AUTH
    PROM -->|Metrics| CONTRAT
    PROM -->|Metrics| FACTURE
    PROM -->|Metrics| INTERV
    PROM -->|Metrics| MAILER
    PROM -->|Metrics| OP
    PROM -->|Metrics| WF
    PROM -->|Metrics| GW
    
    GRAF -->|Dashboard| PROM
    SENTRY -->|Error Tracking| AUTH
    SENTRY -->|Error Tracking| CONTRAT
    SENTRY -->|Error Tracking| FACTURE
    SENTRY -->|Error Tracking| INTERV
    SENTRY -->|Error Tracking| MAILER
    SENTRY -->|Error Tracking| OP
    SENTRY -->|Error Tracking| WF
    SENTRY -->|Error Tracking| GW
```

## Composants principaux

### 1. Frontend (Vue.js)
- **Technologie** : Vue.js 3 + TypeScript
- **Déploiement** : Containerisé, servi via Nginx
- **URL** : https://aquaerp.cloud

### 2. API Gateway
- **Technologie** : NestJS
- **Rôle** : Routage, authentification, rate limiting
- **URL** : https://aquaerp.cloud/api/

### 3. Microservices
Chaque service est déployé avec :
- **2 réplicas** pour la haute disponibilité
- **Health checks** (readiness/liveness probes)
- **Variables d'environnement** via Secrets/ConfigMaps
- **Monitoring** Prometheus + Sentry

#### Services disponibles :
- **Auth Service** : Authentification, JWT, gestion utilisateurs
- **Contrat Service** : Gestion des contrats
- **Facture Service** : Génération et gestion des factures
- **Intervention Service** : Planification des interventions
- **Mailer Service** : Envoi d'emails
- **Operation Service** : Gestion des opérations
- **Workflow Service** : Orchestration des processus métier

### 4. Base de données
- **PostgreSQL** managé par DigitalOcean
- **Migrations** : Sequelize
- **Sauvegarde** : Automatique (quotidienne)

### 5. Infrastructure
- **Cluster** : DOKS (3 nœuds)
- **Ingress** : Nginx + cert-manager
- **TLS** : Let's Encrypt automatique
- **Registry** : DigitalOcean Container Registry

## Sécurité

### Niveau Infrastructure
- **Pare-feu** : Ports 22, 80, 443 uniquement
- **TLS** : Certificats automatiques
- **Network Policies** : Isolation des pods

### Niveau Application
- **Authentification** : JWT + 2FA
- **Rate Limiting** : Nginx annotations
- **Secrets** : Kubernetes Secrets
- **Health Checks** : Endpoints protégés

## Monitoring & Observabilité

### Métriques
- **Prometheus** : Collecte des métriques
- **Grafana** : Dashboards et alertes
- **Node Exporter** : Métriques système

### Logs
- **Centralisés** : Via Kubernetes
- **Retention** : 30 jours

### Alertes
- **Email** : Notifications automatiques
- **Slack** : Intégration optionnelle

## CI/CD Pipeline

### GitHub Actions
1. **Build** : Images Docker pour chaque service
2. **Push** : Vers DigitalOcean Container Registry
3. **Deploy** : `kubectl apply -f k8s/`
4. **Health Check** : Vérification des déploiements

### Déclenchement
- **Automatique** : Push sur `main`
- **Manuel** : Via GitHub Actions UI

## Sauvegarde & Récupération

### Stratégie 3-2-1
- **1** : Snapshots PostgreSQL (quotidien)
- **2** : Velero → DigitalOcean Spaces
- **3** : Réplication vers ams3

### Récupération
- **RTO** : < 1 heure
- **RPO** : < 24 heures

## Performance

### Scalabilité
- **Horizontal** : Auto-scaling basé sur CPU/mémoire
- **Vertical** : Ressources ajustables par service

### Optimisations
- **Caching** : Redis (optionnel)
- **CDN** : Pour les assets statiques
- **Compression** : Gzip activé

## Maintenance

### Mises à jour
- **Rolling Updates** : Zéro downtime
- **Rollback** : Via kubectl ou GitHub Actions

### Monitoring
- **Uptime** : 99.9%
- **SLA** : Support 24/7

---

*Document généré automatiquement - Dernière mise à jour : $(date)* 