# Auth Service - Documentation

Ce microservice gère l'authentification, les utilisateurs, les autorisations pour l'ensemble de la plateforme ainsi que les données de base des clients finaux.

## Vue d'ensemble du système

### Distinction importante : Utilisateurs vs Clients

Dans ce système, il est essentiel de comprendre la distinction fondamentale entre deux concepts :

1. **Utilisateurs (Users)** :
   - **Qui sont-ils ?** Ce sont les personnes qui **utilisent l'application** dans le cadre de leur travail (techniciens, commerciaux, agents technico-fonctionnels, administrateurs)
   - **Leur rôle** : Ils opèrent le système pour gérer les clients, contrats, factures, interventions, etc.
   - **Gestion** : Le auth-service est responsable de leur authentification, autorisations et gestion des profils
   - **Accès** : Ils ont des niveaux d'accès différents selon leur rôle (RBAC)

2. **Clients** :
   - **Qui sont-ils ?** Ce sont les **clients finaux** de l'entreprise ou de la mairie (consommateurs d'eau)
   - **Leur rôle** : Ils sont les destinataires des factures, contrats et interventions
   - **Types** : Peuvent être des particuliers ou des entreprises
   - **Gestion** : Leurs données de base sont gérées dans auth-service, mais leur gestion complète est dans le client-service
   - **Relation** : Ils sont liés à des contrats, compteurs, factures, etc.

Le auth-service maintient donc à la fois les utilisateurs du système et les données de base des clients pour des raisons de performance et de vérification rapide.

## Fonctionnalités principales

### 1. Gestion des utilisateurs de l'application
- Création de compte utilisateur (auto-inscription)
- Création d'utilisateurs par administrateur
- Invitation d'utilisateurs
- Gestion des profils utilisateurs
- Support multi-tenant
- Différents rôles : ADMIN, COMMERCIAL, TECHNICIEN, etc.

### 2. Authentification
- Connexion avec email/mot de passe
- Génération de JWT (JSON Web Tokens)
- Vérification et validation des tokens
- Blacklist de tokens révoqués
- Gestion de la déconnexion

### 3. Gestion des mots de passe
- Activation de compte par email
- Réinitialisation de mot de passe oublié
- Changement de mot de passe
- Validation de robustesse des mots de passe

### 4. Autorisations
- Contrôle d'accès basé sur les rôles (RBAC)
- Protection des routes par rôle
- Isolation des données multi-tenant

### 5. Gestion des données de base des clients finaux
- Création de clients (particuliers et entreprises)
- Mise à jour des informations clients
- Recherche et listage des clients
- Gestion des adresses clients
- Informations bancaires et modes de paiement
- Support pour entreprises avec SIRET et contacts

### 6. Communication inter-services
- Communication par RabbitMQ
- API REST pour les clients frontaux
- Synchronisation des événements d'utilisateurs

## Workflows principaux

### 1. Inscription utilisateur (personnel de l'entreprise)
1. L'utilisateur s'inscrit via l'API publique
2. Un compte est créé avec statut "EN_ATTENTE_VALIDATION"
3. Un email d'activation est envoyé via le mailer-service
4. L'utilisateur clique sur le lien d'activation et définit son mot de passe
5. Le compte est activé et l'utilisateur peut se connecter

### 2. Invitation utilisateur (personnel de l'entreprise)
1. Un administrateur invite un nouvel utilisateur
2. Un compte est créé avec statut "INVITE"
3. Un email d'invitation est envoyé avec un lien pour définir le mot de passe
4. L'utilisateur clique sur le lien et définit son mot de passe
5. Le compte est activé et l'utilisateur peut se connecter

### 3. Authentification
1. L'utilisateur soumet ses identifiants (email/mot de passe)
2. Le service vérifie les identifiants et génère un JWT si valides
3. Le token est renvoyé au client pour être utilisé dans les requêtes ultérieures
4. Le token contient les informations d'identification (ID, email, rôle, tenant)

### 4. Récupération de mot de passe
1. L'utilisateur demande une réinitialisation de mot de passe
2. Un token unique est généré et envoyé par email
3. L'utilisateur clique sur le lien et définit un nouveau mot de passe
4. Le mot de passe est mis à jour et l'utilisateur peut se connecter

### 5. Création de client (client final pour facturation)
1. Un utilisateur autorisé (ADMIN ou COMMERCIAL) crée un nouveau client
2. Le système vérifie que l'email et le téléphone ne sont pas déjà utilisés
3. Si le client est une entreprise, les informations d'entreprise sont enregistrées
4. L'adresse du client est enregistrée
5. Les informations bancaires sont stockées si fournies
6. Le client est créé avec un statut (ACTIF par défaut)
7. Ces informations de base seront utilisées par les autres services (facturation, contrat, etc.)

