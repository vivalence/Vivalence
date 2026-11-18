import { Cortex, Path, shape, specimen, steer, ToolCall } from "@vivalence/typology";
import { strToU8, zipSync } from "npm:fflate@0.8.3";
import { parseHTML } from "linkedom";
import { PDFDocument, StandardFonts } from "npm:pdf-lib@1.17.1";
import { MANUAL, WINDOW, Window } from "../aperture/pdf.js";
import { mountMode } from "@vivalence/runtime/scenarios";
import * as reader from "../reader.viva.js";
import { Reading, Settings } from "../schematics.js";

const PAGE = [
  "<!doctype html><html><head><title>How a Tide Table Is Made</title></head><body>",
  '<nav><a href="/home">home</a><a href="/gone">gone</a><a href="https://elsewhere.org/x">away</a></nav>',
  '<p><a href="/book.epub">the book</a></p>',
  '<article class="post">',
  "<details><summary>On this page</summary></details>",
  '<div class="content"><div class="prose">',
  '<h1 id="top" onclick="steal()">How a Tide Table Is Made</h1>',
  '<p style="color:red">A tide table looks like a list of <a href="../gauges" target="_top">observations</a>.</p>',
  '<img src="/curve.png" alt="sea level" width="600" onerror="steal()">',
  '<p>Read <a href="javascript:steal()">more</a>.</p>',
  "<script>steal()</script><form><button>subscribe</button></form><svg><path d=\"M0 0\"></path></svg>",
  "<h2>Harmonic constituents</h2>",
  "<ul><li>M2</li><li>S2</li></ul>",
  "</div></div>",
  "</article></body></html>",
].join("");


const xhtml = (body) => strToU8(`<?xml version="1.0" encoding="utf-8"?><html xmlns="http://www.w3.org/1999/xhtml"><head><title>x</title></head><body>${body}</body></html>`);
const EPUB = zipSync({
  mimetype: strToU8("application/epub+zip"),
  "META-INF/container.xml": strToU8('<?xml version="1.0"?><container><rootfiles><rootfile full-path="OEBPS/content.opf"/></rootfiles></container>'),
  "OEBPS/content.opf": strToU8([
    '<?xml version="1.0"?><package xmlns="http://www.idpf.org/2007/opf">',
    '<metadata xmlns:dc="http://purl.org/dc/elements/1.1/"><dc:title>The Tide Book</dc:title></metadata>',
    '<manifest><item id="nav" href="nav.xhtml" properties="nav"/><item id="c1" href="text/c1.xhtml"/>',
    '<item id="c2" href="text/c2.xhtml"/><item id="c3" href="text/c3.xhtml"/></manifest>',
    '<spine><itemref idref="c1"/><itemref idref="c2"/><itemref idref="c3"/></spine></package>',
  ].join("")),
  "OEBPS/nav.xhtml": xhtml('<nav><ol><li><a href="text/c1.xhtml">I. The Moon</a></li><li><a href="text/c2.xhtml#top">II. The Sea</a></li></ol></nav>'),
  "OEBPS/text/c1.xhtml": xhtml('<h1 class="x">The Moon</h1><div><p>The moon pulls. It pulls hard.</p><p>Twice a day.</p></div>'),
  "OEBPS/text/c2.xhtml": xhtml("<h2>The Sea</h2><p>The sea answers.</p>"),
  "OEBPS/text/c3.xhtml": xhtml("<h3>Colophon</h3><p>Set in type.</p>"),
});

const PDF = (() => {
  const content = "BT /F1 18 Tf 72 720 Td (The tide rises. It falls.) Tj ET";
  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>",
    `<< /Length ${content.length} >>\nstream\n${content}\nendstream`,
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
    "<< /Title (Tide Tables) >>",
  ];
  const offsets = [];
  const body = objects.reduce((text, object, index) => {
    offsets.push(text.length);
    return `${text}${index + 1} 0 obj\n${object}\nendobj\n`;
  }, "%PDF-1.4\n");
  const table = offsets.map((offset) => `${String(offset).padStart(10, "0")} 00000 n \n`).join("");
  const trailer = `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R /Info 6 0 R >>\nstartxref\n${body.length}\n%%EOF\n`;
  return new TextEncoder().encode(`${body}xref\n0 ${objects.length + 1}\n0000000000 65535 f \n${table}${trailer}`);
})();

