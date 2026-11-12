import { join } from "@std/path";
import paladin from "@vivalence/paladin";
import { Vector, crypto, v } from "@vivalence/typology";
import { parseHTML } from "linkedom";
import { EpubOptions, PageOptions, PdfOptions, Reading } from "../schematics.js";
import { epub, spine } from "./epub.js";
import { bound, cleaned, normalized, offered, page } from "./parse.js";
import { modeled, paged, pdf, scanned } from "./pdf.js";

const Step = v.object({
  step: v.enum(["fetch", "read", "snapshot", "intake", "parse", "book"]).desc("Example: parse"),
  value: v.string().desc('Example: "12 chapters · 840 blocks"'),
});

const Add = v.object({
  buffer: v.string().desc('The reader buffer. Example: "01a1bd04-54c5-74ca-bc57-45381377cd82"'),
  url: v.string().desc('A page, an epub or a pdf. Example: "https://archive.org/details/tidetables00smit"'),
});

const Buffered = v.object({
  buffer: v.string().desc('The reader buffer. Example: "01a1bd04-54c5-74ca-bc57-45381377cd82"'),
});

const Parse = v.object({
  buffer: Buffered.properties.buffer,
  options: v
    .union([EpubOptions, PdfOptions, PageOptions])
    .desc("The parsing screen's choices. Example: { kind: 'pdf', flow: 'reflow', reader: 'text', scannable: false }"),
});

const KINDS = [
  [(type) => /^application\/epub\+zip\b/i.test(type), "epub"],
  [(type) => /^application\/pdf\b/i.test(type), "pdf"],
  [() => true, "page"],
];
const kind = (type) => KINDS.find(([matches]) => matches(type))[1];

const EXTENSIONS = { epub: "epub", pdf: "pdf", page: "html" };

const DISPOSED = /filename\*?=(?:UTF-8'')?"?([^";]+)"?/i;

const kB = (bytes) => `${Math.round(bytes.length / 1024)} kB`;

const reading = (ctx, id) => ctx.entities.buffer.findOneOrFail({ id }, { populate: ["files", "thread"] });

const based = (html, url) =>
  url === null ? html : html.replace(/<head[^>]*>/i, (head) => `${head}<base href="${url}">`);

const named = (html, name) =>
  parseHTML(html).document.querySelector("title")?.textContent.trim()
    ? html
    : html.replace(/<head[^>]*>/i, (head) => `${head}<title>${name.replace(/[&<>]/g, "")}</title>`);

const stored = async (ctx, buffer, folder, extension, type, bytes) => {
  const path = `${folder}/${await crypto.digestBytes(bytes)}.${extension}`;
  const mount = join(ctx.mode.mountpoint.absolute, path);
  await paladin.state.store(mount, bytes);
  const file = await ctx.entities.file.record({ mode: ctx.mode.id, path, mount, mime: type, bytes });
  buffer.files.add(file);
  return file;
};

const OFFERS = {
  epub: (bytes) => ({ kind: "epub", files: spine(bytes).files }),
  pdf: (bytes, url, ctx) => ({ kind: "pdf", scannable: ctx.providers.ocr !== undefined }),
  page: (bytes, url) => ({ kind: "page", ...offered(bytes, "text/html", url) }),
};

const original = (bytes, type, url, name) => {
  const held = kind(type);
  if (held !== "page") return { held, type, bytes };
  const html = based(named(normalized(bytes, type), name), url);
  return { held, type: "text/html", bytes: new TextEncoder().encode(html) };
};

async function* intaken(ctx, id, given) {
  const buffer = await reading(ctx, id);
  const kept = original(given.bytes, given.type, given.url, given.name);
  const file = await stored(ctx, buffer, "originals", EXTENSIONS[kept.held], kept.type, kept.bytes);
  yield { step: "snapshot", value: `original · ${kept.held} · ${kB(kept.bytes)}` };
  const options = OFFERS[kept.held](kept.bytes, given.url, ctx);
  buffer.data = Reading.cast({
    ...buffer.data,
    intake: { url: given.url, original: file.id, type: kept.type, options },
  });
  await ctx.entities.em.flush();
  yield { step: "intake", value: kept.held };
}

const fetched = async (url) => {
  const response = await fetch(url, { redirect: "follow" });
  if (!response.ok) throw new Error(`reader: ${url} answered ${response.status}`);
  return {
    url: response.url,
    type: response.headers.get("content-type") ?? "text/html",
    name: new URL(response.url).pathname.split("/").filter(Boolean).at(-1) ?? new URL(response.url).host,
    bytes: await response.bytes(),
  };
};

async function* crawled(contents, extract) {
  const kept = contents.filter((entry) => entry.kept);
  const chapters = [];
  for (const [index, entry] of kept.entries()) {
    const response = await fetch(entry.href, { redirect: "follow" }).catch((error) => error);
    if (!(response instanceof Response) || !response.ok) {
      yield { step: "fetch", value: `page ${index + 1}/${kept.length} · ${entry.title} · skipped` };
      continue;
    }
    const [chapter] = page(await response.bytes(), response.headers.get("content-type") ?? "text/html", response.url, extract);
    chapters.push({ ...chapter, title: entry.title });
    yield { step: "fetch", value: `page ${index + 1}/${kept.length} · ${entry.title}` };
  }
  return chapters;
}

