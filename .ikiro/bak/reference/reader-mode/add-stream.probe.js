// limit: 3000 chars
// reader-mode Q16 B — /add as a yields route: an async generator effect, served over shape.http, read by the client wire.
// deno run -A --no-check .ikiro/reference/reader-mode/add-stream.probe.js
import { parseHTML } from "npm:linkedom@0.18.5";
import { Connection, Url, Vector, shape, v } from "@vivalence/typology";

const page = await Deno.readTextFile("commons/services/reader/tests/fixtures/deno-docs.html");
const site = Deno.serve({ port: 0, onListen() {} }, () => new Response(page, { headers: { "content-type": "text/html" } }));

const Step = v.object({
  step: v.enum(["fetch", "snapshot", "parse"]),
  value: v.string(),
});

const fetched = async (ctx) => {
  const response = await fetch(ctx.input.url, { redirect: "follow" });
  const body = await response.text();
  const bytes = new TextEncoder().encode(body);
  return {
    page: { url: response.url, status: response.status, type: response.headers.get("content-type"), document: parseHTML(body).document },
    bytes,
  };
};

const aperture = new Vector().open(
  { nature: "/add", input: v.object({ buffer: v.string(), url: v.string() }), yields: Step },
  async function* (ctx) {
    const { page, bytes } = await fetched(ctx);
    yield { step: "fetch", value: `${page.status} · ${page.type} · ${Math.round(bytes.length / 1024)} kB` };
    yield { step: "snapshot", value: "original · sandboxed" };
    const article = page.document.querySelector("article");
    yield { step: "parse", value: `${article.children.length} blocks` };
  },
);

const server = Deno.serve({ port: 0, onListen() {} }, shape.http(aperture));
const connection = new Connection(new Url(`http://localhost:${server.addr.port}`));
const call = shape.connection.wire(connection, shape.strip(aperture));

console.log("=== strip", JSON.stringify(shape.strip(aperture).branches.add.effect));
const seen = [];
for await (const packet of call.add({ buffer: "b1", url: `http://localhost:${site.addr.port}/` })) seen.push(packet);
console.log("=== packets", JSON.stringify(seen, null, 2));

await server.shutdown();
await site.shutdown();
