FROM node:20-alpine

WORKDIR /app/services/auth-service

COPY package*.json ./
RUN npm install

COPY . .

CMD ["npm", "run", "start:dev"]
