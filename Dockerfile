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

# Create simple health check files
RUN echo "OK" > /app/healthz && \
    echo "OK" > /app/readyz

# Expose port 3000 (serve default port)
EXPOSE 3000

# Add health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3000/healthz || exit 1

# Start the server
CMD ["serve", "-s", "/app", "-l", "3000"]