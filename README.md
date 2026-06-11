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
During build, OG images are generated as JPG files in `public/og/`.

## Log (synced from Obsidian)

The `/log` page is a single stream of dated posts, each also reachable at its own
indexable permalink `/log/YYYY/MM/YYYY-MM-DD`. Posts come from an Obsidian vault
synced to CouchDB via the [obsidian-livesync](https://github.com/vrtmrz/obsidian-livesync)
plugin: any note filed under `LOG_FOLDER/YYYY/MM/YYYY-MM-DD.md` is published.

At build time `scripts/sync-log.ts` reconstructs each note from CouchDB, downloads
the images it embeds into `public/log-media/`, and writes the posts into
`content/log/` (a generated, git-ignored collection). Nothing is fetched at
runtime — the result is plain static HTML, so **publishing a new note means
rebuilding the site**.

Configure the connection in `.env` (see `.env.example`): `COUCHDB_URL`,
`COUCHDB_DB`, `COUCHDB_USER`, `COUCHDB_PASSWORD`, `LOG_FOLDER`. If they are not
set, the sync is skipped and the build still succeeds. Run the sync on its own
with:

```bash
bun run sync:log
```

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
