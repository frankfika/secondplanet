# ---- Builder ----
FROM node:18-alpine AS builder
RUN corepack enable && corepack prepare pnpm@9 --activate
WORKDIR /src
COPY . .
# Install all workspaces (include devDependencies for build tools)
RUN pnpm install --prod=false
# Build workspace packages used by server
RUN pnpm --filter @secondplanet/core build && pnpm --filter @secondplanet/server build

# ---- Runtime ----
FROM node:18-alpine
ENV NODE_ENV=production
WORKDIR /app
# Copy built server dist and package manifest
COPY --from=builder /src/apps/server/dist /app/apps/server/dist
COPY --from=builder /src/apps/server/package.json /app/apps/server/package.json
# Copy built core workspace so node_modules workspace symlink can resolve
COPY --from=builder /src/packages/core/dist /app/packages/core/dist
COPY --from=builder /src/packages/core/package.json /app/packages/core/package.json
# Copy node_modules from builder (contains workspace links and deps)
COPY --from=builder /src/node_modules /app/node_modules
# Default port
EXPOSE 8080
WORKDIR /app/apps/server
CMD ["node","dist/main.js"]

