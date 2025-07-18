FROM node:20-alpine

WORKDIR /app

# Copier les fichiers de configuration depuis le répertoire racine
COPY package*.json ./
COPY tsconfig.base.json ./

RUN npm install

WORKDIR /app/services/api-gateway

# Copier le code du service
COPY services/api-gateway/ ./

EXPOSE 3000

ENV NODE_ENV=production

RUN npm run build
CMD ["npm", "run", "start:prod"]