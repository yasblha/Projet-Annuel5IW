# 💧 WaterApp - Gestion de la Facturation de l'Eau

> **Une plateforme moderne et complète pour la gestion des contrats, factures, interventions et workflows dans le secteur de l'eau, basée sur une architecture microservices avec authentification avancée.**

---

## 🗺️ Sommaire

- [🚀 Lancement rapide](#-lancement-rapide)
- [🏗️ Architecture](#️-architecture)
- [📦 Microservices](#-microservices)
- [✨ Fonctionnalités principales](#-fonctionnalités-principales)
- [🔐 Flux d'authentification](#-flux-dauthentification)
- [🗂️ Structure du projet](#️-structure-du-projet)
- [🖼️ Schémas d'architecture](#️-schémas-darchitecture)
- [🧪 Tests & Qualité](#-tests--qualité)
- [📚 Ressources & Docs](#-ressources--docs)
- [🛠️ Contribution](#-contribution)
- [ℹ️ Informations complémentaires](#️-informations-complémentaires)

---

## 🚀 Lancement rapide

> **Prérequis :**
> - [Docker](https://www.docker.com/get-started)
> - [Docker Compose](https://docs.docker.com/compose/)
> - [Nest.js](https://nodejs.org/) (pour le développement)

```bash
# Cloner le projet
git clone https://github.com/yasblha/aquerp.git
cd aquerp

# Lancer tous les services
docker compose up -d --build

# Ou lancer uniquement les services essentiels
docker compose up -d postgres rabbitmq
```

### 🌐 Accès aux interfaces

| Service | URL                                                | Description |
|---------|----------------------------------------------------|-------------|
| **Frontend** | [http://localhost:8080](http://localhost:5173)     | Interface utilisateur Vue.js |
| **API Gateway** | [http://localhost:3000](http://localhost:8080)     | Point d'entrée unifié |
| **RabbitMQ UI** | [http://localhost:15672](http://localhost:15672)   | Gestion des messages (guest/guest) |
| **PostgreSQL** | localhost:5432                                     | Base de données (postgres/postgres) |

---

## 🏗️ Architecture

### Architecture Microservices

L'application suit une architecture microservices moderne avec :

- **Frontend** : Vue.js 3 + TypeScript + Pinia + Tailwind CSS
- **Backend** : NestJS + TypeScript + Sequelize
- **Communication** : RabbitMQ pour les événements asynchrones
- **Base de données** : PostgreSQL
- **API Gateway** : NestJS avec reverse proxy

### Patterns utilisés

- **Domain-Driven Design (DDD)** : Séparation claire des couches
- **Event-Driven Architecture** : Communication asynchrone via RabbitMQ
- **CQRS** : Séparation des commandes et requêtes
- **Repository Pattern** : Abstraction de l'accès aux données
- **Use Case Pattern** : Logique métier encapsulée

---

## 📦 Microservices

| Microservice | Port | Technologie | Description |
|--------------|------|-------------|-------------|
| 🛡️ **Auth Service** | 3001 | NestJS      | Authentification, gestion des utilisateurs et rôles |
| 🏢 **Agency Service** | 3002 | NestJS      | Gestion des agences et entités |
| 📄 **Contrat Service** | 3003 | NestJS      | Création et gestion des contrats clients |
| 🔧 **Operation Service** | 3004 | NestJS      | Suivi des interventions et incidents terrain |
| 💳 **Facture Service** | 3005 | SpringBoot  | Facturation manuelle/automatique, paiements |
| 📁 **Affaire Service** | 3006 | NestJS      | Génération des affaires métiers liées aux workflows |
| 🔄 **Workflow Service** | 3007 | NestJS      | Orchestration des plans d'action métiers |
| 📬 **Mailer Service** | 3008 | NestJS      | Notification mail (factures, relances, alertes) |
| 🌐 **API Gateway** | 3000 | NestJS      | Point d'entrée unifié (reverse proxy) |

---

## ✨ Fonctionnalités principales

### 🔐 Authentification & Sécurité
- ✅ **Inscription avec activation par email**
- ✅ **Authentification JWT avec refresh tokens**
- ✅ **Gestion des rôles (Admin, Client, Technicien)**
- ✅ **Réinitialisation de mot de passe sécurisée**
- ✅ **Validation des tokens d'activation**
- ✅ **Journalisation RGPD**

### 📑 Gestion des Contrats
- Contrats individuels, collectifs, agricoles, commerciaux
- Gestion des co-signataires
- Tarification dynamique (profil, saison, tranche)
- Cycle de vie complet : demande, activation, modification, suspension, résiliation

### 💳 Facturation & Paiement
- Facturation manuelle ou automatique (par plan d'action)
- Paiements : CB, SEPA, mobile
- Suivi par client/compteur (pas de listing global)
- Relances automatiques, échéanciers, avoirs, duplicatas

### 🔧 Interventions techniques
- Planification intelligente des interventions
- Bons d'intervention PDF
- Suivi des incidents, astreintes, urgences
- Relevé IoT intégré

### 📁 Affaires & Workflows
- Plans d'action multi-étapes
- Étapes dynamiques (formulaire, API, validation)
- Assignation par rôle
- Questionnaires dynamiques intégrés
- Historisation des exécutions

---

## 🔐 Flux d'authentification

### 1. Inscription utilisateur

```mermaid
sequenceDiagram
    participant U as Utilisateur
    participant F as Frontend
    participant AG as API Gateway
    participant AS as Auth Service
    participant RQ as RabbitMQ
    participant MS as Mailer Service

    U->>F: Remplit formulaire d'inscription
    F->>AG: POST /auth/register
    AG->>AS: POST /auth/register
    AS->>AS: Génère token d'activation
    AS->>AS: Sauvegarde utilisateur (statut: INACTIF)
    AS->>RQ: Émet 'user.registered'
    RQ->>MS: Délivre l'événement
    MS->>MS: Envoie email avec lien d'activation
    AS->>AG: Retourne succès
    AG->>F: Retourne succès
    F->>U: Affiche message de confirmation
```

### 2. Activation du compte

```mermaid
sequenceDiagram
    participant U as Utilisateur
    participant F as Frontend
    participant AG as API Gateway
    participant AS as Auth Service

    U->>F: Clique sur lien d'activation
    F->>AG: GET /auth/confirm?token=xxx
    AG->>AS: GET /auth/confirm?token=xxx
    AS->>AS: Valide le token
    AS->>AS: Met à jour statut (ACTIF)
    AS->>AG: Retourne succès
    AG->>F: Retourne succès
    F->>U: Redirige vers login
```

### 3. Connexion

```mermaid
sequenceDiagram
    participant U as Utilisateur
    participant F as Frontend
    participant AG as API Gateway
    participant AS as Auth Service

    U->>F: Saisit credentials
    F->>AG: POST /auth/login
    AG->>AS: POST /auth/login
    AS->>AS: Vérifie credentials
    AS->>AS: Génère JWT tokens
    AS->>AG: Retourne tokens
    AG->>F: Retourne tokens
    F->>F: Stocke tokens (Pinia)
    F->>U: Redirige vers dashboard
```

---

## 🗂️ Structure du projet

```
X7/
├── 📁 application/                    # Usecases, services métier, DTOs
│   ├── dtos/                         # Data Transfer Objects
│   ├── mappers/                      # Mappers entre entités et DTOs
│   ├── services/                     # Services métier
│   ├── usecases/                     # Cas d'usage métier
│   └── validators/                   # Validation des données
├── 📁 Database/                      # Modèles et migrations
│   ├── models/                       # Modèles Sequelize
│   ├── migrations/                   # Migrations de base de données
│   ├── repositories/                 # Couche d'accès aux données
│   └── seeders/                      # Données de test
├── 📁 domain/                        # Entités métier et erreurs
│   ├── entité/                       # Entités du domaine
│   └── errors/                       # Erreurs métier
├── 📁 infrastructure/                # Interfaces techniques
│   ├── adapters/                     # Adaptateurs externes
│   ├── config/                       # Configuration
│   ├── events/                       # Gestion des événements
│   ├── guards/                       # Guards d'authentification
│   └── logger/                       # Logging
├── 📁 frontend/                      # Interface utilisateur Vue.js
│   ├── src/
│   │   ├── components/               # Composants réutilisables
│   │   │   ├── layout/               # Layout (Sidebar, Navbar)
│   │   │   ├── dashboard/            # Composants dashboard
│   │   │   └── ui/                   # Composants UI de base
│   │   ├── views/                    # Pages de l'application
│   │   ├── stores/                   # Stores Pinia
│   │   ├── services/                 # Services API
│   │   └── types/                    # Types TypeScript
│   └── package.json
├── 📁 services/                      # Microservices
│   ├── auth-service/                 # Service d'authentification
│   ├── agency-service/               # Service des agences
│   ├── contrat-service/              # Service des contrats
│   ├── operation-service/            # Service des opérations
│   ├── facture-service/              # Service de facturation
│   ├── affaire-service/              # Service des affaires
│   ├── workflow-service/             # Service des workflows
│   ├── mailer-service/               # Service d'envoi d'emails
│   └── api-gateway/                  # Passerelle API
├── 📁 docs/                          # Documentation
│   └── flux.svg                      # Diagramme de flux d'authentification
├── docker-compose.yml                # Configuration Docker
└── README.md
```

---
---

---

## 🖼️ Schémas d'architecture

### Flux d'authentification complet

![Flux d'authentification](docs/flux.svg)

### Architecture générale

![Architecture générale](schema-exemple.png)

---

## 🧪 Tests & Qualité

```bash
# Tests unitaires
cd services/auth-service
npm run test

# Tests d'intégration
npm run test:e2e

# Linting
npm run lint

# Build
npm run build
```

### Qualité du code

- ✅ **ESLint** : Linting TypeScript/JavaScript
- ✅ **Prettier** : Formatage du code
- ✅ **Husky** : Git hooks
- ✅ **Jest** : Tests unitaires et d'intégration
- ✅ **TypeScript** : Typage statique

---

## 📚 Ressources & Docs

### Technologies utilisées

- **Frontend** : [Vue.js 3](https://vuejs.org/), [Pinia](https://pinia.vuejs.org/), [Tailwind CSS](https://tailwindcss.com/)
- **Backend** : [NestJS](https://nestjs.com/), [TypeScript](https://www.typescriptlang.org/)
- **Base de données** : [PostgreSQL](https://www.postgresql.org/), [Sequelize](https://sequelize.org/)
- **Message Broker** : [RabbitMQ](https://www.rabbitmq.com/)
- **Cache** : [Redis](https://redis.io/)
- **Containerisation** : [Docker](https://www.docker.com/), [Docker Compose](https://docs.docker.com/compose/)

### Documentation

- [Guide de développement](docs/DEVELOPMENT.md)
- [Guide de déploiement](docs/DEPLOYMENT.md)
- [API Documentation](docs/API.md)
- [Architecture Decision Records](docs/ADR/)

---

## 🛠️ Contribution

Les contributions sont **bienvenues** !

### Processus de contribution

1. **Forkez** ce dépôt
2. **Créez** une branche `feature/ma-feature`
3. **Codez** et **testez** votre fonctionnalité
4. **Commitez** avec des messages clairs
5. **Proposez** une Pull Request

### Standards de code

- ✅ **TypeScript** strict mode
- ✅ **ESLint** + **Prettier**
- ✅ **Tests unitaires** obligatoires
- ✅ **Documentation** des APIs
- ✅ **Messages de commit** conventionnels

### Structure des commits

```
feat: ajouter l'authentification par email
fix: corriger la validation des tokens
docs: mettre à jour le README
test: ajouter les tests d'intégration
refactor: refactoriser le service d'authentification
```

---

## ℹ️ Informations complémentaires

### Configuration par défaut

| Service | Host | Port | Credentials |
|---------|------|------|-------------|
| **PostgreSQL** | localhost | 5432 | postgres/postgres |
| **RabbitMQ** | localhost | 5672 | guest/guest |
| **Redis** | localhost | 6379 | - |
| **Frontend** | localhost | 8080 | - |

### Variables d'environnement

```bash
# Base de données
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/waterapp

# RabbitMQ
RABBITMQ_URL=amqp://guest:guest@localhost:5672

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=1h

# Email (Gmail)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

### Développement local

```bash
# Installer les dépendances
npm install

# Lancer en mode développement
npm run dev

# Lancer les tests
npm run test

# Build pour production
npm run build
```

---

## 🚀 Roadmap

### Phase 1 - Authentification ✅
- [x] Inscription avec activation par email
- [x] Connexion JWT
- [x] Gestion des rôles
- [x] Interface utilisateur moderne

### Phase 2 - Gestion des contrats (en cours)
- [ ] CRUD des contrats
- [ ] Gestion des abonnements
- [ ] Tarification dynamique
- [ ] Workflows de validation

### Phase 3 - Facturation (en cours)
- [ ] Génération automatique des factures
- [ ] Système de paiement
- [ ] Relances automatiques
- [ ] Rapports de facturation

### Phase 4 - Interventions 🔧
- [ ] Planification des interventions
- [ ] Suivi en temps réel
- [ ] Gestion des incidents
- [ ] Rapports d'intervention

---

> Ce projet est une base robuste, pensée pour être **modulaire**, **scalable** et **orientée métier**, adaptée aux régies, collectivités ou entreprises privées du secteur de l'eau.

---

**🚀 Prêt à contribuer ou à déployer ? Lancez-vous !**

*Contact : contactprojectys@gmail.com*

## Déploiement Cloud (DigitalOcean Kubernetes)

### Prérequis
- Accès à un cluster DOKS (DigitalOcean Kubernetes)
- Registre DOCR créé (ex: registry.digitalocean.com/factu-reg)
- Secrets GitHub configurés : DOCKER_USERNAME, DOCKER_PASSWORD, DIGITALOCEAN_ACCESS_TOKEN

### Build & Push manuels (optionnel)
```sh
docker build -t registry.digitalocean.com/factu-reg/auth-service:latest -f services/auth-service/Dockerfile .
docker push registry.digitalocean.com/factu-reg/auth-service:latest
# ... répéter pour chaque service et le frontend
```

### Déploiement Kubernetes
```sh
kubectl apply -f k8s/
```

### CI/CD automatique
- Un push sur la branche `main` déclenche le workflow GitHub Actions :
  - Build & push des images Docker
  - Déploiement automatique sur le cluster

### Variables d'environnement attendues (exemple auth-service)
- DATABASE_URL
- JWT_SECRET
- SENTRY_DSN
- ...

Voir `k8s/secrets-example.yaml` et `k8s/configmap-example.yaml` pour la structure.

### Ingress & domaine
- Le frontend est exposé sur https://aquaerp.cloud
- L'API Gateway est accessible via https://aquaerp.cloud/api/

---

Pour toute modification, adapter les manifests dans `k8s/` et relancer le pipeline.