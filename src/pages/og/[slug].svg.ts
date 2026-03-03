import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { getBlogSlug } from '../../lib/blog';
import { escapeSvgText, getOgSlugFromPath, wrapTitle } from '../../lib/og';

const staticPages = [
  { path: '/', title: 'Filippo Benozzi' },
  { path: '/blog', title: 'Blog' },
  { path: '/cv', title: 'my cv' },
  { path: '/log', title: 'log' },
  { path: '/entrepreneurial-journey', title: 'my entrepreneurial journey' },
];

export async function getStaticPaths() {
  const posts = await getCollection('blog');

  const postPaths = posts.map((post) => {
    const slug = getBlogSlug(post);
    return {
      params: { slug: getOgSlugFromPath(`/blog/${slug}`) },
      props: { title: post.data.title },
    };
  });

  const staticPaths = staticPages.map((page) => ({
    params: { slug: getOgSlugFromPath(page.path) },
    props: { title: page.title },
  }));

  return [...staticPaths, ...postPaths];
}

export const GET: APIRoute = ({ props }) => {
  const title = typeof props?.title === 'string' && props.title.trim().length > 0 ? props.title : 'Filippo Benozzi';
  const lines = wrapTitle(title);
  const safeLines = lines.map((line) => escapeSvgText(line));
  const baseY = 290;
  const lineHeight = 92;

  const textNodes = safeLines
    .map((line, i) => `<text x="120" y="${baseY + i * lineHeight}" fill="#E6E4D9" font-family="'Kaisei Tokumin', Georgia, serif" font-size="78" font-weight="700">${line}</text>`)
    .join('');

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#100F0F"/>
      <stop offset="100%" stop-color="#1C1B1A"/>
    </linearGradient>
    <radialGradient id="blob" cx="0.85" cy="0.15" r="0.8">
      <stop offset="0%" stop-color="#343331"/>
      <stop offset="100%" stop-color="transparent"/>
    </radialGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#bg)"/>
  <rect width="1200" height="630" fill="url(#blob)"/>
  <text x="120" y="140" fill="#878580" font-family="Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" font-size="34" letter-spacing="1">filippo.im</text>
  ${textNodes}
</svg>`;

  return new Response(svg, {
    headers: {
      'Content-Type': 'image/svg+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
};
