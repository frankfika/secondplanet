# ---- Builder ----
FROM node:18-alpine AS builder
RUN corepack enable && corepack prepare pnpm@9 --activate
WORKDIR /src
# Copy workspace manifests first for better caching
COPY pnpm-lock.yaml package.json pnpm-workspace.yaml ./
COPY apps/server/package.json apps/server/package.json
COPY packages/core/package.json packages/core/package.json
# Install with dev deps to allow building
RUN pnpm install --prod=false
# Copy source
COPY . .
# Build server (and core if needed)
RUN pnpm --filter @secondplanet/core build || true
RUN pnpm --filter @secondplanet/server build
# Prepare deployable server folder with production deps
RUN pnpm --filter @secondplanet/server --prod deploy /app

# ---- Runtime ----
FROM node:18-alpine
ENV NODE_ENV=production
WORKDIR /app
COPY --from=builder /app /app
EXPOSE 8080
CMD ["node","dist/main.js"]
