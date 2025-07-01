# Étape 1 : Base
FROM node:20-alpine

# Étape 2 : Installer les dépendances du projet global
WORKDIR /app
COPY package*.json ./
RUN npm install

# Étape 3 : Installer les dépendances spécifiques au auth-service
WORKDIR /app/services/auth-service
COPY ./services/auth-service/package*.json ./
RUN npm ci

# Étape 4 : Copier tout le contenu du projet
COPY services/auth-service .

ENV NODE_ENV=development \
    TZ=UTC

# Expose le port utilisé par le service
EXPOSE 3000

# Étape 5 : Lancer le service auth uniquement
CMD ["npm", "run", "start:dev"]