async function* converted(ctx, intake, bytes) {
  const options = intake.options;
  if (options.kind === "epub") return epub(bytes, options.files);
  if (options.kind === "pdf" && options.flow === "pages") return await paged(bytes);
  if (options.kind === "pdf" && options.reader === "ocr") return yield* scanned(bytes, ctx);
  if (options.kind === "pdf" && options.reader === "model") return yield* modeled(bytes, ctx);
  if (options.kind === "pdf") return await pdf(bytes);
  if (options.read === "contents") return yield* crawled(options.contents, options.extract);
  return page(bytes, intake.type, intake.url, options.extract);
}

const document = async (ctx, id) => {
  const file = await ctx.entities.file.findOneOrFail({ id });
  return parseHTML(new TextDecoder().decode(await paladin.read.bytes(file.mount))).document;
};

const said = (node) => node.textContent.replace(/\s+/g, " ").trim();

const carried = (before, after, done) => {
  const texts = new Map(
    Object.entries(done)
      .map(([id, time]) => [before.querySelector(`[data-block="${id}"]`), time])
      .filter(([node]) => node !== null)
      .map(([node, time]) => [said(node), time]),
  );
  return Object.fromEntries(
    [...after.querySelectorAll("[data-block]")]
      .filter((node) => texts.has(said(node)))
      .map((node) => [node.getAttribute("data-block"), texts.get(said(node))]),
  );
};

const titled = (before, after, chapter) => {
  const title = before.querySelector(`[data-chapter="${chapter}"]`)?.getAttribute("data-title");
  const found = [...after.querySelectorAll("[data-chapter]")].find((section) => section.getAttribute("data-title") === title);
  return found === undefined ? "c1" : found.getAttribute("data-chapter");
};

const cursored = (before, after, cursor) => {
  if (cursor === null) return null;
  const node = before.querySelector(`[data-block="${cursor.block}"]`);
  const found = node === null ? undefined : [...after.querySelectorAll("[data-block]")].find((held) => said(held) === said(node));
  return found === undefined ? null : { block: found.getAttribute("data-block"), sentence: cursor.sentence };
};

async function* parsed(ctx) {
  const buffer = await reading(ctx, ctx.input.buffer);
  const intake = { ...buffer.data.intake, options: ctx.input.options };
  const file = await ctx.entities.file.findOneOrFail({ id: intake.original });
  const bytes = await paladin.read.bytes(file.mount);
  yield { step: "read", value: `${intake.options.kind} · ${kB(bytes)}` };
  const chapters = yield* converted(ctx, intake, bytes);
  if (chapters.length === 0) throw new Error("reader: nothing to read — every chapter was dropped or skipped");
  const flow = intake.options.kind === "pdf" && intake.options.flow === "pages";
  const book = bound(chapters, flow ? (root) => root : cleaned(intake.url));
  yield { step: "parse", value: `${chapters.length} chapters · ${book.blocks} blocks` };
  const written = await stored(ctx, buffer, "books", "html", "text/html", new TextEncoder().encode(book.html));
  const after = parseHTML(book.html).document;
  const previous = buffer.data.article;
  const before = previous === null ? null : await document(ctx, previous.book);
  const title = book.title || (previous === null ? "" : previous.title) || "untitled";
  buffer.data = Reading.cast({
    ...buffer.data,
    article: {
      url: intake.url,
      title,
      original: intake.original,
      book: written.id,
      chapter: before === null ? "c1" : titled(before, after, previous.chapter),
    },
    intake: null,
    done: before === null ? {} : carried(before, after, buffer.data.done),
    cursor: before === null ? null : cursored(before, after, buffer.data.cursor),
  });
  buffer.trait = { ...buffer.trait, LABELED: { name: title } };
  await ctx.entities.em.flush();
  yield { step: "book", value: title };
}

async function* reopened(ctx) {
  const buffer = await reading(ctx, ctx.input.buffer);
  const article = buffer.data.article;
  const file = await ctx.entities.file.findOneOrFail({ id: article.original });
  const bytes = await paladin.read.bytes(file.mount);
  yield { step: "read", value: `${file.mime} · ${kB(bytes)}` };
  buffer.data = Reading.cast({
    ...buffer.data,
    intake: { url: article.url, original: file.id, type: file.mime, options: OFFERS[kind(file.mime)](bytes, article.url, ctx) },
  });
  await ctx.entities.em.flush();
  yield { step: "intake", value: kind(file.mime) };
}

async function* added(ctx) {
  const given = await fetched(ctx.input.url);
  yield { step: "fetch", value: `${given.type} · ${kB(given.bytes)}` };
  yield* intaken(ctx, ctx.input.buffer, given);
}

async function* put(ctx) {
  const headers = ctx.request.raw.headers;
  const bytes = new Uint8Array(await new Response(ctx.request.raw.body).arrayBuffer());
  const type = headers.get("content-type") ?? "text/plain";
  const name = decodeURIComponent(DISPOSED.exec(headers.get("content-disposition") ?? "")?.[1] ?? "dropped");
  yield { step: "read", value: `${name} · ${kB(bytes)}` };
  yield* intaken(ctx, ctx.params.buffer, { url: null, type, name, bytes });
}

export const aperture = new Vector()
  .open({ nature: "/add", input: Add, yields: Step }, added)
  .open({ nature: "/put/:buffer", yields: Step }, put)
  .open({ nature: "/parse", input: Parse, yields: Step }, parsed)
  .open({ nature: "/reopen", input: Buffered, yields: Step }, reopened);
