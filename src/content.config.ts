import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

export const collections = {
  articles: defineCollection({
    loader: glob({ pattern: "**/*.md", base: "./content/articles" }),
    schema: ({ image }) => z.object({
      title: z.string(),
      description: z.string(),
      published: z.date(),
      modified: z.date().optional(),
      tags: z.array(z.string()).default([]),
      socialImage: image().optional(),
    }),
  }),
};