const seen = [];
const writer = () => ({
  type: "dialogue",
  id: "scripted-writer",
  tune: [0.9, 0.3, 0.5],
  channels: { in: ["text", "tool_result"], out: ["text", "tool_use"] },
  via: {
    render: async (request) => {
      seen.push(request);
      const data = { html: '<h1 data-block="b1">Tides</h1>' };
      return { role: "assistant", parts: [{ type: "object", data }], meta: { state: "complete" } };
    },
  },
});

const read = [];
const transcriber = () => ({
  type: "dialogue",
  id: "scripted-transcriber",
  tune: [0.7, 0.4, 0.5],
  channels: { in: ["text", "document"], out: ["text"] },
  via: {
    render: async (request) => {
      read.push(request);
      const from = Number(/pages (\d+)–/.exec(request.turns.at(-1).parts[1].text)[1]);
      const blocks = from === 1
        ? [
          { kind: "chapter", title: "I. The Moon" },
          { kind: "paragraph", text: "The moon pulls <hard>." },
          { kind: "note", marker: "1", text: "Measured in 1907." },
          { kind: "chapter", title: "II. The Sea" },
          { kind: "table", header: ["port", "high water"], rows: [["Brest", "06:12"]] },
        ]
        : [{ kind: "heading", level: 2, text: "Gauges" }, { kind: "figure", page: 10, caption: "Fig. 3. A gauge." }];
      const data = { blocks };
      return { role: "assistant", parts: [{ type: "object", data }], meta: { state: "complete" } };
    },
  },
});

let scenario;
let site;
let buffer;
let call;
specimen.beforeAll(async () => {
  scenario = await mountMode(reader, { cortex: new Cortex().register([writer(), transcriber()]) });
  scenario.mode.mountpoint = new Path(await Deno.makeTempDir({ prefix: "reader-" }));
  site = Deno.serve({ port: 0, onListen() {} }, (request) => {
    const path = new URL(request.url).pathname;
    if (path === "/book.epub") return new Response(EPUB, { headers: { "content-type": "application/epub+zip" } });
    if (path === "/gone") return new Response("gone", { status: 404 });
    return new Response(PAGE, { headers: { "content-type": "text/html" } });
  });
  buffer = await scenario.mode.buffer({ thread: scenario.fixtures.thread.id });
  await scenario.em.flush();
  call = shape.connection.wire(scenario.authedConn.branch("/mode/reader/reader"), shape.strip(reader.aperture));
});
specimen.afterAll(async () => {
  await site.shutdown();
  await scenario.orm.close();
});

const held = async (id = buffer.id) => {
  const em = scenario.orm.em.fork();
  return await em.findOneOrFail(buffer.constructor, { id }, { populate: ["files"], filters: false });
};

const fresh = async () => {
  const minted = await scenario.mode.buffer({ thread: scenario.fixtures.thread.id });
  await scenario.em.flush();
  return minted;
};

const drained = async (packets) => {
  const seen = [];
  for await (const packet of packets) seen.push(packet);
  return seen;
};

const filed = (stored, id) => stored.files.getItems().find((file) => file.id === id);

const book = async (stored) => parseHTML(await Deno.readTextFile(filed(stored, stored.data.article.book).mount)).document;

const put = (id, name, type, bytes) =>
  drained(call.put[id]({}, {
    raw: { body: new Blob([bytes]).stream() },
    headers: { "content-type": type, "content-disposition": `attachment; filename*=UTF-8''${encodeURIComponent(name)}` },
  }));

