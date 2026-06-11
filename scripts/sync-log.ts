import { promises as fs } from 'node:fs';
import path from 'node:path';

/**
 * Build-time sync of "log" posts from an Obsidian LiveSync CouchDB vault.
 *
 * LiveSync stores every file as a document whose `_id` is the vault path. The
 * body is split into chunk documents (`type: "leaf"`) referenced by `children`,
 * with an optional `eden` map carrying some chunks inline. Text files keep the
 * content as-is in the chunks; binary files (images, pdfs) keep it base64.
 *
 * We pull every note under LOG_FOLDER/YYYY/MM/YYYY-MM-DD.md, rebuild the
 * markdown, download the images it embeds into public/log-media, rewrite the
 * Obsidian-specific syntax to plain markdown, and write one file per day into
 * content/log so Astro can treat them as a content collection. Nothing here
 * ships secrets to the client: the output is plain static files.
 */

const ROOT = process.cwd();
const CONTENT_DIR = path.join(ROOT, 'content', 'log');
const MEDIA_DIR = path.join(ROOT, 'public', 'log-media');
const MEDIA_URL_BASE = '/log-media';

const COUCHDB_URL = (process.env.COUCHDB_URL ?? '').replace(/\/+$/, '');
const COUCHDB_DB = process.env.COUCHDB_DB ?? '';
const COUCHDB_USER = process.env.COUCHDB_USER ?? '';
const COUCHDB_PASSWORD = process.env.COUCHDB_PASSWORD ?? '';
const LOG_FOLDER = (process.env.LOG_FOLDER ?? 'Log').replace(/^\/+|\/+$/g, '');
const LOG_LIMIT = Number(process.env.LOG_LIMIT ?? '0') || 0; // 0 = no limit (for local testing)

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const IMAGE_EXT_RE = /\.(png|jpe?g|gif|webp|avif|svg|bmp|tiff?)$/i;

interface LiveSyncDoc {
  _id: string;
  type?: string;
  data?: string;
  children?: string[];
  eden?: Record<string, { data?: string }> | unknown[];
  deleted?: boolean;
  _deleted?: boolean;
  mtime?: number;
  size?: number;
}

interface AllDocsRow {
  id: string;
  doc?: LiveSyncDoc;
  error?: string;
}

function missingConfig(): string[] {
  return ['COUCHDB_URL', 'COUCHDB_DB', 'COUCHDB_USER', 'COUCHDB_PASSWORD'].filter(
    (key) => !process.env[key]
  );
}

function authHeader(): string {
  return 'Basic ' + Buffer.from(`${COUCHDB_USER}:${COUCHDB_PASSWORD}`).toString('base64');
}

