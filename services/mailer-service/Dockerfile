FROM node:20-alpine

WORKDIR /app

COPY ./services/mailer-service/package*.json ./
RUN npm install --include=dev

COPY ./services/mailer-service/. .
RUN npm run build

CMD ["npm", "run", "start:dev"]