## Architecture technique

### API REST (HTTP)
- `POST /auth/register`: Inscription d'un utilisateur
- `POST /auth/login`: Connexion d'un utilisateur
- `POST /auth/register-by-admin`: Création d'utilisateur par administrateur
- `POST /auth/invite`: Invitation d'utilisateur
- `POST /auth/confirm`: Confirmation d'invitation
- `POST /auth/activate`: Activation de compte
- `POST /auth/forgot-password`: Demande de réinitialisation de mot de passe
- `POST /auth/reset-password`: Réinitialisation de mot de passe
- `PATCH /auth/profile`: Mise à jour de profil utilisateur
- `POST /auth/logout`: Déconnexion
- `GET /clients`: Liste des clients finaux
- `POST /clients`: Création d'un client final

### API Microservices (RabbitMQ)
- `auth.register`: Inscription d'utilisateur
- `auth.login`: Connexion
- `auth.admin.register`: Création d'utilisateur par administrateur
- `auth.invite`: Invitation d'utilisateur
- `auth.confirm`: Confirmation d'invitation
- `auth.activate`: Activation de compte
- `auth.reset-password`: Réinitialisation de mot de passe
- `auth.refresh`: Rafraîchissement de token
- `auth.me`: Récupération des informations utilisateur
- `auth.logout`: Déconnexion
- `clients.list`: Liste des clients finaux
- `clients.create`: Création d'un client final
- `clients.getById`: Récupération d'un client final par ID
- `clients.update`: Mise à jour d'un client final
- `clients.delete`: Suppression d'un client final (non implémenté)

### Événements émis
- `user.registered`: Émis lors de l'inscription d'un utilisateur
- `user.activated`: Émis lors de l'activation d'un compte
- `user.invited`: Émis lors de l'invitation d'un utilisateur
- `user.password.reset`: Émis lors de la réinitialisation d'un mot de passe
- `client.created`: Émis lors de la création d'un client final

### Modèles de données

#### Utilisateur (User)
- `id`: Identifiant unique
- `email`: Email de connexion
- `nom`, `prenom`: Informations personnelles
- `role`: Rôle dans le système (ADMIN, COMMERCIAL, TECHNICIEN, etc.)
- `statut`: EN_ATTENTE_VALIDATION, ACTIF, SUSPENDU, etc.
- `tenantId`: Identifiant du tenant

#### Client (client final pour facturation)
- `id`: Identifiant unique
- `nom`, `prenom`: Informations personnelles
- `email`, `telephone`: Coordonnées
- `type`: PARTICULIER ou ENTREPRISE
- `statut`: ACTIF, INACTIF ou SUSPENDU
- `rib`, `modePaiement`: Informations bancaires
- `tenantId`: Identifiant du tenant
- `adresseId`: Relation avec l'adresse
- `entrepriseId`: Relation avec l'entreprise (si applicable)

#### Adresse
- `id`: Identifiant unique
- `type`: Type d'adresse
- `ligne1`, `ligne2`: Lignes d'adresse
- `codePostal`, `ville`, `pays`: Localisation

#### Entreprise
- `id`: Identifiant unique
- `nom`: Nom de l'entreprise
- `siret`: Numéro SIRET
- `adresse`: Adresse JSON
- `contactEmail`, `contactTelephone`: Coordonnées

### Sécurité
- Hashage des mots de passe avec bcrypt
- JWT avec expiration et signature
- Validation de la robustesse des mots de passe
- Stockage sécurisé des tokens d'activation/réinitialisation
- Isolation multi-tenant des données utilisateurs

## Intégration avec d'autres services

### Mailer Service
- Envoi d'emails d'activation de compte
- Envoi d'emails d'invitation
- Envoi d'emails de réinitialisation de mot de passe

### API Gateway
- Validation des JWT pour toutes les requêtes
- Routage des requêtes d'authentification
- Distribution des identités aux microservices

### Client Service
- Synchronisation avec les informations clients complètes
- Communications via RabbitMQ pour la cohérence des données
- Le client-service gère les aspects avancés des clients finaux

### Facture Service
- Utilise les données clients pour la facturation
- Communication via RabbitMQ pour obtenir les informations clients

### Contrat Service
- Associe les clients à leurs contrats
- Utilise les données de base des clients pour initialiser les contrats

## Variables d'environnement

```env
PORT=3001
JWT_SECRET=your-secret-key
JWT_EXPIRATION=7d
RABBITMQ_URL=amqp://admin:admin@rabbitmq:5672
MAILER_SERVICE_URL=http://mailer-service:3000
DATABASE_URL=postgresql://postgres:postgres@postgres:5432/auth_db
```

## Démarrage du service

```bash
# Développement
npm run start:dev

# Production
npm run start
