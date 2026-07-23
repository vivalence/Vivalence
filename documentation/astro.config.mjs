import { resolve } from "node:path"
import { defineConfig } from "astro/config"
import mdx from "@astrojs/mdx"
import remarkDirective from "remark-directive"
import { transformerMetaHighlight } from "@shikijs/transformers"
import { remarkWikilink } from "./src/plugins/remark-wikilink.js"
import { remarkTangle } from "./src/plugins/remark-tangle.js"
import { remarkAdmonition } from "./src/plugins/remark-admonition.js"
import { remarkCodetitle } from "./src/plugins/remark-codetitle.js"
import { rehypeCodeblock } from "./src/plugins/rehype-codeblock.js"
import { rehypeArticle } from "./src/plugins/rehype-article.js"

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
    rehypePlugins: [rehypeArticle, rehypeCodeblock],
    shikiConfig: {
      themes: { light: "github-light", dark: "github-dark" },
      defaultColor: false,
      transformers: [transformerMetaHighlight()],
    },
  },
})
