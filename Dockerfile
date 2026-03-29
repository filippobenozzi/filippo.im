FROM oven/bun:alpine AS builder

WORKDIR /app
RUN apk add --no-cache fontconfig ttf-dejavu
COPY package.json ./
RUN bun install
COPY . .
RUN bun run build

FROM caddy:2-alpine AS runner

COPY --from=builder /app/dist /usr/share/caddy

EXPOSE 80
