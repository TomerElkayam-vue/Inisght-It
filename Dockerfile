# 1. Install dependencies and build frontend
FROM node:22.11.0-alpine AS frontend-builder
WORKDIR /app

COPY package.json package-lock.json ./
COPY database ./database
COPY packages ./packages
COPY tailwind.config.js ./
COPY tsconfig*.json ./
COPY nx.json ./

COPY apps/frontend/package.json ./apps/frontend/
COPY apps/frontend/tsconfig* ./apps/frontend/
COPY apps/frontend/vite.config.* ./apps/frontend/
COPY apps/frontend/tailwind.config.js ./apps/frontend/
COPY apps/frontend/postcss.config.js ./apps/frontend/

RUN npm install --legacy-peer-deps

COPY apps/frontend ./apps/frontend

RUN npm run build:ui

# 1. Install dependencies and build frontend
FROM node:22.11.0-alpine AS backend-builder
WORKDIR /app

COPY package.json package-lock.json ./
COPY database ./database
COPY packages ./packages
COPY tailwind.config.js ./
COPY tsconfig*.json ./
COPY nx.json ./

COPY apps/backend/package.json ./apps/backend/
COPY apps/backend/tsconfig* ./apps/backend/
COPY apps/backend/webpack.config.js ./apps/backend/

RUN npm install --legacy-peer-deps

COPY apps/backend ./apps/backend

RUN npm run build:server


# 3. Production image
FROM node:22.11.0-alpine AS runner
WORKDIR /app

COPY .env.production .env

# Install Nginx and Supervisor
RUN apk add --no-cache nginx supervisor && \
    mkdir -p /var/log/supervisor && \
    mkdir -p /var/log/nginx && \
    mkdir -p /var/run && \
    chmod -R 755 /var/log/supervisor && \
    chmod -R 755 /var/log/nginx && \
    chmod -R 755 /var/run

# Copy built frontend to Nginx html dir
COPY --from=frontend-builder /app ./
COPY --from=frontend-builder /app/dist/apps/frontend /usr/share/nginx/html
RUN chmod -R 755 /usr/share/nginx/html

# Copy built backend
COPY --from=backend-builder /app/dist/apps/backend ./apps/backend/dist
COPY --from=backend-builder /app/package*.json ./

# Install only production dependencies for backend
RUN npm install --only=production --legacy-peer-deps

# Nginx config
COPY nginx.conf /etc/nginx/nginx.conf

# Supervisor config
COPY supervisord.conf /etc/supervisord.conf

# Expose ports
EXPOSE 80

# Start both backend and Nginx
CMD ["/usr/bin/supervisord", "-c", "/etc/supervisord.conf"]
