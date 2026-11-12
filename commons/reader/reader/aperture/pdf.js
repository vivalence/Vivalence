import { encodeBase64 } from "@std/encoding/base64";
import { extractText, getDocumentProxy } from "npm:unpdf@2.1.0";
import { PDFDocument } from "npm:pdf-lib@1.17.1";
import { parseHTML } from "linkedom";
import { Controller, nearest, Span, v } from "@vivalence/typology";
import { normalized } from "./parse.js";

const titled = async (document) => (await document.getMetadata()).info.Title ?? "";

export const pdf = async (bytes) => {
  const document = await getDocumentProxy(bytes.slice());
  const { text } = await extractText(document, { mergePages: false });
  const html = normalized(new TextEncoder().encode(text.join("\f")), "text/plain; charset=utf-8");
  return [{ title: await titled(document), root: parseHTML(html).document.body }];
};

export async function* scanned(bytes, ctx) {
  if (ctx.providers.ocr === undefined) throw new Error("reader: this mode consumes no ocr service");
  const source = { type: "document", media: "application/pdf", data: encodeBase64(bytes) };
  const blocks = [];
  let page = 1;
  for await (const block of ctx.providers.ocr(source)) {
    if (block.words[0].page !== page) {
      yield { step: "read", value: `page ${page} · ${blocks.length} blocks` };
      page = block.words[0].page;
    }
    blocks.push(block);
  }
  yield { step: "read", value: `page ${page} · ${blocks.length} blocks` };
  const text = blocks.map((block) => block.text).join("\n\n");
  const html = normalized(new TextEncoder().encode(text), "text/plain; charset=utf-8");
  return [{ title: await titled(await getDocumentProxy(bytes.slice())), root: parseHTML(html).document.body }];
}

export const paged = async (bytes) => {
  const document = await getDocumentProxy(bytes.slice());
  const { document: html } = parseHTML("<!doctype html><html><body></body></html>");
  for (let page = 1; page <= document.numPages; page++) {
    const figure = html.createElement("figure");
    figure.setAttribute("data-page", String(page));
    html.body.append(figure);
  }
  return [{ title: await titled(document), root: html.body }];
};

export const WINDOW = 8;

export const MANUAL = `You transcribe a PDF into a book for a reader app. The app shows the book one block at a time: it reads each block aloud, flashes it word by word, and lets the reader mark it read. Every block you return is one unit of reading. Your work is judged on two things: every word of the author is there, in order, and nothing else is.

# What you are making

A list of blocks, in reading order, for the pages you are asked for. A block is a chapter opening, a heading, a paragraph, a list, a quote, a code listing, a table, a figure or a note. The schema of each kind says exactly what goes in it.

# Fidelity — the first law

- Copy the author's words verbatim. Never summarise, shorten, paraphrase, translate, modernise spelling, correct grammar, or add a word of your own.
- Keep the author's punctuation, capitals, numbers, symbols and quotation marks.
- If a passage is illegible, write what you can read and put [illegible] where you cannot. Never guess a word.
- If a page holds no text (a blank page, a full-page image), return nothing for it, or a figure block for the image.

# What to drop — the furniture of the printed page

- Running headers and footers: the book or chapter title, the author's name or a section name repeated at the top or bottom of pages.
- Page numbers, folio marks, margin numbering, printer's and binder's marks, watermarks, download and library stamps.
- The table of contents, lists of figures and the index: the app builds its own navigation.
- A title repeated at the top of a page that continues a chapter.

Keep the front and back matter that a reader reads: dedication, epigraph, preface, foreword, introduction, acknowledgements, afterword, appendices, notes, bibliography, glossary. Keep the title page's title and author once.

# What to repair — what the layout broke

- A paragraph ends where the author ended it, not where the printed row, a column or a page ended. Join its pieces with single spaces.
- A word hyphenated only because it reached the right margin is joined ("tran- scribe" becomes "transcribe"). A real hyphen stays ("well-known").
- Ligatures and encoding debris become plain letters ("ﬁ" becomes "fi") when the intended letters are certain.
- Two or more columns are read column by column, top to bottom, left to right, never across.
- A paragraph interrupted by a page break, a figure, a table or a footnote is one paragraph: write it whole, then the interrupting block after it.
- Text set inside a box or sidebar becomes a quote block, placed after the paragraph it sits beside.

# Structure

- chapter: every part, chapter, preface, appendix or other top-level division opens with a chapter block. Its title is the title as printed, its number included ("Chapter III. The Moon", "Part Two: The Sea", "Preface"). A part that holds chapters gets its own chapter block, then each chapter gets one.
- heading: a heading inside a chapter. Level 2 for sections, 3 for subsections, 4 below that. Never repeat the chapter title as a heading.
- paragraph: one paragraph of running text. A verse stanza or an address is one paragraph each, its verses kept apart by " / ".
- list: bulleted or numbered items; an item keeps its whole text, its own marker dropped.
- quote: a block quotation, an epigraph, a letter set apart, a boxed sidebar. Its attribution, if printed, goes in source.
- code: program text, a terminal session, a displayed formula, an ASCII diagram — anything where spacing carries meaning. Keep its breaks and indentation exactly.
- table: the header row and the body rows, a cell's text verbatim. A table split across pages is one table.
- figure: you cannot copy images. Give the page it is on and its caption as printed, or, when it has none, a plain description of what it shows in a few words, in square brackets.
- note: a footnote or endnote. Keep its marker in the citing paragraph's text, written as [1] or [*], and put the note block right after that paragraph, with the same marker. Endnotes collected at the end of a chapter or the book stay where they are printed.

Inline emphasis, superscripts and small capitals are not marked: write the plain text. Mathematics inside a sentence is written as it reads in plain text (x^2 + y^2 = r^2).

# Pages and windows

You are given a few pages at a time, in order. The request says which pages to transcribe. Page numbers here are the PDF's own: its first page is page 1, whatever is printed on it.

- Transcribe only blocks that begin on the pages you are asked for.
- The request may hand you one more page after them. It is there only so you can finish the last block: write that block whole, then stop. Transcribe nothing that begins on that extra page.
- The request may quote the last block of the previous pages. If your first page opens by continuing it, skip that continuation: it is already written.`;

