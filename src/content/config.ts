import { defineCollection, z } from 'astro:content';

const postsCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    date: z.coerce.date().optional(),
    published: z.coerce.date().optional(),
    description: z.string(),
    tags: z.array(z.string()).optional().default([]),
    category: z.string().optional(),
    draft: z.boolean().optional().default(false),
    ogImage: z.string().optional(),
  }).transform((data) => ({
    title: data.title,
    date: data.date || data.published || new Date(),
    description: data.description,
    tags: data.tags,
    category: data.category,
    draft: data.draft,
    ogImage: data.ogImage,
  })),
});

export const collections = {
  posts: postsCollection,
};
