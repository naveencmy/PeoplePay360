# ═══════════════════════════════════════════════════════════════════════════════
# Stage 1: Build & Dependencies Resolution
# ═══════════════════════════════════════════════════════════════════════════════
FROM node:20-alpine AS builder

WORKDIR /app

# Install build dependencies if needed
RUN apk add --no-cache python3 make g++

# Copy dependency manifests
COPY package*.json ./

# Install all dependencies including devDependencies for any build steps
RUN npm ci

# Copy source code
COPY . .

# Prune development dependencies for clean production layer
RUN npm prune --production

# ═══════════════════════════════════════════════════════════════════════════════
# Stage 2: Production Runtime (Minimal Attack Surface)
# ═══════════════════════════════════════════════════════════════════════════════
FROM node:20-alpine AS runner

# Install dumb-init for proper PID 1 signal handling & zombie process reaping
RUN apk add --no-cache dumb-init

# Security: Set environment
ENV NODE_ENV=production \
    PORT=3000

WORKDIR /app

# Create necessary directories and set permissions for non-root 'node' user
RUN chown -R node:node /app

# Copy production node_modules and application code from builder stage
COPY --chown=node:node --from=builder /app/node_modules ./node_modules
COPY --chown=node:node --from=builder /app/package.json ./package.json
COPY --chown=node:node --from=builder /app/src ./src

# Switch to dedicated unprivileged user
USER node

# Expose backend API port
EXPOSE 3000

# Native Node.js Healthcheck against /api/health with fail-fast exit
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD node -e "const http = require('http'); \
    const req = http.request({ \
      host: '127.0.0.1', \
      port: process.env.PORT || 3000, \
      path: '/api/health', \
      timeout: 4000 \
    }, (res) => process.exit(res.statusCode === 200 ? 0 : 1)); \
    req.on('error', () => process.exit(1)); \
    req.end();"

# Process management with dumb-init
ENTRYPOINT ["/usr/bin/dumb-init", "--"]
CMD ["node", "src/app.js"]
