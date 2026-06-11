FROM oven/bun:alpine AS builder

WORKDIR /app
RUN apk add --no-cache fontconfig ttf-dejavu
COPY package.json ./
RUN bun install
COPY . .

# Re-run the build on every deploy so the Obsidian/CouchDB log sync (whose
# content lives outside the repo) is always re-fetched. update.sh passes a
# fresh CACHEBUST value, which invalidates this layer's cache; `bun install`
# above stays cached. Locally it defaults to 0 (cache reused).
ARG CACHEBUST=0
RUN echo "cachebust=${CACHEBUST}" && bun run build

FROM caddy:2-alpine AS runner

COPY --from=builder /app/dist /usr/share/caddy

EXPOSE 80
