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

# Bake the production API URL into the build. A default is set here so the value
# survives even when .env is not uploaded (gcloud source deploys respect
# .gitignore, which excludes .env). Override with --build-arg if the URL changes.
ARG VITE_API_BASE_URL=https://onedrive-backup-api-195362764770.europe-central2.run.app
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}

# Write a production env file too, so the value applies regardless of how Vite
# resolves environment variables during the build.
RUN echo "VITE_API_BASE_URL=$VITE_API_BASE_URL" > .env.production.local

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
