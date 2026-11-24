import { v } from "@vivalence/typology";

export const Cursor = v.object({
  block: v.string().desc('A data-block id in the book. Example: "b6"'),
  sentence: v.integer().desc("Index into the block's text, split at read. Example: 1"),
});

export const Article = v.object({
  url: v
    .union([v.string(), v.null()])
    .desc('Where it came from; null = dropped. Example: "https://archive.org/details/tides"'),
  title: v.string().desc("Example: The Tide Book"),
  original: v.string().desc('The file as dropped or fetched: epub · pdf · html. Example: "01a1bd04-…"'),
  book: v.string().desc('Our html: a section per chapter, a data-block per block. Example: "01a1bd05-…"'),
  chapter: v.string().default("c1").desc('The open section. Example: "c3"'),
  blocks: v
    .union([v.integer(), v.null()])
    .default(null)
    .desc("Blocks in the book; read when as many are done. Null until opened. Example: 9"),
});

export const EpubOptions = v.object({
  kind: v.const("epub").desc("Example: epub"),
  files: v
    .array(
      v.object({
        href: v.string().desc('A spine file. Example: "text/ch01.xhtml"'),
        title: v.string().desc("Example: I. The Moon"),
        kept: v.boolean().default(true).desc("Example: true"),
      }),
    )
    .desc("The spine, in order. Example: [{ href: 'text/ch01.xhtml', title: 'I. The Moon', kept: true }]"),
});

export const PdfOptions = v.object({
  kind: v.const("pdf").desc("Example: pdf"),
  flow: v.enum(["reflow", "pages"]).default("reflow").desc("Example: reflow"),
  reader: v
    .enum(["text", "ocr", "model"])
    .default("text")
    .desc("Who reads the pages: pdf.js text, the ocr service, or the model. Example: text"),
  scannable: v.boolean().default(false).desc("This mode consumes an ocr service: a scan can be read. Example: false"),
});

export const PageOptions = v.object({
  kind: v.const("page").desc("Example: page"),
  extract: v.enum(["article", "whole"]).default("article").desc("Example: article"),
  read: v
    .enum(["page", "contents"])
    .default("page")
    .desc("This page alone, or every page its contents list. Example: page"),
  files: v
    .array(
      v.object({
        href: v.string().desc('Example: "https://archive.org/download/tidetables00smit/tidetables00smit.epub"'),
        type: v.string().desc('Example: "application/epub+zip"'),
      }),
    )
    .desc("Books the page links to. Example: [{ href: '…/tidetables00smit.epub', type: 'application/epub+zip' }]"),
  contents: v
    .array(
      v.object({
        href: v.string().desc('Example: "https://docs.example.org/guide/tides"'),
        title: v.string().desc("Example: Tides"),
        kept: v.boolean().default(true).desc("Example: true"),
      }),
    )
    .desc("The page's navigation, same site, in order. Example: [{ href: '…/tides', title: 'Tides', kept: true }]"),
});

export const Intake = v.object({
  url: v.union([v.string(), v.null()]).desc("Where it came from; null = dropped. Example: null"),
  original: v.string().desc('The dropped or fetched File id. Example: "01a1bd04-…"'),
  type: v.string().desc('Example: "application/epub+zip"'),
  options: v
    .union([EpubOptions, PdfOptions, PageOptions])
    .desc("Example: { kind: 'pdf', flow: 'reflow', reader: 'text' }"),
});

export const Settings = v.object({
  face: v.enum(["original", "reader"]).default("reader").desc("Example: reader"),
  pace: v.enum(["scroll", "block", "speed"]).default("scroll").desc("How the reader face moves. Example: block"),
  type: v.enum(["dyslexic", "sans", "serif"]).default("dyslexic").desc("Example: dyslexic"),
  size: v.integer().default(18).desc("Pixels, 14–28. Example: 18"),
  leading: v.enum(["tight", "normal", "loose"]).default("normal").desc("Example: normal"),
  width: v.enum(["narrow", "normal", "wide"]).default("normal").desc("Example: normal"),
  unit: v.enum(["sentence", "block", "section"]).default("block").desc("What the block pace shows. Example: block"),
  style: v.enum(["word", "chunk", "pacer"]).default("word").desc("How the speed pace shows. Example: word"),
  wpm: v.integer().default(300).desc("Words per minute, 100–1000. Example: 300"),
  chunk: v.integer().default(2).desc("Words per frame in chunk · pacer, 1–5. Example: 2"),
  pauses: v.enum(["off", "light", "strong"]).default("light").desc("Extra time at punctuation. Example: light"),
  context: v.boolean().default(true).desc("The sentence under the word. Example: true"),
  rail: v.boolean().default(true).desc("The block rail beside the text. Example: true"),
});

export const Reading = v.object({
  article: v.union([Article, v.null()]).default(null).desc("Null = the empty face. Example: null"),
  intake: v
    .union([Intake, v.null()])
    .default(null)
    .desc("A drop or fetch waiting on its parsing screen. Example: null"),
  done: v.record(v.string(), v.string()).default({}).desc('Block id → when. Example: { "b4": "2026-11-12T09:10:00Z" }'),
  cursor: v.union([Cursor, v.null()]).default(null).desc("Example: { block: 'b6', sentence: 1 }"),
});
