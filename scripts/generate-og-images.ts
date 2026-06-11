import { promises as fs, mkdirSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { escapeSvgText, getOgSlugFromPath, wrapTitle } from '../src/lib/og';

const ROOT = process.cwd();
const BLOG_DIR = path.join(ROOT, 'content', 'blog');
const OG_DIR = path.join(ROOT, 'public', 'og');
const BG_FILE = path.join(ROOT, 'public', 'og-bg.png');
const FONT_DIR = path.join(ROOT, 'scripts', 'fonts');
const FONT_FAMILY = "'Open Sans', sans-serif";

// librsvg (used by sharp to rasterize the SVG overlay) resolves font families
// through fontconfig, so the bundled Open Sans files must be discoverable. We
// write a self-contained fontconfig file that only points at scripts/fonts and
// expose it via FONTCONFIG_FILE before sharp is loaded. This keeps OG rendering
// identical on macOS (local) and Alpine (Docker build) without relying on any
// system-installed font.
function configureFonts(): void {
  const fcDir = path.join(os.tmpdir(), 'filippo-og-fontconfig');
  const cacheDir = path.join(fcDir, 'cache');
  mkdirSync(cacheDir, { recursive: true });

  const confPath = path.join(fcDir, 'fonts.conf');
  writeFileSync(
    confPath,
    `<?xml version="1.0"?>
<!DOCTYPE fontconfig SYSTEM "fonts.dtd">
<fontconfig>
  <dir>${FONT_DIR}</dir>
  <cachedir>${cacheDir}</cachedir>
</fontconfig>
`
  );

  process.env.FONTCONFIG_FILE = confPath;
  process.env.FONTCONFIG_PATH = fcDir;
}

configureFonts();

// Import sharp only after FONTCONFIG_FILE is set so fontconfig initializes with
// our configuration.
const sharp = (await import('sharp')).default;

const STATIC_PAGES: Array<{ path: string; title: string; section?: string }> = [
  { path: '/', title: 'Filippo Benozzi' },
  { path: '/blog', title: 'Blog' },
  { path: '/cv', title: 'my cv' },
  { path: '/log', title: 'log' },
  { path: '/entrepreneurial-journey', title: 'my entrepreneurial journey' },
];

async function ensureDirectory(dir: string): Promise<void> {
  await fs.mkdir(dir, { recursive: true });
}

async function clearGeneratedOgFiles(dir: string): Promise<void> {
  await ensureDirectory(dir);
  const files = await fs.readdir(dir);

  await Promise.all(
    files
      .filter((file) => file.toLowerCase().endsWith('.jpg'))
      .map((file) => fs.unlink(path.join(dir, file)))
  );
}

async function walkMarkdownFiles(dir: string): Promise<string[]> {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(async (entry) => {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        return walkMarkdownFiles(fullPath);
      }

      if (/\.(md|mdx)$/i.test(entry.name)) {
        return [fullPath];
      }

      return [];
    })
  );

  return files.flat();
}

function parseTitleFromFrontmatter(markdown: string): string | null {
  const frontmatterMatch = markdown.match(/^---\n([\s\S]*?)\n---/);
  if (!frontmatterMatch) {
    return null;
  }

  const titleMatch = frontmatterMatch[1].match(/^title:\s*(.+)$/m);
  if (!titleMatch) {
    return null;
  }

  const raw = titleMatch[1].trim();
  return raw.replace(/^['"]|['"]$/g, '').trim() || null;
}

function getBlogSlugFromFile(filePath: string): string {
  const relative = path.relative(BLOG_DIR, filePath).replace(/\\/g, '/');
  const withoutExt = relative.replace(/\.(md|mdx)$/i, '');
  const normalized = withoutExt.replace(/(^|\/)index$/i, '').replace(/^\/+|\/+$/g, '');
  if (!normalized) {
    return path.basename(withoutExt);
  }

  const segments = normalized.split('/').filter(Boolean);
  return segments[segments.length - 1] ?? normalized;
}

function buildTextSvg(title: string, section?: string): Buffer {
  const lines = wrapTitle(title, 26, 3).map((line) => escapeSvgText(line));
  const baseY = 290;
  const lineHeight = 92;
  const titleNodes = lines
    .map(
      (line, i) =>
        `<text x="120" y="${baseY + i * lineHeight}" fill="#E6E4D9" font-family="${FONT_FAMILY}" font-size="72" font-weight="700">${line}</text>`
    )
    .join('');

  const sectionNode = section
    ? `<text x="120" y="${baseY + (lines.length - 1) * lineHeight + 70}" fill="#878580" font-family="${FONT_FAMILY}" font-size="36" font-weight="600" letter-spacing="1">${escapeSvgText(
        section
      )}</text>`
    : '';

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="transparent"/>
  <text x="120" y="140" fill="#878580" font-family="${FONT_FAMILY}" font-size="34" letter-spacing="1">filippo.im</text>
  ${titleNodes}
  ${sectionNode}
</svg>`;

  return Buffer.from(svg);
}

async function generateOgImage(title: string, outputPath: string, section?: string): Promise<void> {
  const overlay = buildTextSvg(title, section);
  const background = await sharp(BG_FILE).resize(1200, 630, { fit: 'cover' }).toBuffer();

  await sharp(background)
    .composite([{ input: overlay, top: 0, left: 0 }])
    .jpeg({ quality: 90, progressive: true, mozjpeg: true })
    .toFile(outputPath);
}

async function generateStaticPages(): Promise<void> {
  for (const page of STATIC_PAGES) {
    const slug = getOgSlugFromPath(page.path);
    const outputPath = path.join(OG_DIR, `${slug}.jpg`);
    await generateOgImage(page.title, outputPath, page.section);
  }
}

async function generateBlogPages(): Promise<void> {
  const markdownFiles = await walkMarkdownFiles(BLOG_DIR);

  for (const filePath of markdownFiles) {
    const slug = getBlogSlugFromFile(filePath);
    const source = await fs.readFile(filePath, 'utf8');
    const title = parseTitleFromFrontmatter(source) ?? slug;
    const ogSlug = getOgSlugFromPath(`/blog/${slug}`);
    const outputPath = path.join(OG_DIR, `${ogSlug}.jpg`);
    await generateOgImage(title, outputPath, 'blog');
  }
}

async function main(): Promise<void> {
  await clearGeneratedOgFiles(OG_DIR);
  await generateStaticPages();
  await generateBlogPages();
  console.log('Generated OG JPG files in public/og');
}

main().catch((error) => {
  console.error('Failed to generate OG JPG files:', error);
  process.exit(1);
});
