# Contract Service V2

Service de gestion des contrats basé sur l'architecture microservices avec NestJS et RabbitMQ.

## Architecture

Ce service suit l'architecture du service `auth-service-v2` avec une isolation multi-tenant via `agency_id` et une communication par messages RabbitMQ.

### Structure du projet

```
contract-service-v2/
├── src/
│   ├── contracts/              # Module de gestion des contrats
│   │   ├── contracts.service.ts
│   │   ├── contracts.module.ts
│   │   └── contracts.message-handler.ts
│   ├── templates/              # Module de gestion des templates
│   │   ├── templates.service.ts
│   │   ├── templates.module.ts
│   │   └── templates.message-handler.ts
│   ├── dto/                    # Data Transfer Objects
│   │   ├── create-contract.dto.ts
│   │   ├── create-template.dto.ts
│   │   └── validate-contract.dto.ts
│   ├── utils/                  # Utilitaires
│   │   └── jwt.utils.ts
│   ├── app.module.ts           # Module principal
│   └── main.ts                 # Point d'entrée
├── init-db.sql                 # Script d'initialisation de la base de données
└── package.json                # Dépendances
```

## Modèle de données

### Tables

1. **contract_templates** - Modèles de contrats réutilisables
   - `id` (UUID) - Identifiant unique
   - `name` (VARCHAR) - Nom du modèle
   - `body_md` (TEXT) - Contenu du contrat en Markdown
   - `periodicity` (VARCHAR) - Périodicité (MENSUEL, TRIMESTRIEL, ANNUEL)
   - `price` (NUMERIC) - Prix de base
   - `created_at` (TIMESTAMPTZ) - Date de création

2. **contracts** - Contrats générés pour les clients
   - `id` (UUID) - Identifiant unique
   - `agency_id` (UUID) - ID de l'agence (isolation multi-tenant)
   - `client_id` (UUID) - ID du client
   - `template_id` (UUID) - ID du modèle de contrat
   - `meter_id` (UUID) - ID du compteur associé (optionnel)
   - `reference` (VARCHAR) - Référence unique (ex: CTR-2025-0007)
   - `status` (VARCHAR) - Statut (DRAFT, VALIDATED, SIGNED, TERMINATED)
   - `start_date` (DATE) - Date de début
   - `end_date` (DATE) - Date de fin (optionnel)
   - `periodicity` (VARCHAR) - Périodicité
   - `price` (NUMERIC) - Prix
   - `created_at` (TIMESTAMPTZ) - Date de création
   - `validated_at` (TIMESTAMPTZ) - Date de validation
   - `signed_at` (TIMESTAMPTZ) - Date de signature
   - `terminated_at` (TIMESTAMPTZ) - Date de résiliation
   - `updated_at` (TIMESTAMPTZ) - Date de mise à jour

## Cycle de vie des contrats

```
DRAFT → VALIDATED → SIGNED → TERMINATED
```

1. **DRAFT** - Contrat créé mais non validé
2. **VALIDATED** - Contrat validé par l'agence
3. **SIGNED** - Contrat signé par le client
4. **TERMINATED** - Contrat résilié

## Endpoints RabbitMQ

### Templates

- `templates.create` - Créer un nouveau modèle de contrat
- `templates.list` - Lister tous les modèles de contrats
- `templates.getById` - Récupérer un modèle par son ID
- `templates.update` - Mettre à jour un modèle
- `templates.delete` - Supprimer un modèle

### Contrats

- `contracts.create` - Créer un nouveau contrat
- `contracts.list` - Lister les contrats (avec filtres)
- `contracts.getById` - Récupérer un contrat par son ID
- `contracts.validate` - Valider un contrat
- `contracts.sign` - Marquer un contrat comme signé
- `contracts.terminate` - Résilier un contrat
- `contracts.updateMeter` - Associer un compteur à un contrat

## Installation

```bash
npm install
```

## Configuration

Créez un fichier `.env` à la racine du projet avec les variables suivantes :

```
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=postgres
DATABASE_NAME=x7
JWT_SECRET=your_jwt_secret
RABBITMQ_URL=amqp://localhost:5672
```

## Initialisation de la base de données

Exécutez le script SQL pour créer les tables nécessaires :

```bash
psql -U postgres -d x7 -f init-db.sql
```

## Démarrage

```bash
npm run start:dev
```
