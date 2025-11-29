# ---- Builder ----
FROM node:18-alpine AS builder
RUN corepack enable && corepack prepare pnpm@9 --activate
WORKDIR /src
COPY . .
RUN pnpm install --prod=false && pnpm --filter @secondplanet/web build

# ---- Nginx ----
FROM nginx:alpine
COPY --from=builder /src/packages/web/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx","-g","daemon off;"]

