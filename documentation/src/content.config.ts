import { defineCollection, z } from "astro:content"
import { glob } from "astro/loaders"

const docs = defineCollection({
  loader: glob({
    pattern: "**/*.mdx",
    base: "./content/docs",
    generateId: ({ entry }) => entry.replace(/.*\//, "").replace(/\.mdx$/, ""),
  }),
  schema: z.object({
    title: z.string(),
    jdex: z.string(),
  }),
})

export const collections = { docs }
