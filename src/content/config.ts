import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const blog = defineCollection({
  loader: glob({
    pattern: '**/*.{md,mdx}',
    base: './content/blog',
  }),
  schema: z.object({
    title: z.string(),
    publishedAt: z.string(),
    summary: z.string(),
    image: z.string().optional(),
    tags: z.string().optional(),
    source: z.string().optional(),
  }),
});

// Synced from Obsidian by scripts/sync-log.ts into content/log (generated).
const log = defineCollection({
  loader: glob({
    pattern: '**/*.md',
    base: './content/log',
  }),
  schema: z.object({
    date: z.string(),
    title: z.string().optional(),
  }),
});

export const collections = { blog, log };