specimen.describe("reader — the mode as declared", () => {
  specimen.it("one Solid dom view, three traits, its fonts as a fileset", () => {
    specimen.expect(reader.manifest.traits).toEqual(["VIEWABLE", "EXPOSED", "FILESET"]);
    specimen.expect(reader.views.map((view) => [view.slug, view.mount])).toEqual([["reader", "buffer/Reader.jsx"]]);
    specimen.expect(reader.fileset).toEqual({ path: "fonts" });
  });

  specimen.it("a fresh buffer is Reading filled: no article, no intake, no marks, no cursor; face and pace are device settings", () => {
    specimen.expect(Reading.cast(buffer.data)).toEqual({ article: null, intake: null, done: {}, cursor: null });
    specimen.expect(Reading.cast({})).toEqual({ article: null, intake: null, done: {}, cursor: null });
    specimen.expect(Settings.cast({})).toEqual({
      face: "reader",
      pace: "scroll",
      type: "dyslexic",
      size: 18,
      leading: "normal",
      width: "normal",
      unit: "block",
      style: "word",
      wpm: 300,
      chunk: 2,
      pauses: "light",
      context: true,
      rail: true,
    });
  });
});

specimen.describe("reader — /add a page: fetch · snapshot · intake, then /parse builds a one-section book", () => {
  let added;
  let intake;
  let parsed;
  let read;

  specimen.beforeAll(async () => {
    added = await drained(call.add({ buffer: buffer.id, url: `http://localhost:${site.addr.port}/tides/table` }));
    intake = (await held()).data.intake;
    parsed = await drained(call.parse({ buffer: buffer.id, options: intake.options }));
    read = await held();
  });

  specimen.it("/add streams three steps and leaves an intake, no article yet", () => {
    specimen.expect(added.map((packet) => packet.step)).toEqual(["fetch", "snapshot", "intake"]);
    specimen.expect(added[2].value).toBe("page");
    specimen.expect(intake.type).toBe("text/html");
    specimen.expect(intake.url).toBe(`http://localhost:${site.addr.port}/tides/table`);
  });

  specimen.it("the page screen is offered the linked book and the same-site contents", () => {
    const origin = `http://localhost:${site.addr.port}`;
    specimen.expect(intake.options).toEqual({
      kind: "page",
      extract: "article",
      read: "page",
      files: [{ href: `${origin}/book.epub`, type: "application/epub+zip" }],
      contents: [
        { href: `${origin}/home`, title: "home", kept: true },
        { href: `${origin}/gone`, title: "gone", kept: true },
      ],
    });
  });

  specimen.it("the original is a File under originals/, based on the page's url, scripts kept for the sandbox", async () => {
    const original = filed(read, read.data.article.original);
    specimen.expect(original.path).toMatch(/^originals\/[0-9a-f]+\.html$/);
    const stored = await Deno.readTextFile(original.mount);
    specimen.expect(stored).toContain(`<base href="http://localhost:${site.addr.port}/tides/table">`);
    specimen.expect(stored).toContain("<script>steal()</script>");
  });

  specimen.it("/parse: read · parse · book; the book is one section of the article alone, a block id each", async () => {
    specimen.expect(parsed.map((packet) => packet.step)).toEqual(["read", "parse", "book"]);
    specimen.expect(parsed[1].value).toBe("1 chapters · 6 blocks");
    const origin = `http://localhost:${site.addr.port}`;
    const document = await book(read);
    specimen.expect(document.body.innerHTML).toBe([
      '<section data-chapter="c1" data-title="How a Tide Table Is Made">',
      '<h1 data-block="b1">How a Tide Table Is Made</h1>',
      `<p data-block="b2">A tide table looks like a list of <a href="${origin}/gauges">observations</a>.</p>`,
      `<img data-block="b3" src="${origin}/curve.png" alt="sea level">`,
      '<p data-block="b4">Read <a>more</a>.</p>',
      '<h2 data-block="b5">Harmonic constituents</h2>',
      '<ul data-block="b6"><li>M2</li><li>S2</li></ul>',
      "</section>",
    ].join(""));
  });

  specimen.it("the article names its source and book, the intake is spent, the buffer wears the title", () => {
    specimen.expect(read.data.intake).toBe(null);
    specimen.expect(read.data.article.title).toBe("How a Tide Table Is Made");
    specimen.expect(read.data.article.chapter).toBe("c1");
    specimen.expect(filed(read, read.data.article.book).path).toMatch(/^books\/[0-9a-f]+\.html$/);
    specimen.expect(read.trait.LABELED).toEqual({ name: "How a Tide Table Is Made" });
    specimen.expect([...Reading.errors(read.data)]).toEqual([]);
  });

  specimen.it("a contents read crawls each kept page, a failure skipped and named", async () => {
    const options = { ...intake.options, read: "contents" };
    await drained(call.reopen({ buffer: buffer.id }));
    const packets = await drained(call.parse({ buffer: buffer.id, options }));
    specimen.expect(packets.filter((packet) => packet.step === "fetch").map((packet) => packet.value)).toEqual([
      "page 1/2 · home",
      "page 2/2 · gone · skipped",
    ]);
    const document = await book(await held());
    specimen.expect([...document.querySelectorAll("[data-chapter]")].map((section) => section.getAttribute("data-title"))).toEqual(["home"]);
  });
});

