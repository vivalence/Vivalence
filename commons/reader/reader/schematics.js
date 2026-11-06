import { v } from "@vivalence/typology";

export const Cursor = v.object({
  block: v.string().desc('A data-block id in the surface. Example: "b6"'),
  sentence: v.integer().desc("Index into the block's text, split at read. Example: 1"),
});

export const Article = v.object({
  url: v.string().desc('Where it was fetched. Example: "https://example.org/tides"'),
  fetched: v.string().desc('ISO time. Example: "2026-11-10T16:20:00Z"'),
  sha: v.string().desc('The snapshot\'s digest. Example: "9f2c41d0"'),
  title: v.string().desc("The document's own. Example: How a Tide Table Is Made"),
  original: v.string().desc('The snapshot File id. Example: "01a1bd04-54c5-74ca-bc57-45381377cd82"'),
  parse: v.enum(["deterministic", "refining", "agentic"]).desc("Example: deterministic"),
  html: v.string().desc('The cleaned surface. Example: "<h1 data-block=\\"b1\\">Permissions</h1>"'),
});

export const Settings = v.object({
  type: v.enum(["dyslexic", "sans", "serif"]).default("dyslexic").desc("Example: dyslexic"),
  size: v.integer().default(18).desc("Pixels, 14–28. Example: 18"),
  leading: v.enum(["tight", "normal", "loose"]).default("normal").desc("Example: normal"),
  width: v.enum(["narrow", "normal", "wide"]).default("normal").desc("Example: normal"),
});

export const Reading = v.object({
  article: v.union([Article, v.null()]).default(null).desc("Null = the empty face. Example: null"),
  cursor: v.union([Cursor, v.null()]).default(null).desc("Example: { block: 'b6', sentence: 1 }"),
  face: v.enum(["original", "reader"]).default("reader").desc("Example: reader"),
});
