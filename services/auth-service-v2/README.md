# Service d'Authentification V2

Ce service implémente un système d'authentification complet avec gestion des utilisateurs, des rôles et des agences.

## Fonctionnalités

- Inscription d'un administrateur avec création automatique d'une agence
- Connexion sécurisée avec JWT
- Invitation d'utilisateurs par email
- Activation de compte avec définition de mot de passe
- Mot de passe oublié et réinitialisation
- Gestion des rôles (ADMIN, USER, MANAGER)
- Multi-tenant avec filtrage par agence
- Sécurité renforcée (mots de passe forts, expiration des mots de passe, blocage après tentatives échouées)

## Workflow d'invitation et d'activation

1. **Admin** : Invite un utilisateur via l'interface en spécifiant son email et son rôle
2. **Système** : Génère un token unique et envoie un email d'invitation
3. **Utilisateur invité** : Reçoit l'email, clique sur le lien d'invitation
4. **Utilisateur invité** : Définit son mot de passe et active son compte automatiquement

## Endpoints API

### Authentification

- `POST /auth/register` - Inscription d'un administrateur et création d'une agence
- `POST /auth/login` - Connexion avec email et mot de passe
- `POST /auth/activate` - Activation d'un compte avec token et définition du mot de passe
- `POST /auth/forgot-password` - Demande de réinitialisation de mot de passe
- `POST /auth/reset-password` - Réinitialisation du mot de passe avec token

### Utilisateurs

- `POST /users/invite` - Invitation d'un nouvel utilisateur (Admin uniquement)
- `GET /users` - Liste des utilisateurs de l'agence
- `GET /users/me` - Profil de l'utilisateur courant

## Sécurité

- Mots de passe forts (12 caractères minimum, chiffres, lettres, symboles)
- Expiration des mots de passe tous les 60 jours
- Blocage temporaire après 5 tentatives de connexion échouées
- Filtrage des données par agence (multi-tenant)
- Authentification JWT avec expiration
- Autorisation basée sur les rôles

## Communication avec d'autres services

- Utilise RabbitMQ pour communiquer avec le service de messagerie (mailer-service)
- Envoie des emails pour les invitations et les réinitialisations de mot de passe

## Configuration

Les variables d'environnement suivantes sont disponibles :

- `DB_HOST` - Hôte de la base de données
- `DB_NAME` - Nom de la base de données
- `DB_USER` - Utilisateur de la base de données
- `DB_PASS` - Mot de passe de la base de données
- `RABBITMQ_URL` - URL de connexion à RabbitMQ
- `AUTH_SERVICE_HOST` - Hôte du service d'authentification
- `AUTH_SERVICE_PORT` - Port du service d'authentification
- `JWT_SECRET` - Clé secrète pour la signature des JWT
- `FRONTEND_URL` - URL du frontend pour les liens dans les emails
