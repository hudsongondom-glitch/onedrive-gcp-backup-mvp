# ── Stage 1: build ───────────────────────────────────────────────
FROM node:20-slim AS builder

WORKDIR /app

# Install dependencies first (layer-cached unless package*.json changes)
COPY package*.json ./
RUN npm ci

# Copy source and build.
# VITE_API_BASE_URL is baked in at build time from the .env file that was
# already committed, or it can be overridden with --build-arg at image build time.
COPY . .

ARG VITE_API_BASE_URL
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}

RUN npm run build

# ── Stage 2: serve ────────────────────────────────────────────────
FROM nginx:1.27-alpine

# Replace the default nginx config with our SPA-aware one.
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy the Vite production output.
COPY --from=builder /app/dist /usr/share/nginx/html

# Cloud Run requires the container to listen on 8080.
EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]