specimen.describe("reader — an epub: dropped raw, a spine on its screen, a section per kept file", () => {
  let id;
  let packets;
  let intake;

  specimen.beforeAll(async () => {
    id = (await fresh()).id;
    packets = await put(id, "tides.epub", "application/epub+zip", EPUB);
    intake = (await held(id)).data.intake;
  });

  specimen.it("the drop is read by its name, stored, and offered its spine titled by the nav, else the first heading", () => {
    specimen.expect(packets.map((packet) => packet.step)).toEqual(["read", "snapshot", "intake"]);
    specimen.expect(packets[0].value).toMatch(/^tides\.epub · \d+ kB$/);
    specimen.expect(intake.url).toBe(null);
    specimen.expect(intake.options).toEqual({
      kind: "epub",
      files: [
        { href: "text/c1.xhtml", title: "I. The Moon", kept: true },
        { href: "text/c2.xhtml", title: "II. The Sea", kept: true },
        { href: "text/c3.xhtml", title: "Colophon", kept: true },
      ],
    });
  });

  specimen.it("a dropped file leaves the book; blocks number across chapters", async () => {
    const files = intake.options.files.map((file) => ({ ...file, kept: file.href !== "text/c3.xhtml" }));
    const parsed = await drained(call.parse({ buffer: id, options: { kind: "epub", files } }));
    specimen.expect(parsed[1].value).toBe("2 chapters · 5 blocks");
    const stored = await held(id);
    specimen.expect(stored.data.article.title).toBe("I. The Moon");
    specimen.expect((await book(stored)).body.innerHTML).toBe([
      '<section data-chapter="c1" data-title="I. The Moon">',
      '<h1 data-block="b1">The Moon</h1><p data-block="b2">The moon pulls. It pulls hard.</p><p data-block="b3">Twice a day.</p>',
      "</section>",
      '<section data-chapter="c2" data-title="II. The Sea">',
      '<h2 data-block="b4">The Sea</h2><p data-block="b5">The sea answers.</p>',
      "</section>",
    ].join(""));
  });

  specimen.it("a re-parse carries marks by text, the chapter by title, the cursor by its block's text", async () => {
    const em = scenario.orm.em.fork();
    const entity = await em.findOneOrFail(buffer.constructor, { id }, { filters: false });
    entity.data = Reading.cast({
      ...entity.data,
      article: { ...entity.data.article, chapter: "c2" },
      done: { b2: "2026-11-12T09:00:00.000Z", b5: "2026-11-12T09:01:00.000Z" },
      cursor: { block: "b3", sentence: 0 },
    });
    await em.flush();
    await drained(call.reopen({ buffer: id }));
    const files = (await held(id)).data.intake.options.files;
    specimen.expect(files.map((file) => file.kept)).toEqual([true, true, true]);
    await drained(call.parse({ buffer: id, options: { kind: "epub", files: [files[2], files[0], files[1]] } }));
    const after = await held(id);
    specimen.expect(after.data.article.chapter).toBe("c3");
    specimen.expect(after.data.done).toEqual({ b4: "2026-11-12T09:00:00.000Z", b7: "2026-11-12T09:01:00.000Z" });
    specimen.expect(after.data.cursor).toEqual({ block: "b5", sentence: 0 });
  });
});

