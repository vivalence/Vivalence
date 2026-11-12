// limit: 2000 chars
import { shape, shard, Vector } from "@vivalence/typology";

const INTEGRITY = "sha256-37085ca51d5210c7";
const aperture = new Vector();
aperture.branch("/view/:id").do((input, ctx) => {
  ctx.response.headers.set("etag", `"${INTEGRITY}"`);
  ctx.response.headers.set("x-viva-integrity", INTEGRITY);
  if (ctx.request.headers.get("if-none-match") === `"${INTEGRITY}"`)
    return new Response(null, { status: 304, headers: Object.fromEntries(ctx.response.headers) });
  ctx.response.type = "text/javascript";
  return new TextEncoder().encode("export default 1;");
});
const serve = shard.cors.wrap(shape.http(aperture));
const ORIGIN = "http://localhost:1794";
const seen = {};
const shot = async (label, request) => {
  const response = await serve(request);
  seen[label] = {
    status: response.status,
    bytes: (await response.arrayBuffer()).byteLength,
    etag: response.headers.get("etag"),
    allowHeaders: response.headers.get("access-control-allow-headers"),
    allowOrigin: response.headers.get("access-control-allow-origin"),
    expose: response.headers.get("access-control-expose-headers"),
  };
};
await shot("first fetch", new Request("http://probe.invalid/view/v1", { headers: { origin: ORIGIN } }));
await shot("holding the fingerprint", new Request("http://probe.invalid/view/v1", { headers: { origin: ORIGIN, "if-none-match": `"${INTEGRITY}"` } }));
await shot("holding an old one", new Request("http://probe.invalid/view/v1", { headers: { origin: ORIGIN, "if-none-match": `"sha256-old"` } }));
await shot("browser preflight", new Request("http://probe.invalid/view/v1", { method: "OPTIONS", headers: { origin: ORIGIN, "access-control-request-method": "GET", "access-control-request-headers": "if-none-match" } }));
console.log(JSON.stringify(seen, null, 2));
