# ═══════════════════════════════════════════════════════════════════════════════
# Stage 1: Build Frontend Assets
# ═══════════════════════════════════════════════════════════════════════════════
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package manifests
COPY package*.json ./

# Install dependencies cleanly
RUN npm ci

# Copy full frontend source
COPY . .

# Build production bundle to /app/dist
RUN npm run build

# ═══════════════════════════════════════════════════════════════════════════════
# Stage 2: Minimal High-Performance Nginx Runtime
# ═══════════════════════════════════════════════════════════════════════════════
FROM nginx:1.27-alpine AS runtime

# Remove default nginx static web pages
RUN rm -rf /usr/share/nginx/html/* /etc/nginx/conf.d/default.conf

# Copy customized Nginx server block for SPA routing & caching
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy compiled SPA static artifacts from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose standard HTTP port
EXPOSE 80

# Healthcheck to ensure Nginx is actively responding
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -q -O /dev/null http://127.0.0.1/health || exit 1

CMD ["nginx", "-g", "daemon off;"]
