import { parseHTML } from "linkedom";
import { parse as parsed, serialize } from "parse5";
import { marked } from "npm:marked@17.0.1";
import { unified } from "npm:unified@11.0.5";
import uniorg from "npm:uniorg-parse@3.2.0";
import rehype from "npm:uniorg-rehype@2.2.0";
import stringify from "npm:rehype-stringify@10.0.1";

const CHARSET = /;\s*charset\s*=\s*"?([^";\s]+)/i;

const BOMS = [
  [[0xef, 0xbb, 0xbf], "utf-8"],
  [[0xfe, 0xff], "utf-16be"],
  [[0xff, 0xfe], "utf-16le"],
];
const DECLARED = /<(?:meta[^>]*?charset|\?xml[^>]*?encoding)\s*=\s*["']?([\w.:-]+)/i;

const supported = (label) => {
  try {
    return new TextDecoder(label) !== null;
  } catch {
    return false;
  }
};

const sniffed = (bytes, type) => {
  const bom = BOMS.find(([mark]) => mark.every((byte, index) => bytes[index] === byte));
  const prescan = new TextDecoder("windows-1252").decode(bytes.subarray(0, 1024));
  const labels = [bom?.[1], CHARSET.exec(type)?.[1], DECLARED.exec(prescan)?.[1]];
  return labels.find((label) => label !== undefined && supported(label)) ?? "utf-8";
};

const decoded = (bytes, type) => new TextDecoder(sniffed(bytes, type)).decode(bytes);

const ESCAPES = { "&": "&amp;", "<": "&lt;", ">": "&gt;" };

const escaped = (text) => text.replace(/[&<>]/g, (character) => ESCAPES[character]);

const SETEXT = /^(=+|-+)$/;
const LAID = /^\s|\S\s{3,}\S/;
const PAGE = /[^\n]*\S[^\n]*\s*\f\s*(?:[^\n]*\S[^\n]*)?/g;

const indent = (row) => row.length - row.trimStart().length;

const margin = (rows) => {
  const tally = new Map();
  for (const row of rows) tally.set(indent(row), (tally.get(indent(row)) ?? 0) + 1);
  return [...tally].reduce((best, entry) => (entry[1] > best[1] ? entry : best), [0, 0])[0];
};

const dedented = (rows, body) => rows.map((row) => row.slice(Math.min(body, indent(row))));
const outdented = (rows, body) => rows.length === 1 && indent(rows[0]) < body;
const laidout = (rows, body) => dedented(rows, body).some((row) => LAID.test(row));
const subhead = (rows) => `<h2>${escaped(rows[0])}</h2>`;

const BLOCKS = [
  [(rows) => rows.length === 2 && SETEXT.test(rows[1]), subhead],
  [outdented, subhead],
  [laidout, (rows, body) => `<pre>${escaped(dedented(rows, body).join("\n"))}</pre>`],
  [() => true, (rows) => `<p>${escaped(rows.join(" "))}</p>`],
];

const block = (rows, body) => BLOCKS.find(([matches]) => matches(rows, body))[1](rows, body);

const typeset = (text) => {
  const blocks = text
    .replace(/\r\n?/g, "\n")
    .replace(PAGE, "\n\n")
    .split(/\n(?:[ \t]*\n)+/)
    .map((paragraph) =>
      paragraph.split("\n").map((row) => row.trimEnd()).filter((row) => row !== ""))
    .filter((rows) => rows.length > 0);
  const title = blocks.length === 0 ? "" : escaped(blocks[0][0].trim());
  const body = margin(blocks.flat());
  const html = blocks.map((rows) => block(rows, body)).join("");
  return `<html><head><title>${title}</title></head><body>${html}</body></html>`;
};

const paged = (title, html) =>
  serialize(parsed(`<html><head><title>${escaped(title)}</title></head><body>${html}</body></html>`));

const HEADLINE = /^#\s+(.+?)\s*#*$/m;
const KEYWORD = /^#\+title:\s*(.+)$/im;
const org = unified().use(uniorg).use(rehype).use(stringify);

const markdown = (text) => paged(HEADLINE.exec(text)?.[1] ?? "", marked.parse(text));

const orgset = (text) => {
  const title = KEYWORD.exec(text)?.[1].trim() ?? "";
  const headline = title === "" ? "" : `<h1>${escaped(title)}</h1>`;
  return paged(title, `${headline}${String(org.processSync(text))}`);
};

const MARKUP = [
  [(type) => /^text\/(?:x-)?markdown\b/i.test(type), markdown],
  [(type) => /^text\/(?:x-)?org\b/i.test(type), orgset],
  [(type) => /^text\/(?!html\b)/i.test(type), typeset],
  [() => true, (text) => serialize(parsed(text))],
];

const markup = (text, type) => MARKUP.find(([matches]) => matches(type))[1](text);

const INLINE = [
  "A", "ABBR", "B", "BDI", "BDO", "BR", "CITE", "CODE", "DATA", "DFN", "EM", "I", "KBD", "LABEL",
  "MARK", "Q", "RUBY", "S", "SAMP", "SMALL", "SPAN", "STRONG", "SUB", "SUP", "TIME", "U", "VAR",
  "FONT",
];
const PHRASING = [...INLINE, "IMG", "PICTURE", "VIDEO", "AUDIO"];
const MEDIA = "img, picture, video, audio";
const HEADING = /^H[1-6]$/;

const PARAGRAPHED = "p, h1, h2, h3, h4, h5, h6, ul, ol, dl, blockquote, pre, table, div, hr";

const gridded = (node) =>
  node.querySelectorAll("tr").length >= 2 && node.querySelector(PARAGRAPHED) === null &&
  [...node.querySelectorAll("tr")].some((row) => row.children.length >= 2);
const tabular = (node) =>
  node.querySelector("table") === null &&
  (node.querySelector("th, caption") !== null || gridded(node));

const LIMITS = {
  prose: 40,
  byline: 80,
  linky: 0.95,
  sidebar: 0.2,
  column: 0.5,
  token: 0.75,
  dominated: 0.5,
  core: 0.9,
  group: 0.1,
  owned: 0.5,
  heading: 0.25,
  leaf: 0.5,
  spacer: 3,
  icon: 20,
};

const dimension = (image, name) => {
  const value = image.getAttribute(name) ?? "";
  return value.trim() === "" ? Infinity : Number(value);
};
const decorative = (image) =>
  image.hasAttribute("usemap") ||
  Math.min(dimension(image, "width"), dimension(image, "height")) < LIMITS.spacer ||
  Math.max(dimension(image, "width"), dimension(image, "height")) < LIMITS.icon;

const INERT = "script, style, noscript, iframe, form, button, svg, title, address, template";
const inert = (body) => {
  for (const image of [...body.querySelectorAll("img")].filter(decorative)) image.remove();
  for (const element of body.querySelectorAll(INERT)) element.remove();
  return body;
};

const SENTENCE = /[.!?。！？](?=["”’)\]]*(\s|$))/;
const NOTES = "[role=doc-footnote], [role=doc-endnote], [role=doc-endnotes]";
const TOKENS = ["footer", "meta"];

const words = (element) => `${element.className} ${element.id}`.toLowerCase().split(/[\s-]+/);
const tokened = (element) => words(element).some((token) => TOKENS.includes(token));

const noted = (element) => element.matches(NOTES) || element.querySelector(NOTES) !== null;
const tabled = (element) => [element.closest("table")].some((table) => table && tabular(table));
const linky = ({ element, chars, links, open }) =>
  chars > 0 && open === 0 && links >= LIMITS.linky * chars &&
  !PHRASING.includes(element.tagName) && !HEADING.test(element.tagName) &&
  element.closest("ul, ol, dl") === null && !tabled(element);
const sidebar = ({ element, chars, links, open }) =>
  noted(element) || open > 0 && links < LIMITS.sidebar * chars;
const column = ({ element, chars, links, open }) =>
  ["TD", "TH"].includes(element.tagName) && !tabular(element.closest("table")) &&
  open === 0 && links >= LIMITS.column * chars && chars > 0;
const hollow = ({ element, children }) =>
  element.tagName === "DETAILS" && children.every((child) => child.element.tagName === "SUMMARY");
const dominated = ({ element, chars, furnished, open }) =>
  chars > 0 && open === 0 && furnished >= LIMITS.dominated * chars &&
  !PHRASING.includes(element.tagName);

const PASSAGES = "p, h1, h2, h3, h4, h5, h6, ul, ol, dl, blockquote, pre, table, figure";
const dated = ({ element, chars, links, open }) =>
  !PHRASING.includes(element.tagName) && element.closest("li, td, th, dd") === null &&
  element.querySelector("time") !== null && element.querySelector(PASSAGES) === null &&
  open === 0 && chars - links < LIMITS.byline;

const FURNITURE = [
  [dated, "dated"],
  [({ element }) => ["NAV", "FOOTER"].includes(element.tagName), "semantic"],
  [(measured) => measured.element.tagName === "ASIDE" && !sidebar(measured), "aside"],
  [({ element }) => element.matches("[hidden], [aria-hidden=true], [popover]"), "hidden"],
  [
    ({ element, chars, links, open }) => tokened(element) && open < LIMITS.token * (chars - links),
    "token",
  ],
  [linky, "links"],
  [column, "column"],
  [hollow, "hollow"],
  [dominated, "dominated"],
  [() => true, "content"],
];

const length = (text) => text.replace(/\s+/g, " ").trim().length;
const told = (text, count) => (count >= LIMITS.prose && SENTENCE.test(text) ? count : 0);
const lettered = (text) => (text.match(/[\p{L}\p{N}]/gu) ?? []).length;
const total = (measures, key) => measures.reduce((sum, measured) => sum + measured[key], 0);

const measure = (element, measures) => {
  const children = [...element.children].map((child) => measure(child, measures));
  const own = [...element.childNodes].filter((node) => node.nodeType === 3).map((node) => node.data)
    .join(" ");
  const chars = length(own) + total(children, "chars");
  const links = element.matches("a[href]") ? chars : total(children, "links");
  const running = children.every((child) =>
    PHRASING.includes(child.element.tagName) && child.running);
  const open = element.matches("a[href]")
    ? 0
    : running
      ? told(element.textContent, chars - links)
      : total(children, "open") + told(own, length(own));
  const furnished = total(children, "furnished");
  const bare = element.matches("a[href]") ? 0 : lettered(own) + total(children, "bare");
  const base = { element, children, chars, links, bare, running, open, furnished };
  const furniture = FURNITURE.find(([matches]) => matches(base))[1] !== "content";
  const measured = { ...base, furniture, ...(furniture ? { open: 0, furnished: chars } : {}) };
  measures.set(element, measured);
  return measured;
};

const UNITS = ["P", "PRE", "BLOCKQUOTE", "FIGURE", "UL", "OL", "DL"];
const united = ({ element }) =>
  UNITS.includes(element.tagName) || HEADING.test(element.tagName) ||
  element.tagName === "TABLE" && tabular(element);
const descended = (measured) => {
  const heavy = measured.children.find((child) =>
    child.open > 0 && child.open >= LIMITS.core * measured.open &&
    !child.running && !united(child));
  return heavy === undefined ? measured : descended(heavy);
};

const named = (element) =>
  (element.tagName === "IMG" ? element.getAttribute("alt") ?? "" : element.textContent)
    .replace(/\s+/g, " ").trim().replace(/[\s¶#§]+$/, "");
const titled = (element, title) => {
  const name = named(element);
  const head = HEADING.test(element.tagName);
  const fits = name !== "" && (head || element.tagName === "IMG" || element.children.length === 0);
  const share = head ? LIMITS.heading : LIMITS.leaf;
  return fits && title.includes(name) && name.length >= share * title.length;
};

const enclosing = (element, inner) =>
  element.contains(inner) ? element : enclosing(element.parentElement, inner);
const lineage = (element, root) =>
  element === root ? [] : [element, ...lineage(element.parentElement, root)];

const ranked = (root, element, title) => {
  const head = HEADING.test(element.tagName);
  if (head && named(element) === title) return 0;
  return 1 + lineage(root, enclosing(root, element)).length * 2 + (head ? 0 : 1);
};
const nearest = (root, title, candidates) =>
  candidates
    .filter((element) => element.closest("nav, aside, footer") === null)
    .map((element) => [ranked(root, element, title), element])
    .sort((left, right) => left[0] - right[0])
    .at(0)?.[1];
const headline = (document, root, title) => {
  const elements = [...document.body.querySelectorAll("*")];
  const titles = elements.filter((element) => titled(element, title));
  const headings = elements.filter((element) => element.tagName === "H1");
  return nearest(root, title, titles) ?? nearest(root, title, headings) ?? null;
};

const banner = (element, lead) =>
  element.tagName === "HEADER" && !element.contains(lead) &&
  element.parentElement.closest("article, main, section, aside, nav") === null;
const beside = (element, measured, context) =>
  context.branch?.contains(element) === true && !context.lead.contains(element) &&
  measured.open === 0 && measured.chars - measured.links < LIMITS.byline &&
  !HEADING.test(element.tagName) && element.closest("figure") === null &&
  !element.matches(MEDIA) && element.querySelector(MEDIA) === null &&
  (!PHRASING.includes(element.tagName) || context.path.includes(element.parentElement));

const PRUNES = [
  [({ measured }) => measured.furniture, "furniture"],
  [
    ({ element, measured, context }) => !measured.bare && context.before.includes(element),
    "before",
  ],
  [({ element, context }) => banner(element, context.lead), "banner"],
  [({ element, measured, context }) => beside(element, measured, context), "beside"],
];

const situated = (root, lead, measures) => {
  const path = lead === null ? [] : lineage(lead, root);
  const children = [...root.children];
  const branch = path.at(-1) ?? null;
  const before = branch === null ? [] : children.slice(0, children.indexOf(branch));
  const prose = measures.get(root).open;
  const grouped = branch !== null && prose > 0 && measures.get(branch).open <= LIMITS.group * prose;
  return { lead: lead ?? root, path, branch: grouped ? branch : null, before };
};

const pruned = (root, measures, context) => {
  for (const [element, measured] of measures) {
    if (!root.contains(element) || element.contains(context.lead)) continue;
    if (PRUNES.some(([matches]) => matches({ element, measured, context }))) element.remove();
  }
  return root;
};

const rooted = (document, title) => {
  const measures = new Map();
  const core = descended(measure(inert(document.body), measures)).element;
  const lead = headline(document, core, title);
  const article = lead?.closest("article");
  const owned = article && core.contains(article) &&
    measures.get(article).open >= LIMITS.owned * measures.get(core).open;
  const root = owned ? article : lead === null ? core : enclosing(core, lead);
  return pruned(root, measures, situated(root, lead, measures));
};

const KEPT = { A: ["href"], IMG: ["src", "alt"] };
const LINKED = { A: "href", IMG: "src" };
const stripped = (node, url) => {
  for (const element of node.querySelectorAll("*")) {
    for (const attribute of [...element.attributes]) {
      if (!(KEPT[element.tagName] ?? []).includes(attribute.name)) {
        element.removeAttribute(attribute.name);
      }
    }
    const linked = LINKED[element.tagName];
    if (linked === undefined || !element.hasAttribute(linked)) continue;
    const target = URL.parse(element.getAttribute(linked), url ?? undefined);
    const web = target !== null && ["http:", "https:"].includes(target.protocol);
    if (web) element.setAttribute(linked, target.href);
    else element.removeAttribute(linked);
  }
  return node;
};

const WRAPPERS = ["ARTICLE", "MAIN", "SECTION", "DIV", "ASIDE", "HEADER", "FOOTER", "NAV"];
const GRID = ["TBODY", "THEAD", "TFOOT", "TR", "TD", "TH", "CENTER"];
const significant = (node) =>
  node?.nodeType === 3 && node.textContent.trim() === "" ? significant(node.previousSibling) : node;

const doubled = (node) =>
  node.tagName === "BR" && significant(node.previousSibling)?.tagName === "BR";
const laid = (node) => GRID.includes(node.tagName) || node.tagName === "TABLE" && !tabular(node);
const paragraphed = (node) =>
  ["P", ...INLINE].includes(node.tagName) &&
  (node.querySelector(PARAGRAPHED) !== null || [...node.childNodes].some(doubled));

const NODES = [
  [(node) => node.nodeType === 3, "inline"],
  [(node) => node.nodeType !== 1, "silent"],
  [(node) => node.tagName === "HR", "rule"],
  [doubled, "rule"],
  [(node) => WRAPPERS.includes(node.tagName), "wrapper"],
  [laid, "wrapper"],
  [paragraphed, "wrapper"],
  [(node) => INLINE.includes(node.tagName), "inline"],
  [() => true, "block"],
];

const filled = (node) =>
  node.textContent.trim() !== "" ||
  node.nodeType === 1 && (node.matches(MEDIA) || node.querySelector(MEDIA) !== null);
const paragraph = (run) => {
  if (!run.some(filled)) return [];
  const paragraph = run[0].ownerDocument.createElement("p");
  paragraph.append(...run);
  return [paragraph];
};

const settled = (state, blocks) => ({
  blocks: [...state.blocks, ...paragraph(state.run), ...blocks],
  run: [],
});

const STEPS = {
  inline: (state, node) => ({ ...state, run: [...state.run, node] }),
  silent: (state) => state,
  rule: (state) => settled(state, []),
  wrapper: (state, node) => settled(state, flow(node)),
  block: (state, node) => settled(state, filled(node) ? [node] : []),
};

const step = (state, node) => STEPS[NODES.find(([matches]) => matches(node))[1]](state, node);
const flow = (node) =>
  settled([...node.childNodes].reduce(step, { blocks: [], run: [] }), []).blocks;

const flattened = (node) => {
  node.replaceChildren(...flow(node));
  for (const wrapper of node.querySelectorAll(WRAPPERS.join(", "))) {
    wrapper.replaceWith(...wrapper.childNodes);
  }
  return node;
};

const FILED = [
  [/\.epub$/i, "application/epub+zip"],
  [/\.pdf$/i, "application/pdf"],
];

const site = (url) => URL.parse(url)?.origin ?? null;

const linked = (document, url, selector) =>
  [...document.querySelectorAll(selector)]
    .map((anchor) => ({ anchor, target: URL.parse(anchor.getAttribute("href"), url) }))
    .filter(({ target }) => target !== null && ["http:", "https:"].includes(target.protocol));

const files = (document, url) =>
  [...new Map(linked(document, url, "a[href]")
    .map(({ target }) => [target.href, FILED.find(([pattern]) => pattern.test(target.pathname))])
    .filter(([, filed]) => filed !== undefined)
    .map(([href, filed]) => [href, { href, type: filed[1] }])).values()];

const contents = (document, url) =>
  [...new Map(linked(document, url, "nav a[href]")
    .filter(({ target }) => target.origin === site(url))
    .map(({ anchor, target }) => [`${target.origin}${target.pathname}`, anchor.textContent.replace(/\s+/g, " ").trim()])
    .filter(([, title]) => title !== "")
    .map(([href, title]) => [href, { href, title, kept: true }])).values()];

export const offered = (bytes, type, url) => {
  const document = parseHTML(normalized(bytes, type)).document;
  return { files: url === null ? [] : files(document, url), contents: url === null ? [] : contents(document, url) };
};

export const normalized = (bytes, type) => markup(decoded(bytes, type), type);

export const page = (bytes, type, url, extract = "article") => {
  const document = parseHTML(normalized(bytes, type)).document;
  const title = document.querySelector("title")?.textContent.trim() ?? "";
  return [{ title, root: extract === "article" ? rooted(document, title) : inert(document.body) }];
};

export const cleaned = (url) => (root) => flattened(stripped(root, url));

export const bound = (chapters, cleaning) => {
  const { document } = parseHTML("<!doctype html><html><head></head><body></body></html>");
  for (const [index, chapter] of chapters.entries()) {
    const section = document.createElement("section");
    section.setAttribute("data-title", chapter.title);
    section.setAttribute("data-chapter", `c${index + 1}`);
    section.append(...cleaning(chapter.root).childNodes);
    document.body.append(section);
  }
  document.querySelectorAll("[data-chapter] > *")
    .forEach((node, index) => node.setAttribute("data-block", `b${index + 1}`));
  return {
    title: chapters[0]?.title ?? "",
    blocks: document.querySelectorAll("[data-block]").length,
    html: `<!doctype html><html><head><meta charset="utf-8"></head><body>${document.body.innerHTML}</body></html>`,
  };
};
