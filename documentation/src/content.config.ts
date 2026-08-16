import { defineCollection, z } from "astro:content"
import { glob } from "astro/loaders"

const docs = defineCollection({
  loader: glob({
    pattern: ["**/*.mdx", "!_*/**"],
    base: "./content",
    generateId: ({ entry }) => entry.replace(/.*\//, "").replace(/\.mdx$/, ""),
  }),
  schema: z.object({
    title: z.string(),
    jdex: z.string().regex(/^\d{1,2}\.\d{2}$/, "jdex must be NN.NN (e.g. 34.01)"),
    summary: z.string().optional(),
  }),
})

const site = defineCollection({
  loader: glob({ pattern: "**/*.mdx", base: "./content/_site" }),
  schema: z.object({
    title: z.string(),
    headline: z.string(),
    eyebrow: z.string().optional(),
    sub: z.string().optional(),
    totems: z.array(z.object({ term: z.string(), rest: z.string() })).optional(),
    pillars: z
      .array(z.object({ key: z.string(), title: z.string(), desc: z.string(), jdex: z.string() }))
      .optional(),
    start: z
      .object({
        title: z.string(),
        items: z.array(z.object({ jdex: z.string(), title: z.string(), desc: z.string() })),
      })
      .optional(),
    live: z
      .object({ title: z.string(), capture: z.string() })
      .optional(),
    legend: z.array(z.object({ swatch: z.enum(["live", "planned", "reserved"]), label: z.string() })).optional(),
  }),
})

export const collections = { docs, site }
