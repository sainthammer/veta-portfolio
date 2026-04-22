# ========== Stage 1: build ==========
FROM node:20-alpine AS builder

WORKDIR /app

# Install deps first (cached)
COPY package.json ./
RUN npm install --no-audit --no-fund

# Build
COPY . .
RUN npm run build

# ========== Stage 2: serve ==========
FROM nginx:1.27-alpine

# Remove default config
RUN rm /etc/nginx/conf.d/default.conf

COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html

# Security: run as non-root
RUN chown -R nginx:nginx /usr/share/nginx/html \
  && chmod -R 755 /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