specimen.describe("reader — /add of a book link lands the epub screen", () => {
  specimen.it("the response's content-type picks the kind", async () => {
    const id = (await fresh()).id;
    const packets = await drained(call.add({ buffer: id, url: `http://localhost:${site.addr.port}/book.epub` }));
    specimen.expect(packets.map((packet) => packet.value).at(-1)).toBe("epub");
    specimen.expect((await held(id)).data.intake.options.files.length).toBe(3);
  });
});

specimen.describe("reader — a pdf: its screen picks reflowed text or the pages", () => {
  specimen.it("reflow · text: the pdf's own title, its text typeset", async () => {
    const id = (await fresh()).id;
    await put(id, "tides.pdf", "application/pdf", PDF);
    specimen.expect((await held(id)).data.intake.options).toEqual({ kind: "pdf", flow: "reflow", reader: "text", scannable: false });
    await drained(call.parse({ buffer: id, options: { kind: "pdf", flow: "reflow", reader: "text" } }));
    const stored = await held(id);
    specimen.expect(stored.data.article.title).toBe("Tide Tables");
    specimen.expect((await book(stored)).querySelector("[data-block]").textContent).toBe("The tide rises. It falls.");
  });

  specimen.it("pages: a figure per page, numbered as a block", async () => {
    const id = (await fresh()).id;
    await put(id, "tides.pdf", "application/pdf", PDF);
    await drained(call.parse({ buffer: id, options: { kind: "pdf", flow: "pages", reader: "text" } }));
    specimen.expect((await book(await held(id))).body.innerHTML).toBe(
      '<section data-chapter="c1" data-title="Tide Tables"><figure data-block="b1" data-page="1"></figure></section>',
    );
  });
});

specimen.describe("reader — a scanned pdf read by the ocr service the mode consumes", () => {
  const asked = [];
  let offered;
  let packets;
  let stored;

  specimen.beforeAll(async () => {
    scenario.daemon.providers.ocr = async function* (source) {
      asked.push(source);
      yield { text: "Tide Tables", words: [{ word: "Tide", page: 1 }, { word: "Tables", page: 1 }] };
      yield { text: "The tide rises twice a day.", words: [{ word: "The", page: 2 }] };
    };
    const id = (await fresh()).id;
    await put(id, "scan.pdf", "application/pdf", PDF);
    offered = (await held(id)).data.intake.options;
    packets = await drained(call.parse({ buffer: id, options: { ...offered, reader: "ocr" } }));
    stored = await held(id);
  });

  specimen.afterAll(() => {
    delete scenario.daemon.providers.ocr;
  });

  specimen.it("the pdf screen is offered the scan", () => {
    specimen.expect(offered).toEqual({ kind: "pdf", flow: "reflow", reader: "text", scannable: true });
  });

  specimen.it("the service is handed the pdf whole, as a document part", () => {
    specimen.expect(asked.length).toBe(1);
    specimen.expect(asked[0].type).toBe("document");
    specimen.expect(asked[0].mime).toBe("application/pdf");
    specimen.expect(atob(asked[0].data).startsWith("%PDF-")).toBe(true);
  });

  specimen.it("every page streams a read step counting the blocks so far", () => {
    const steps = packets.filter((packet) => packet.step === "read").map((packet) => packet.value);
    specimen.expect(steps.slice(1)).toEqual(["page 1 · 1 blocks", "page 2 · 2 blocks"]);
  });

  specimen.it("every ocr block is a block of the book, the pdf's own title kept", async () => {
    specimen.expect(stored.data.article.title).toBe("Tide Tables");
    specimen.expect([...(await book(stored)).querySelectorAll("[data-block]")].map((block) => block.textContent)).toEqual([
      "Tide Tables",
      "The tide rises twice a day.",
    ]);
  });
});

