# 💧 Gestion de la Facturation de l’Eau

> **Une plateforme complète et modulaire pour la gestion des contrats, factures, interventions et workflows dans le secteur de l’eau, basée sur une architecture microservices moderne.**

---

## 🗺️ Sommaire

- [🚀 Lancement rapide](#-lancement-rapide)
- [📦 Microservices](#-microservices)
- [✨ Fonctionnalités principales](#-fonctionnalités-principales)
- [🗂️ Structure du projet](#-structure-du-projet)
- [🖼️ Schéma d’architecture](#-schéma-darchitecture)
- [🧪 Tests & Qualité](#-tests--qualité)
- [📚 Ressources & Docs](#-ressources--docs)
- [🛠️ Contribution](#-contribution)
- [ℹ️ Informations complémentaires](#-informations-complémentaires)

---

## 🚀 Lancement rapide

> **Prérequis :**
> - [Docker](https://www.docker.com/get-started)
> - [Docker Compose](https://docs.docker.com/compose/)

```bash

git clone https://github.com/yasblha/aquerp.git
cd aquerp
docker compose up -d --build
```


- Accédez à l’interface de chaque microservice via les ports indiqués ci-dessous.
- **RabbitMQ UI** : [http://localhost:15672](http://localhost:15672) (login: `guest` / `guest`)
---
## 📦 Microservices

| Microservice         | Port                          | Description                                         |
|----------------------|-------------------------------|-----------------------------------------------------|
| 🛡️ **Auth**          | [3000](http://localhost:3001) | Authentification, gestion des utilisateurs et rôles |
| 🏢 **Agency**        | [3001](http://localhost:3002) | Gestion des agences et entités                      |
| 📄 **Contrat**       | [3002](http://localhost:3003) | Création et gestion des contrats clients            |
| 🔧 **Operation**     | [3003](http://localhost:3004) | Suivi des interventions et incidents terrain        |
| 💳 **Facture**       | [3004](http://localhost:3005) | Facturation manuelle/automatique, paiements         |
| 📁 **Affaire**       | [3005](http://localhost:3006) | Génération des affaires métiers liées aux workflows |
| 🔄 **Workflow**      | [3006](http://localhost:3007) | Orchestration des plans d’action métiers            |
| 📬 **Mailer**        | [3007](http://localhost:3008) | Notification mail (factures, relances, alertes)     |
| 🌐 **API Gateway**   | [8080](http://localhost:3000) | Point d’entrée unifié (reverse proxy)               |


---

## ✨ Fonctionnalités principales

<details>
<summary><strong>🔐 Authentification & Sécurité</strong></summary>

- Authentification via JWT, MFA
- SSO possible pour intégration collectivité
- Gestion dynamique des rôles
- Journalisation RGPD
</details>

<details>
<summary><strong>📑 Gestion des Contrats</strong></summary>

- Contrats individuels, collectifs, agricoles, commerciaux
- Gestion des co-signataires
- Tarification dynamique (profil, saison, tranche)
- Cycle de vie complet : demande, activation, modification, suspension, résiliation
</details>

<details>
<summary><strong>💳 Facturation & Paiement</strong></summary>

- Facturation manuelle ou automatique (par plan d’action)
- Paiements : CB, SEPA, mobile
- Suivi par client/compteur (pas de listing global)
- Relances automatiques, échéanciers, avoirs, duplicatas
</details>

<details>
<summary><strong>🔧 Interventions techniques</strong></summary>

- Planification intelligente des interventions
- Bons d’intervention PDF
- Suivi des incidents, astreintes, urgences
- Relevé IoT intégré
</details>

<details>
<summary><strong>📁 Affaires & Workflows</strong></summary>

- Plans d’action multi-étapes
- Étapes dynamiques (formulaire, API, validation)
- Assignation par rôle
- Questionnaires dynamiques intégrés
- Historisation des exécutions
</details>

---

## 🗂️ Structure du projet

```bash
project-root/
├── application/             # Usecases, services métier, DTOs
├── domain/                  # Entités métier, erreurs
├── infrastructure/          # Interfaces techniques
├── Database/                # Sequelize models, migrations
├── services/
│   ├── auth-service/
│   ├── agency-service/
│   ├── contrat-service/
│   ├── operation-service/
│   ├── facture-service/     # Spring Boot
│   ├── affaire-service/
│   ├── workflow-service/
│   ├── mailer-service/
│   └── api-gateway/
├── docker-compose.yml
└── README.md
```

---

## 🖼️ Schéma d’architecture

![Schéma d’architecture](schema-exemple.png)


> Placez votre schéma d’architecture dans le dossier racine ou `/docs` pour qu’il s’affiche sur GitHub.

---
## 🧪 Tests & Qualité

```bash
cd services/auth-service
npm run test
```

- Tests unitaires et d’intégration dans chaque microservice
- CI/CD à venir
- Lint et coverage recommandés

---


## 📚 Ressources & Docs

- [NestJS](https://docs.nestjs.com/)
- [Spring Boot](https://spring.io/)
- [Sequelize](https://sequelize.org/)
- [PostgreSQL](https://www.postgresql.org/)
- [RabbitMQ](https://www.rabbitmq.com/)
- [Docker](https://www.docker.com/)

---

## 🛠️ Contribution

Les contributions sont **bienvenues** !

1. Forkez ce dépôt
2. Créez une branche `feature/ma-feature`
3. Codez et testez
4. Proposez une PR

> Merci de documenter votre code et d’assurer la qualité des tests !

---

## ℹ️ Informations complémentaires

- PostgreSQL : `postgres` / `postgres`
- RabbitMQ : `guest` / `guest`
- Licence : MIT
- Contact : contactprojectys@gmail.com

---

> Ce projet est une base robuste, pensée pour être **modulaire**, **scalable** et **orientée métier**, adaptée aux régies, collectivités ou entreprises privées du secteur de l’eau.

---

**🚀 Prêt à contribuer ou à déployer ? Lancez-vous !**