const Chapter = v.object({
  kind: v.const("chapter").desc("Example: chapter"),
  title: v.string().desc('The division\'s title as printed, number included. Example: "Chapter III. The Moon"'),
});

const Heading = v.object({
  kind: v.const("heading").desc("Example: heading"),
  level: v.integer({ minimum: 2, maximum: 4 }).desc("2 section · 3 subsection · 4 below. Example: 2"),
  text: v.string().desc('Example: "How the gauges are read"'),
});

const Paragraph = v.object({
  kind: v.const("paragraph").desc("Example: paragraph"),
  text: v.string().desc('One whole paragraph, its pieces joined, margin hyphens mended. Example: "The tide rises twice a day."'),
});

const List = v.object({
  kind: v.const("list").desc("Example: list"),
  ordered: v.boolean().desc("Numbered or lettered. Example: false"),
  items: v.array(v.string()).desc('Each item\'s whole text, its marker dropped. Example: ["M2", "S2"]'),
});

const Quote = v.object({
  kind: v.const("quote").desc("Example: quote"),
  text: v.string().desc('Example: "Time and tide wait for no man."'),
  source: v.string().optional().desc('The attribution as printed. Example: "Chaucer"'),
});

const Code = v.object({
  kind: v.const("code").desc("Example: code"),
  text: v.string().desc('Breaks and indentation exactly as printed. Example: "deno run main.ts"'),
});

const Table = v.object({
  kind: v.const("table").desc("Example: table"),
  header: v.array(v.string()).desc('The header cells; empty when the table has none. Example: ["port", "high water"]'),
  rows: v.array(v.array(v.string())).desc('The body rows, cell by cell. Example: [["Brest", "06:12"]]'),
});

const Figure = v.object({
  kind: v.const("figure").desc("Example: figure"),
  page: v.integer({ minimum: 1 }).desc("The PDF page it is on. Example: 14"),
  caption: v.string().desc('The printed caption, else [a few words on what it shows]. Example: "Fig. 3. A tide gauge at Brest."'),
});

const Note = v.object({
  kind: v.const("note").desc("Example: note"),
  marker: v.string().desc('The marker, as it stands in the citing text. Example: "1"'),
  text: v.string().desc('Example: "Measured in 1907."'),
});

export const Window = v.object({
  blocks: v
    .array(v.union([Chapter, Heading, Paragraph, List, Quote, Code, Table, Figure, Note]))
    .desc("Every block that begins on the requested pages, in reading order. Example: [{ kind: 'paragraph', text: 'The tide rises.' }]"),
});

