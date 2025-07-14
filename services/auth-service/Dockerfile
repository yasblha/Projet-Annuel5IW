FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

COPY Database/ ./Database/

COPY tsconfig.base.json ./

RUN npm install

WORKDIR /app/services/auth-service

COPY services/auth-service/ ./

EXPOSE 3000

CMD ["npm", "run", "start:dev"]