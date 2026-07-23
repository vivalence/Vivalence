import { defineCollection, z } from "astro:content"
import { glob } from "astro/loaders"

const docs = defineCollection({
  loader: glob({
    pattern: "**/*.mdx",
    base: "./content",
    generateId: ({ entry }) => entry.replace(/.*\//, "").replace(/\.mdx$/, ""),
  }),
  schema: z.object({
    title: z.string(),
    jdex: z.string().regex(/^\d{1,2}\.\d{2}$/, "jdex must be NN.NN (e.g. 34.01)"),
    summary: z.string().optional(),
  }),
})

export const collections = { docs }