specimen.describe("reader — a mode that consumes no ocr service", () => {
  specimen.it("refuses the ocr reader in a sentence", async () => {
    const id = (await fresh()).id;
    await put(id, "scan.pdf", "application/pdf", PDF);
    await specimen.expect(drained(call.parse({ buffer: id, options: { kind: "pdf", flow: "reflow", reader: "ocr" } }))).rejects.toThrow(
      "reader: this mode consumes no ocr service",
    );
  });
});

specimen.describe("reader — a pdf read by the model: windows of pages, typed blocks, our html", () => {
  let id;
  let packets;
  let stored;

  specimen.beforeAll(async () => {
    const made = await PDFDocument.create();
    const font = await made.embedFont(StandardFonts.Helvetica);
    for (let page = 1; page <= 12; page++) made.addPage().drawText(`page ${page}`, { font, x: 72, y: 720 });
    made.setTitle("Tide Tables");
    id = (await fresh()).id;
    await put(id, "tides.pdf", "application/pdf", await made.save());
    read.length = 0;
    packets = await drained(call.parse({ buffer: id, options: { kind: "pdf", flow: "reflow", reader: "model" } }));
    stored = await held(id);
  });

  specimen.it("one request per window, each a document of its pages plus one, the manual as system, the Window schema as output", () => {
    specimen.expect(WINDOW).toBe(8);
    specimen.expect(read.length).toBe(2);
    specimen.expect(read[0].system).toEqual({ manual: MANUAL });
    specimen.expect(read[0].output.schema).toBe(Window);
    specimen.expect(read[0].turns.at(-1).parts.map((part) => part.type)).toEqual(["document", "text"]);
    specimen.expect(read[0].turns.at(-1).parts[1].text).toBe([
      "This file holds pages 1–9 of 12; its first page is page 1.",
      "Transcribe the blocks that begin on pages 1–8.",
      "Page 9 is there only to finish the last block: transcribe nothing that begins on it.",
      "This is the start of the book.",
    ].join("\n"));
    specimen.expect(read[1].turns.at(-1).parts[1].text).toBe([
      "This file holds pages 9–12 of 12; its first page is page 9.",
      "Transcribe the blocks that begin on pages 9–12.",
      "These are the book's last pages.",
      "The previous pages ended with this block: «Brest 06:12». If page 9 opens by continuing it, skip that continuation.",
    ].join("\n"));
  });

  specimen.it("each window streams a read step naming its pages and the faculty", () => {
    specimen.expect(packets.filter((packet) => packet.step === "read").map((packet) => packet.value).slice(1)).toEqual([
      "pages 1–8 of 12 · 5 blocks · scripted-transcriber",
      "pages 9–12 of 12 · 2 blocks · scripted-transcriber",
    ]);
  });

  specimen.it("a chapter block opens a section; every other kind is rendered and escaped by us", async () => {
    specimen.expect((await book(stored)).body.innerHTML).toBe([
      '<section data-chapter="c1" data-title="I. The Moon">',
      '<h1 data-block="b1">I. The Moon</h1>',
      '<p data-block="b2">The moon pulls &lt;hard&gt;.</p>',
      '<p data-block="b3"><sup>1</sup> Measured in 1907.</p>',
      "</section>",
      '<section data-chapter="c2" data-title="II. The Sea">',
      '<h1 data-block="b4">II. The Sea</h1>',
      '<table data-block="b5"><thead><tr><th>port</th><th>high water</th></tr></thead><tbody><tr><td>Brest</td><td>06:12</td></tr></tbody></table>',
      '<h2 data-block="b6">Gauges</h2>',
      '<figure data-block="b7"><figcaption>page 10 · Fig. 3. A gauge.</figcaption></figure>',
      "</section>",
    ].join(""));
    specimen.expect(stored.data.article.title).toBe("I. The Moon");
  });
});

