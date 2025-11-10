# Build stage
FROM node:22-alpine AS build

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json package-lock.json .env ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build application
RUN npm run build

# Remove development dependencies
RUN npm prune --production


# Production stage
FROM node:22-alpine AS production

# Set working directory
WORKDIR /app

# Set NODE_ENV
ENV NODE_ENV=production

# Copy built application from build stage
COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package.json ./
COPY --from=build /app/.env ./.env

# User for security
USER node

# Expose port if needed
EXPOSE 3000

# Start the application
CMD ["node", "dist/index.js"]