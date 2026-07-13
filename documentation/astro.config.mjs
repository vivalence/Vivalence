import { resolve } from "node:path"
import { defineConfig } from "astro/config"
import mdx from "@astrojs/mdx"
import remarkDirective from "remark-directive"
import { transformerMetaHighlight } from "@shikijs/transformers"
import { remarkWikilink } from "./src/plugins/remark-wikilink.js"
import { remarkTangle } from "./src/plugins/remark-tangle.js"
import { remarkAdmonition } from "./src/plugins/remark-admonition.js"
import { remarkCodetitle } from "./src/plugins/remark-codetitle.js"

export default defineConfig({
  integrations: [mdx()],
  markdown: {
    remarkPlugins: [
      remarkDirective,
      remarkAdmonition,
      remarkWikilink,
      remarkCodetitle,
      [remarkTangle, { root: resolve(import.meta.dirname, "content") }],
    ],
    shikiConfig: { transformers: [transformerMetaHighlight()] },
  },
})
