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
    ...data,
    date: data.date || data.published || new Date(),
  })),
});

export const collections = {
  posts: postsCollection,
};
