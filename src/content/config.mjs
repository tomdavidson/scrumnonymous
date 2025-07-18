import { defineCollection, z } from 'astro:content';

export const collections = {
    anthologies: defineCollection({
        type: 'content',
        schema: z.object({
            title: z.string(),
            author: z.string(),
            description: z.string(),
            pubDate: z.coerce.date(),
            originUrl: z.string().url(),
            image: z.string().optional(),
            imageAlt: z.string().optional(),
            featuredMedia: z.string().optional(),
        }),
    }),
};


