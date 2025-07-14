# Facture-Service

Service de gestion des factures, paiements et lots de facturation pour le système X7.

## Fonctionnalités

### Gestion des Factures

- **Création de factures** : Génération de factures avec lignes détaillées, calcul automatique des montants et numérotation
- **Émission de factures** : Changement de statut et notification au client par email avec PDF
- **Annulation de factures** : Possibilité d'annuler une facture avec justification
- **Suivi des factures** : Consultation par contrat, par client et statut (brouillon, émise, payée, impayée, annulée)
- **Génération de PDF** : Création automatique de documents au format PDF lors de l'émission

### Gestion des Paiements

- **Enregistrement des paiements** : Support de multiples types de paiement (virement, carte, prélèvement, etc.)
- **Suivi des paiements** : Historique des paiements par facture et statuts de traitement
- **Mise à jour automatique du statut des factures** : Gestion des paiements partiels et complets

### Facturation par Lots

- **Création de lots de facturation** : Génération automatisée de factures par période (mensuelle, trimestrielle, annuelle)
- **Paramétrage des lots** : Filtrage par critères (type de contrat, zone géographique, etc.)
- **Traitement asynchrone** : Exécution des lots de facturation en arrière-plan avec suivi de progression
- **Statistiques de facturation** : Suivi des montants facturés et du nombre de factures par lot

### Relance et Notifications

- **Relance automatique** : Relance des clients pour les factures impayées après un délai configurable
- **Notifications email** : Intégration avec le mailer-service pour les notifications de facturation, paiement et relance

### Intégration avec d'autres Services

- **Contract-Service** : Récupération des informations de contrat pour la facturation
- **Compteur-Service** : Utilisation des relevés de compteur pour calculer la consommation
- **Mailer-Service** : Envoi de notifications par email lors des événements de facturation

## Architecture

Le service est construit sur une architecture hexagonale avec :
- **Couche Application** : Controllers, Services et DTOs
- **Couche Domain** : Modèles et Énumérations
- **Couche Infrastructure** : Adaptateurs de repository, gardes et configuration

## API REST

Documentation complète disponible via Swagger à l'adresse `/api-docs` une fois le service démarré.

### Principales Routes

#### Factures
- `POST /factures` : Créer une nouvelle facture
- `GET /factures/:id` : Consulter une facture
- `GET /factures/contrat/:contratId` : Lister les factures d'un contrat
- `GET /factures/client/:clientId` : Lister les factures d'un client
- `PUT /factures/:id/emettre` : Émettre une facture
- `PUT /factures/:id/annuler` : Annuler une facture
- `POST /factures/:id/paiements` : Enregistrer un paiement
- `POST /factures/relancer` : Relancer les factures impayées

#### Lots de Facturation
- `POST /lots-facturation` : Créer un nouveau lot de facturation
- `GET /lots-facturation/:id` : Consulter un lot de facturation
- `GET /lots-facturation` : Lister tous les lots de facturation
- `GET /lots-facturation/periode` : Rechercher les lots par période

## Installation

```bash
$ npm install
```

## Configuration

Créer un fichier `.env` à la racine du projet avec les variables suivantes :

```
PORT=3002
JWT_SECRET=your_jwt_secret
CONTRAT_SERVICE_URL=http://localhost:3001
COMPTEUR_SERVICE_URL=http://localhost:3003
MAILER_SERVICE_URL=http://localhost:3004
TARIF_SERVICE_URL=http://localhost:3005
```

## Démarrage

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e
```

## Sécurité

- Authentification via JWT
- Multi-tenancy avec isolation des données par tenant
- Audit logging de toutes les actions sensibles
