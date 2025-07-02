FROM node:20-alpine

WORKDIR /app

COPY ./services/mailer-service/package*.json ./
RUN npm install

COPY ./services/mailer-service/. .

CMD ["npm", "run", "start:dev"]