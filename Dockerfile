FROM oven/bun:alpine AS base

WORKDIR /app
COPY package.json ./
RUN bun install
COPY . .
RUN bun run build

ENV NODE_ENV=production

EXPOSE 3000
CMD ["bun", "run", "start"]
