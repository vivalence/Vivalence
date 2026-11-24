import { Request, shape, Vector } from "@vivalence/typology";
import { http as patched } from "/private/tmp/claude-501/-Users-finn-vivalence-code-vivalence/a89e49bc-7de6-4598-8c02-50ab2d1d4d86/scratchpad/http.patched.js";

Request.prototype.bytes = function () {
  return (this.read ??= new Response(this.raw.body).arrayBuffer().then((buffer) => new Uint8Array(buffer)));
};

const routes = new Vector()
  .open("/hook", async (ctx) => ({
    input: ctx.input,
    bytes: new TextDecoder().decode(await ctx.request.bytes()),
  }))
  .open("/input", (ctx) => ({ input: ctx.input }))
  .open("/file", async (ctx) => ({ input: ctx.input, file: [...(await ctx.request.bytes())] }));

const cases = {
  hook: ["/hook", "POST", "application/json", '{"a":  1}'],
  empty: ["/input", "POST", "application/json", null],
  broken: ["/input", "POST", "application/json", "{nope"],
  file: ["/file", "POST", "application/pdf", new Uint8Array([37, 80])],
  get: ["/input", "GET", null, null],
};
const run = async (serve, [path, method, type, body]) =>
  (await serve(new globalThis.Request("http://localhost" + path, { method, headers: type ? { "content-type": type } : {}, body }))).json();

const report = {};
for (const [name, given] of Object.entries(cases)) {
  report[name] = { after: await run(patched(routes), given) };
  if (name !== "hook" && name !== "file") report[name].now = await run(shape.http(routes), given);
}
console.log(JSON.stringify(report));
