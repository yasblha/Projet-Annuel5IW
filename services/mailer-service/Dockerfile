FROM node:20-slim

WORKDIR /app

# 1) Ne copier que les fichiers de dépendances du service mailer
COPY services/mailer-service/package*.json ./

# 2) Installer toutes les dépendances (incluant dev pour start:dev)
RUN npm install --legacy-peer-deps

# 3) Copier le code du service mailer uniquement
COPY services/mailer-service/. .

# 4) Compiler le code TypeScript
RUN npm run build

# 5) Exposer le port sur lequel Nest écoute
EXPOSE 3005

# 6) Définir la variable d'environnement NODE_ENV
ENV NODE_ENV=production

# 7) Lancer en mode production
CMD ["npm", "run", "start:prod"]
