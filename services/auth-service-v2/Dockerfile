FROM node:20-alpine AS builder

WORKDIR /app

COPY ./services/auth-service-v2/package*.json ./
RUN npm install

COPY ./services/auth-service-v2 ./
RUN npm run build

# Étape finale, plus légère
FROM node:20-alpine

WORKDIR /app

COPY --from=builder /app/package*.json ./
COPY --from=builder /app/dist ./dist
RUN npm install --only=production

EXPOSE 8080

CMD ["node", "dist/main.js"]