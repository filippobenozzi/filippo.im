# filippo.im (Astro)

Static website powered by Astro, Tailwind, and Markdown/MDX content.

## Requirements

- Bun (latest stable)

## Run locally

```bash
bun install
bun run dev
```

## Build

```bash
bun install
bun run build
```

Build output is generated in `dist/`.

## Preview production build

```bash
bun run start
```

## Raspberry Pi Zero 2 W deployment

```bash
git clone https://github.com/filippobenozzi/filippo.im.git
cd filippo.im
bun install
bun run build
bun run start
```

For production, prefer serving `dist/` with Nginx or Caddy.

## Update scripts

```bash
./update-native.sh
```

Updates from Git and builds natively with Bun.

```bash
./update.sh
```

Updates from Git and deploys with Docker Compose.

Docker deployment serves the generated `dist/` files through Caddy on port `80` (mapped to host `3000`).
