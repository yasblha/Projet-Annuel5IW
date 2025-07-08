FROM node:20-alpine

WORKDIR /app

# Copy package files from root and auth-service
COPY package*.json ./
COPY services/auth-service/package*.json ./services/auth-service/

# Copy Database folder
COPY Database/ ./Database/

# Install root dependencies
RUN npm install --include=dev

# Install auth-service dependencies
WORKDIR /app/services/auth-service
RUN npm install --include=dev

# Copy auth-service source code
COPY services/auth-service/ ./

EXPOSE 3001

CMD ["npm", "run", "start:dev"]