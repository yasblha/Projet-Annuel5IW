# ---------- build stage ----------
FROM node:20-alpine AS builder
WORKDIR /app

# ① manifests (racine + 2 workspaces)
COPY package*.json tsconfig*.json ./
COPY Database/package*.json Database/
COPY services/auth-service/package*.json services/auth-service/

RUN npm install --workspaces --legacy-peer-deps

# ② code source
COPY Database/ Database/
COPY services/auth-service/ services/auth-service/

# ③ build ciblé
RUN npm run build -w Database -w services/auth-service


# ---------- runtime stage ----------
FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production

# seules les sources compilées d’auth‑service
COPY --from=builder /app/services/auth-service/dist ./dist

# dépendances runtime (optionnel : ajoute package-lock.json si tu préfères)
COPY package*.json ./
RUN npm ci --omit=dev --legacy-peer-deps

EXPOSE 3001
CMD ["node", "dist/main.js"]