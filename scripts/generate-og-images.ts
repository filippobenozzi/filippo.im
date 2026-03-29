import { promises as fs } from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';
import { escapeSvgText, getOgSlugFromPath, wrapTitle } from '../src/lib/og';

const ROOT = process.cwd();
const BLOG_DIR = path.join(ROOT, 'content', 'blog');
const OG_DIR = path.join(ROOT, 'public', 'og');
const BG_FILE = path.join(ROOT, 'public', 'og-bg.png');

const STATIC_PAGES = [
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

function buildTextSvg(title: string): Buffer {
  const lines = wrapTitle(title, 26, 3).map((line) => escapeSvgText(line));
  const baseY = 290;
  const lineHeight = 92;
  const textNodes = lines
    .map(
      (line, i) =>
        `<text x="120" y="${baseY + i * lineHeight}" fill="#E6E4D9" font-family="'DejaVu Sans', 'Arial', sans-serif" font-size="72" font-weight="700">${line}</text>`
    )
    .join('');

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="transparent"/>
  <text x="120" y="140" fill="#878580" font-family="'DejaVu Sans', 'Arial', sans-serif" font-size="34" letter-spacing="1">filippo.im</text>
  ${textNodes}
</svg>`;

  return Buffer.from(svg);
}

async function generateOgImage(title: string, outputPath: string): Promise<void> {
  const overlay = buildTextSvg(title);
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
    await generateOgImage(page.title, outputPath);
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
    await generateOgImage(title, outputPath);
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