async function couch<T>(pathname: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${COUCHDB_URL}/${COUCHDB_DB}${pathname}`, {
    ...init,
    headers: {
      Authorization: authHeader(),
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
  });
  if (!res.ok) {
    throw new Error(`CouchDB ${pathname} -> ${res.status} ${res.statusText}`);
  }
  return (await res.json()) as T;
}

/** Fetch many documents by id, batched, returning a map of id -> doc. */
async function bulkDocs(ids: string[]): Promise<Map<string, LiveSyncDoc>> {
  const map = new Map<string, LiveSyncDoc>();
  const unique = [...new Set(ids)];
  const BATCH = 400;
  for (let i = 0; i < unique.length; i += BATCH) {
    const keys = unique.slice(i, i + BATCH);
    const body = JSON.stringify({ keys });
    const result = await couch<{ rows: AllDocsRow[] }>('/_all_docs?include_docs=true', {
      method: 'POST',
      body,
    });
    for (const row of result.rows) {
      if (row.doc) map.set(row.id, row.doc);
    }
  }
  return map;
}

function edenMap(doc: LiveSyncDoc): Record<string, { data?: string }> {
  const eden = doc.eden;
  if (eden && !Array.isArray(eden)) return eden as Record<string, { data?: string }>;
  return {};
}

/** Collect the chunk ids a document needs that are not already inline in eden. */
function missingChunkIds(doc: LiveSyncDoc): string[] {
  const inline = edenMap(doc);
  return (doc.children ?? []).filter((id) => typeof inline[id]?.data !== 'string');
}

/** Reassemble a document body from its chunks (eden first, then fetched leaves). */
function assembleParts(doc: LiveSyncDoc, chunks: Map<string, LiveSyncDoc>): string[] {
  if (doc.children && doc.children.length > 0) {
    const inline = edenMap(doc);
    return doc.children.map((id) => inline[id]?.data ?? chunks.get(id)?.data ?? '');
  }
  return typeof doc.data === 'string' ? [doc.data] : [];
}

function assembleText(doc: LiveSyncDoc, chunks: Map<string, LiveSyncDoc>): string {
  return assembleParts(doc, chunks).join('');
}

function assembleBinary(doc: LiveSyncDoc, chunks: Map<string, LiveSyncDoc>): Buffer {
  const parts = assembleParts(doc, chunks);
  // LiveSync chunks a binary's base64 stream; decoding the concatenation is the
  // common case. If the size doesn't match, fall back to per-chunk decoding.
  const concat = Buffer.from(parts.join(''), 'base64');
  if (!doc.size || concat.length === doc.size) return concat;
  const perChunk = Buffer.concat(parts.map((p) => Buffer.from(p, 'base64')));
  return perChunk.length === doc.size ? perChunk : concat;
}

function isDeleted(doc: LiveSyncDoc): boolean {
  return Boolean(doc.deleted || doc._deleted);
}

function safeMediaName(attachmentPath: string): string {
  return attachmentPath.replace(/^\/+/, '').replace(/[^a-zA-Z0-9._-]+/g, '-');
}

async function ensureCleanDir(dir: string): Promise<void> {
  await fs.rm(dir, { recursive: true, force: true });
  await fs.mkdir(dir, { recursive: true });
}

/**
 * Resolve an Obsidian embed/link target (which may be just a filename) to a
 * real document id, using an index of every path in the vault.
 */
function buildPathIndex(ids: string[]): {
  byFull: Set<string>;
  byBasename: Map<string, string[]>;
} {
  const byFull = new Set(ids);
  const byBasename = new Map<string, string[]>();
  for (const id of ids) {
    if (id.startsWith('h:') || id.startsWith('_')) continue;
    const base = id.split('/').pop() ?? id;
    const list = byBasename.get(base) ?? [];
    list.push(id);
    byBasename.set(base, list);
  }
  return { byFull, byBasename };
}

function resolveTarget(
  target: string,
  index: ReturnType<typeof buildPathIndex>
): string | null {
  const clean = target.split('#')[0].split('|')[0].trim().replace(/^\/+/, '');
  if (!clean) return null;
  if (index.byFull.has(clean)) return clean;
  const decoded = decodeURIComponent(clean);
  if (index.byFull.has(decoded)) return decoded;
  const base = clean.split('/').pop() ?? clean;
  const matches = index.byBasename.get(base) ?? index.byBasename.get(decodeURIComponent(base));
  return matches && matches.length > 0 ? matches[0] : null;
}

main().catch((error) => {
  console.error('[sync-log] failed:', error);
  process.exit(1);
});

async function main(): Promise<void> {
  const missing = missingConfig();
  if (missing.length > 0) {
    await fs.mkdir(CONTENT_DIR, { recursive: true }); // keep the collection dir present
    console.warn(
      `[sync-log] skipped — missing ${missing.join(', ')} (set them in .env, see .env.example). ` +
        `Existing content/log is left untouched.`
    );
    return;
  }
  console.log(`[sync-log] source: ${COUCHDB_URL}/${COUCHDB_DB} folder: ${LOG_FOLDER}/`);

  // 1. Index every path so Obsidian's shortest-form links can be resolved.
  const allDocs = await couch<{ rows: { id: string }[] }>(
    '/_all_docs?limit=1000000000'
  );
  const allIds = allDocs.rows.map((r) => r.id);
  const pathIndex = buildPathIndex(allIds);

  // 2. Fetch the note documents under LOG_FOLDER.
  const start = encodeURIComponent(`"${LOG_FOLDER}/"`);
  const end = encodeURIComponent(`"${LOG_FOLDER}/￿"`);
  const noteRows = await couch<{ rows: AllDocsRow[] }>(
    `/_all_docs?include_docs=true&startkey=${start}&endkey=${end}`
  );

  let notes = noteRows.rows
    .map((r) => r.doc)
    .filter((d): d is LiveSyncDoc => Boolean(d) && !isDeleted(d!))
    .filter((d) => d._id.toLowerCase().endsWith('.md'));

  // Keep only date-named notes and sort newest first.
  type Note = { doc: LiveSyncDoc; date: string };
  let dated: Note[] = notes
    .map((doc) => {
      const base = (doc._id.split('/').pop() ?? '').replace(/\.md$/i, '');
      return { doc, date: base };
    })
    .filter(({ date }) => DATE_RE.test(date))
    .sort((a, b) => (a.date < b.date ? 1 : -1));

  if (LOG_LIMIT > 0) dated = dated.slice(0, LOG_LIMIT);

  if (dated.length === 0) {
    console.log(`[sync-log] no notes found under ${LOG_FOLDER}/ — writing empty log.`);
  }

  // 3. Bulk-fetch the text chunks for all notes, then assemble each body.
  const noteChunkIds = dated.flatMap(({ doc }) => missingChunkIds(doc));
  const noteChunks = await bulkDocs(noteChunkIds);
  const assembled = dated.map(({ doc, date }) => ({
    date,
    id: doc._id,
    text: assembleText(doc, noteChunks),
  }));

  // 4. Find embedded attachments across all notes and resolve them to doc ids.
  const wanted = new Map<string, string>(); // attachment docId -> media url
  const referenced: { ref: string; resolved: string | null }[] = [];
  for (const note of assembled) {
    for (const ref of findReferences(note.text)) {
      const resolved = resolveTarget(ref, pathIndex);
      referenced.push({ ref, resolved });
      if (resolved && IMAGE_EXT_RE.test(resolved) && !wanted.has(resolved)) {
        wanted.set(resolved, `${MEDIA_URL_BASE}/${safeMediaName(resolved)}`);
      }
    }
  }

  // 5. Download + decode the referenced images.
  await ensureCleanDir(MEDIA_DIR);
  const attachmentDocs = await bulkDocs([...wanted.keys()]);
  const attachmentChunkIds = [...attachmentDocs.values()].flatMap((d) => missingChunkIds(d));
  const attachmentChunks = await bulkDocs(attachmentChunkIds);

  let imageCount = 0;
  for (const [docId, url] of wanted) {
    const doc = attachmentDocs.get(docId);
    if (!doc) {
      console.warn(`[sync-log] attachment not found: ${docId}`);
      continue;
    }
    const buffer = assembleBinary(doc, attachmentChunks);
    await fs.writeFile(path.join(MEDIA_DIR, safeMediaName(docId)), buffer);
    imageCount += 1;
  }

  // 6. Rewrite Obsidian syntax to plain markdown and write the collection.
  await ensureCleanDir(CONTENT_DIR);
  for (const note of assembled) {
    const body = rewriteMarkdown(note.text, pathIndex, wanted);
    const frontmatter = `---\ndate: '${note.date}'\n---\n\n`;
    await fs.writeFile(path.join(CONTENT_DIR, `${note.date}.md`), frontmatter + body.trim() + '\n');
  }

  console.log(
    `[sync-log] wrote ${assembled.length} note(s) and ${imageCount} image(s).`
  );
}

/** All embed/link targets that might point at an attachment. */
function findReferences(text: string): string[] {
  const refs: string[] = [];
  // ![[target]] and [[target]] (Obsidian wikilinks/embeds)
  for (const m of text.matchAll(/!?\[\[([^\]]+)\]\]/g)) refs.push(m[1]);
  // ![alt](target) markdown images
  for (const m of text.matchAll(/!\[[^\]]*\]\(([^)]+)\)/g)) refs.push(m[1]);
  return refs;
}

/**
 * Convert Obsidian markdown to plain markdown:
 *  - image embeds  ![[img]] / ![alt](img)  -> ![alt](/log-media/...)
 *  - note embeds   ![[note]]               -> link text (no public target)
 *  - wikilinks     [[note|alias]]          -> alias text
 */
function rewriteMarkdown(
  text: string,
  index: ReturnType<typeof buildPathIndex>,
  media: Map<string, string>
): string {
  let out = text;

  // ![[target|alt]] embeds
  out = out.replace(/!\[\[([^\]]+)\]\]/g, (_m, inner: string) => {
    const [target, alias] = inner.split('|');
    const resolved = resolveTarget(target, index);
    if (resolved && media.has(resolved)) {
      return `![${(alias ?? '').trim()}](${media.get(resolved)})`;
    }
    return (alias ?? target).trim();
  });

  // [[target|alias]] wikilinks -> plain text (alias or last path segment)
  out = out.replace(/\[\[([^\]]+)\]\]/g, (_m, inner: string) => {
    const [target, alias] = inner.split('|');
    if (alias) return alias.trim();
    const name = target.split('/').pop() ?? target;
    return name.replace(/\.md$/i, '').trim();
  });

  // ![alt](target) markdown images pointing at vault attachments
  out = out.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (whole, alt: string, target: string) => {
    if (/^https?:\/\//i.test(target)) return whole;
    const resolved = resolveTarget(target, index);
    if (resolved && media.has(resolved)) {
      return `![${alt}](${media.get(resolved)})`;
    }
    return whole;
  });

  return out;
}
