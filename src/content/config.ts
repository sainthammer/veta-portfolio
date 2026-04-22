import { defineCollection, z } from 'astro:content';

const portfolio = defineCollection({
  type: 'content',
  schema: ({ image }) => z.object({
    title: z.string(),
    client: z.string().optional(),
    category: z.enum(['Reels', 'Stories', 'SMM', 'Branding']),
    year: z.number().default(2025),
    cover: image(),
    gallery: z.array(image()).optional(),
    description: z.string().optional(),
    tags: z.array(z.string()).default([]),
    featured: z.boolean().default(false),
    order: z.number().default(0),
    externalUrl: z.string().url().optional(),
  }),
});

export const collections = { portfolio };
