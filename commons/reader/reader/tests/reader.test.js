import { Cortex, Path, shape, specimen, steer, ToolCall } from "@vivalence/typology";
import { mountMode } from "@vivalence/runtime/scenarios";
import * as reader from "../reader.viva.js";
import { Reading, Settings } from "../schematics.js";

const PAGE = [
  "<!doctype html><html><head><title>How a Tide Table Is Made</title></head><body>",
  '<nav><a href="/home">home</a></nav>',
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

const seen = [];
const writer = () => ({
  type: "dialogue",
  id: "scripted-writer",
  tune: [0.9, 1.0, 0.3],
  channels: { in: ["text", "tool_result"], out: ["text", "tool_use"] },
  via: {
    render: async (request) => {
      seen.push(request);
      const data = { html: '<h1 data-block="b1">Tides</h1>' };
      return { role: "assistant", parts: [{ type: "object", data }], meta: { state: "complete" }, object: data };
    },
  },
});

let scenario;
let site;
let buffer;
let call;
specimen.beforeAll(async () => {
  scenario = await mountMode(reader, { cortex: new Cortex().register([writer()]) });
  scenario.mode.mountpoint = new Path(await Deno.makeTempDir({ prefix: "reader-" }));
  site = Deno.serve({ port: 0, onListen() {} }, () => new Response(PAGE, { headers: { "content-type": "text/html" } }));
  buffer = await scenario.mode.buffer({ thread: scenario.fixtures.thread.id });
  await scenario.em.flush();
  call = shape.connection.wire(scenario.authedConn.branch("/mode/reader/reader"), shape.strip(reader.aperture));
});
specimen.afterAll(async () => {
  await site.shutdown();
  await scenario.orm.close();
});

const held = async () => {
  const em = scenario.orm.em.fork();
  return await em.findOneOrFail(buffer.constructor, { id: buffer.id }, { populate: ["files"], filters: false });
};

specimen.describe("reader — the mode as declared", () => {
  specimen.it("one Solid dom view, five traits, its fonts as a fileset", () => {
    specimen.expect(reader.manifest.traits).toEqual(["VIEWABLE", "EXPOSED", "HARNESSED", "TOOLING", "FILESET"]);
    specimen.expect(reader.views.map((view) => [view.slug, view.mount])).toEqual([["reader", "buffer/Reader.jsx"]]);
    specimen.expect(reader.fileset).toEqual({ path: "fonts" });
  });

  specimen.it("a fresh buffer is Reading filled: no article, no cursor, the reader face", () => {
    specimen.expect(buffer.data).toEqual({ article: null, cursor: null, face: "reader" });
    specimen.expect(Reading.cast({})).toEqual({ article: null, cursor: null, face: "reader" });
    specimen.expect(Settings.cast({})).toEqual({ type: "dyslexic", size: 18, leading: "normal", width: "normal" });
  });
});

specimen.describe("reader — /add streams fetch · snapshot · parse and writes the buffer", () => {
  let packets;
  let added;

  specimen.beforeAll(async () => {
    packets = [];
    for await (const packet of call.add({ buffer: buffer.id, url: `http://localhost:${site.addr.port}/tides/table` })) packets.push(packet);
    added = await held();
  });

  specimen.it("three packets in order, each naming its step", () => {
    specimen.expect(packets.map((packet) => packet.step)).toEqual(["fetch", "snapshot", "parse"]);
    specimen.expect(packets[0].value).toMatch(/^200 · text\/html · \d+ kB$/);
    specimen.expect(packets[1].value).toBe("original · sandboxed");
    specimen.expect(packets[2].value).toBe("6 blocks");
  });

  specimen.it("the original is a File under snapshots/, based on the page's url, on the buffer's files", async () => {
    specimen.expect(added.files.getItems().map((file) => file.id)).toEqual([added.data.article.original]);
    const file = added.files.getItems()[0];
    specimen.expect(file.path).toBe(`snapshots/${added.data.article.sha}.html`);
    specimen.expect(file.mime).toBe("text/html");
    const stored = await Deno.readTextFile(file.mount);
    specimen.expect(stored).toContain(`<head><base href="http://localhost:${site.addr.port}/tides/table">`);
    specimen.expect(stored).toContain("<script>steal()</script>");
  });

  specimen.it("the surface is the article alone: furniture and attributes gone, wrappers descended, links absolute, a block id each", () => {
    const origin = `http://localhost:${site.addr.port}`;
    specimen.expect(added.data.article.html).toBe([
      '<h1 data-block="b1">How a Tide Table Is Made</h1>',
      `<p data-block="b2">A tide table looks like a list of <a href="${origin}/gauges">observations</a>.</p>`,
      `<img data-block="b3" src="${origin}/curve.png" alt="sea level">`,
      '<p data-block="b4">Read <a>more</a>.</p>',
      '<h2 data-block="b5">Harmonic constituents</h2>',
      '<ul data-block="b6"><li>M2</li><li>S2</li></ul>',
    ].join(""));
  });

  specimen.it("the article names its source, and the buffer wears its title", () => {
    specimen.expect(added.data.article.url).toBe(`http://localhost:${site.addr.port}/tides/table`);
    specimen.expect(added.data.article.title).toBe("How a Tide Table Is Made");
    specimen.expect(added.data.article.parse).toBe("deterministic");
    specimen.expect(added.data.face).toBe("reader");
    specimen.expect(added.trait.LABELED).toEqual({ name: "How a Tide Table Is Made" });
    specimen.expect([...Reading.errors(added.data)]).toEqual([]);
  });
});

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