const ESCAPES = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" };
const escaped = (text) => text.replace(/[&<>"]/g, (character) => ESCAPES[character]);
const cells = (tag, row) => `<tr>${row.map((cell) => `<${tag}>${escaped(cell)}</${tag}>`).join("")}</tr>`;

const RENDERS = {
  heading: (block) => `<h${block.level}>${escaped(block.text)}</h${block.level}>`,
  paragraph: (block) => `<p>${escaped(block.text)}</p>`,
  list: (block) => {
    const tag = block.ordered ? "ol" : "ul";
    return `<${tag}>${block.items.map((item) => `<li>${escaped(item)}</li>`).join("")}</${tag}>`;
  },
  quote: (block) =>
    `<blockquote><p>${escaped(block.text)}${block.source === undefined ? "" : ` — ${escaped(block.source)}`}</p></blockquote>`,
  code: (block) => `<pre><code>${escaped(block.text)}</code></pre>`,
  table: (block) => {
    const head = block.header.length === 0 ? "" : `<thead>${cells("th", block.header)}</thead>`;
    return `<table>${head}<tbody>${block.rows.map((row) => cells("td", row)).join("")}</tbody></table>`;
  },
  figure: (block) => `<figure><figcaption>page ${block.page} · ${escaped(block.caption)}</figcaption></figure>`,
  note: (block) => `<p><sup>${escaped(block.marker)}</sup> ${escaped(block.text)}</p>`,
};

export const chaptered = (blocks, title) =>
  blocks
    .reduce(
      (chapters, block) =>
        block.kind === "chapter"
          ? [...chapters, { title: block.title, html: [`<h1>${escaped(block.title)}</h1>`] }]
          : [...chapters.slice(0, -1), { ...chapters.at(-1), html: [...chapters.at(-1).html, RENDERS[block.kind](block)] }],
      [{ title, html: [] }],
    )
    .filter((chapter) => chapter.html.length > 0)
    .map((chapter) => ({
      title: chapter.title,
      root: parseHTML(`<!doctype html><html><body>${chapter.html.join("")}</body></html>`).document.body,
    }));

const reading = (cortex) => {
  const documents = cortex.find({ type: "dialogue", via: "render" }).filter((faculty) => faculty.channels.in.includes("document"));
  if (documents.length === 0) throw new Error("reader: no dialogue faculty in this cortex reads documents");
  return nearest(documents, cortex.tiers.capable);
};

const excerpt = async (source, from, until) => {
  const target = await PDFDocument.create();
  const pages = await target.copyPages(source, Array.from({ length: until - from + 1 }, (_, index) => from - 1 + index));
  for (const page of pages) target.addPage(page);
  return await target.save();
};

const SPOKEN = {
  list: (block) => block.items.join(" "),
  table: (block) => block.rows.flat().join(" "),
  figure: (block) => block.caption,
};

const spoken = (block) => (SPOKEN[block.kind] ?? ((held) => held.text))(block);

export const asked = ({ from, to, until, total, previous }) =>
  [
    `This file holds pages ${from}–${until} of ${total}; its first page is page ${from}.`,
    `Transcribe the blocks that begin on pages ${from}–${to}.`,
    until > to
      ? `Page ${until} is there only to finish the last block: transcribe nothing that begins on it.`
      : "These are the book's last pages.",
    previous === null
      ? "This is the start of the book."
      : `The previous pages ended with this block: «${spoken(previous).slice(-400)}». If page ${from} opens by continuing it, skip that continuation.`,
  ].join("\n");

export async function* modeled(bytes, ctx) {
  const source = await PDFDocument.load(bytes, { ignoreEncryption: true });
  const total = source.getPageCount();
  const faculty = reading(ctx.cortex);
  const blocks = [];
  for (let from = 1; from <= total; from += WINDOW) {
    const to = Math.min(total, from + WINDOW - 1);
    const until = Math.min(total, to + 1);
    const previous = blocks.findLast((block) => block.kind !== "chapter") ?? null;
    const folded = await ctx.cortex.hallucinate.object.render({
      controller: new Controller({ stdout: new Span("reader-model") }),
      policy: { id: faculty.id },
      system: { manual: MANUAL },
      turns: [{
        role: "user",
        parts: [
          { type: "document", media: "application/pdf", data: encodeBase64(await excerpt(source, from, until)) },
          { type: "text", text: asked({ from, to, until, total, previous }) },
        ],
      }],
      output: { schema: Window },
      settings: { maxTokens: 32000 },
    });
    blocks.push(...folded.product.object.blocks);
    yield { step: "read", value: `pages ${from}–${to} of ${total} · ${folded.product.object.blocks.length} blocks · ${faculty.id}` };
  }
  return chaptered(blocks, source.getTitle() ?? "");
}
