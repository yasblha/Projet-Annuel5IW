FROM node:20-alpine

WORKDIR /app
COPY package*.json tsconfig.base.json tsconfig.json ./
COPY Database/ ./Database/
RUN npm install --legacy-peer-deps

WORKDIR /app/services/facture-service
COPY services/facture-service/package*.json ./
RUN npm install --legacy-peer-deps
# Installation globale de ts-node-dev
RUN npm install -g ts-node ts-node-dev tsconfig-paths
COPY services/facture-service/. ./

# 1. Build TS -> dist/
RUN npm run build

EXPOSE 3000
# 2. Lance le code JS compilé depuis dist/
CMD ["npm", "run", "start:dev"]
