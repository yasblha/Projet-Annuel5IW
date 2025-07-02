FROM node:20-alpine

WORKDIR /app
COPY ./services/api-gateway/package*.json ./
RUN npm install
COPY ./services/api-gateway/. .

EXPOSE 3000
RUN npm run build
CMD ["npm", "run", "start:dev"]