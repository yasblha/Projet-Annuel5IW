FROM node:20-alpine

WORKDIR /app
COPY package*.json tsconfig.base.json tsconfig.json ./
COPY Database/ ./Database/
RUN npm install --legacy-peer-deps

WORKDIR /app/services/contrat-service
COPY services/contrat-service/package*.json ./
RUN npm install --legacy-peer-deps
COPY services/contrat-service/. ./

# 1. Build TS -> dist/
RUN npm run build

EXPOSE 3000
# 2. Lance le code JS compilé
CMD ["npm", "run", "start:dev"]
