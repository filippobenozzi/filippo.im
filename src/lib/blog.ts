interface BlogLike {
  id: string;
  slug?: string;
}

export function getBlogSlug(post: BlogLike): string {
  if (typeof post.slug === 'string' && post.slug.trim().length > 0) {
    return post.slug.trim();
  }

  const normalized = post.id
    .replace(/\.(md|mdx)$/i, '')
    .replace(/(^|\/)index$/i, '')
    .replace(/^\/+|\/+$/g, '');

  if (!normalized) {
    return post.id.replace(/\.(md|mdx)$/i, '');
  }

  const segments = normalized.split('/').filter(Boolean);
  return segments[segments.length - 1] ?? normalized;
}
