FROM node:18-slim

WORKDIR /api

# Install OpenSSL for Prisma Client
RUN apt-get update -y && apt-get install -y openssl ca-certificates

# Copy package files first
COPY package*.json ./
COPY tsconfig.json ./
COPY prisma ./prisma/

# Install dependencies
RUN npm ci --prefer-offline

# Copy source code
COPY . .

# Generate Prisma client
RUN npm run prisma:generate

# Build the application
RUN npx tsc --skipLibCheck

# Set production environment
ENV NODE_ENV=production

# Expose application port
EXPOSE 3333

# Start the application with esm
CMD ["node", "-r", "module-alias/register", "dist/server.js"]