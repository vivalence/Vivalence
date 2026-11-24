// limit: 3000 chars
// reader-mode Q3 A — /put/:buffer as a raw-body route that also yields steps, over shape.http + the client wire.
// deno run -A --no-check .ikiro/reference/reader-mode/put-raw.probe.js
import { Connection, Url, Vector, shape, v } from "@vivalence/typology";

const Step = v.object({
  step: v.enum(["read", "snapshot", "parse"]),
  value: v.string(),
});

const aperture = new Vector().open(
  { nature: "/put/:buffer", yields: Step },
  async function* (ctx) {
    const bytes = new Uint8Array(await new Response(ctx.request.raw.body).arrayBuffer());
    yield {
      step: "read",
      value: `${ctx.request.headers["x-name"]} · ${ctx.request.headers["content-type"]} · ${bytes.length} bytes`,
    };
    yield { step: "snapshot", value: `buffer ${ctx.params.buffer}` };
    yield { step: "parse", value: `first byte ${bytes[0]} · last byte ${bytes.at(-1)}` };
  },
);

const server = Deno.serve({ port: 0, onListen() {} }, shape.http(aperture));
const connection = new Connection(new Url(`http://localhost:${server.addr.port}`));
const call = shape.connection.wire(connection, shape.strip(aperture));

const bytes = Uint8Array.from({ length: 3_000_000 }, (_, index) => index % 251);
const blob = new Blob([bytes], { type: "application/epub+zip" });

const seen = [];
const packets = call.put["b1"]({}, {
  raw: { body: blob.stream() },
  headers: { "content-type": blob.type, "x-name": "tides.epub" },
});
for await (const packet of packets) seen.push(packet);
console.log("=== packets", JSON.stringify(seen, null, 2));

await server.shutdown();
