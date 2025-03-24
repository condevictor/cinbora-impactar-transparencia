FROM node:18-slim

WORKDIR /api

# Install OpenSSL for Prisma Client
RUN apt-get update -y && apt-get install -y openssl ca-certificates

# Copy package files first
COPY package*.json ./
COPY tsconfig.json ./
COPY prisma ./prisma/

# Install dependencies with explicit mime version
RUN npm install mime@3.0.0 --save-exact && \
    npm ci --prefer-offline

# Copy source code
COPY . .

# Generate Prisma client
RUN npm run prisma:generate

# Build the application
RUN npx tsc --skipLibCheck

# Create a simple path alias module (with explicit paths)
RUN echo "const tsConfigPaths = require('tsconfig-paths');" > module-alias.js && \
    echo "console.log('Registering TypeScript path aliases...');" >> module-alias.js && \
    echo "tsConfigPaths.register({" >> module-alias.js && \
    echo "  baseUrl: '/api/dist'," >> module-alias.js && \
    echo "  paths: {" >> module-alias.js && \
    echo "    '@modules/*': ['/api/dist/modules/*']," >> module-alias.js && \
    echo "    '@shared/*': ['/api/dist/shared/*']," >> module-alias.js && \
    echo "    '@config/*': ['/api/dist/config/*']," >> module-alias.js && \
    echo "    '@middlewares/*': ['/api/dist/middlewares/*']," >> module-alias.js && \
    echo "    '@routeParams/*': ['/api/dist/routeParams/*']" >> module-alias.js && \
    echo "  }" >> module-alias.js && \
    echo "});" >> module-alias.js

# Set production environment
ENV NODE_ENV=production

# Expose application port
EXPOSE 3333

# Start the application with path resolution
CMD ["node", "--no-warnings", "-r", "./module-alias.js", "dist/server.js"]