specimen.describe("reader — dropped or pasted text by its media type", () => {
  const MARKDOWN = "# Tides\n\nA *table* of `tides`.\n\n```js\nlet a = 1;\n```\n\n- one\n- two\n";
  const ORG = "#+title: Tides\n* Gauges\nSome *bold* and [[https://example.org/a][a link]].\n\n#+begin_src js\nlet a = 1;\n#+end_src\n\n| a | b |\n|---+---|\n| 1 | 2 |\n";
  const taken = async (name, type, text) => {
    const id = (await fresh()).id;
    await put(id, name, type, new TextEncoder().encode(text));
    const intake = (await held(id)).data.intake;
    const packets = await drained(call.parse({ buffer: id, options: intake.options }));
    const stored = await held(id);
    return { packets, stored, html: (await book(stored)).querySelector("[data-chapter]").innerHTML };
  };

  specimen.it("markdown: the first heading is the title, no url", async () => {
    const { stored, html } = await taken("tides.md", "text/markdown", MARKDOWN);
    specimen.expect(stored.data.article.url).toBe(null);
    specimen.expect(stored.data.article.title).toBe("Tides");
    specimen.expect(stored.trait.LABELED).toEqual({ name: "Tides" });
    specimen.expect(html).toBe([
      '<h1 data-block="b1">Tides</h1>',
      '<p data-block="b2">A <em>table</em> of <code>tides</code>.</p>',
      '<pre data-block="b3"><code>let a = 1;\n</code></pre>',
      '<ul data-block="b4">\n<li>one</li>\n<li>two</li>\n</ul>',
    ].join(""));
  });

  specimen.it("org: #+title is the title and the headline; source blocks, links and tables survive", async () => {
    const { packets, stored, html } = await taken("tides.org", "text/org", ORG);
    specimen.expect(packets[1].value).toBe("1 chapters · 5 blocks");
    specimen.expect(stored.data.article.title).toBe("Tides");
    specimen.expect(html).toBe([
      '<h1 data-block="b1">Tides</h1>',
      '<h1 data-block="b2">Gauges</h1>',
      '<p data-block="b3">Some <strong>bold</strong> and <a href="https://example.org/a">a link</a>.\n</p>',
      '<pre data-block="b4"><code>let a = 1;\n</code></pre>',
      '<table data-block="b5"><thead><tr><th>a</th><th>b</th></tr></thead><tbody><tr><td>1</td><td>2</td></tr></tbody></table>',
    ].join(""));
  });

  specimen.it("plain text is typeset at blank rows; a blank title falls back to the dropped name", async () => {
    const plain = await taken("pasted", "text/plain", "First row.\n\nSecond paragraph here.\n");
    specimen.expect(plain.stored.data.article.title).toBe("First row.");
    specimen.expect(plain.packets[1].value).toBe("1 chapters · 2 blocks");
    const bare = await taken("pasted", "text/html", "<p>One paragraph, no title element.</p>");
    specimen.expect(bare.stored.data.article.title).toBe("pasted");
    specimen.expect(bare.html).toBe('<p data-block="b1">One paragraph, no title element.</p>');
  });
});

/* @beef refine parked 11-12
specimen.describe("reader — the refine tool rewrites the surface by instructions", () => {
  specimen.it("reader_refine hands the instructions and the html to the object faculty and stores its answer as agentic", async () => {
    const before = await held();
    const result = await scenario.scoped(() =>
      steer.dispatch.invoke(
        scenario.mode.tools,
        new ToolCall("reader_refine").signal,
        steer.strategy.guarded,
      )({ buffer: buffer.id, instructions: "keep the title only" })
    );
    specimen.expect(result).toEqual({ output: { buffer: buffer.id } });
    specimen.expect(seen.at(-1).turns.map((turn) => turn.parts[0].text).slice(-2)).toEqual(["keep the title only", before.data.article.html]);
    const refined = await held();
    specimen.expect(refined.data.article.html).toBe('<h1 data-block="b1">Tides</h1>');
    specimen.expect(refined.data.article.parse).toBe("agentic");
    specimen.expect(refined.data.article.original).toBe(before.data.article.original);
    specimen.expect(refined.trait.LABELED).toEqual({ name: "How a Tide Table Is Made" });
  });
});
*/
