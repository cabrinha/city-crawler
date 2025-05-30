# Multi-stage build for City Crawler - Vampires Interactive Map
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including dev dependencies for build)
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage - serve static files
FROM node:18-alpine AS production

# Install a simple HTTP server
RUN npm install -g serve

# Copy built application from builder stage
COPY --from=builder /app/dist /app

EXPOSE 3000

# Start the server
CMD ["serve", "-s", "/app", "-l", "3000"]