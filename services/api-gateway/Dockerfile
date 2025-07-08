FROM node:20-alpine

WORKDIR /app
COPY ./services/api-gateway/package*.json ./
RUN npm install --include=dev
COPY ./services/api-gateway/. .

EXPOSE 3000
RUN npm run build
CMD ["npx", "nest", "start", "--watch"]