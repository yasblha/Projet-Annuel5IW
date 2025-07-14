FROM node:20-alpine

WORKDIR /app
COPY package*.json tsconfig.base.json tsconfig.json ./
COPY Database/ ./Database/
RUN npm install --legacy-peer-deps

WORKDIR /app/services/operation-service
COPY services/operation-service/package*.json ./
RUN npm install --legacy-peer-deps
COPY services/operation-service/. ./

# 1. Build TS -> dist/
RUN npm run build

EXPOSE 3000
# 2. Lance le code JS compilé
CMD ["npm", "run", "start:dev"]
