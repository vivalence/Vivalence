import { Context, Request, Signal, steer, v, Vector } from "@vivalence/typology";

class Owned extends Request {
  bytes() {
    return (this.read ??= new Response(this.raw.body).arrayBuffer().then((buffer) => new Uint8Array(buffer)));
  }
}

const Bytes = v.unknown().$id("Bytes");
const Stream = v.unknown().$id("Stream");

const readers = {
  Bytes: (request) => request.bytes(),
  Stream: (request) => request.stream(),
  Object: async (request) => JSON.parse(new TextDecoder().decode(await request.bytes())),
};

const aperture = new Vector()
  .open({ nature: "/webhook", input: Bytes }, (ctx) => ({ got: ctx.input.constructor.name, size: ctx.input.byteLength }))
  .open({ nature: "/upload", input: Stream }, (ctx) => ({ got: ctx.input.constructor.name }))
  .open({ nature: "/find", input: v.object({ where: v.object({}) }).$id("Object") }, (ctx) => ({ got: ctx.input }))
  .open("/undeclared", (ctx) => ({ got: ctx.input ?? null }));

const arrive = async (path, type, body) => {
  const req = new globalThis.Request(`http://localhost${path}`, { method: "POST", headers: { "content-type": type }, body });
  const ctx = new Context({ request: new Owned({ url: req.url, method: req.method, headers: Object.fromEntries(req.headers), raw: req }) });
  const [effect, carry, steps] = steer.dispatch.traverse(aperture, new Signal(new URL(req.url)));
  const declared = steps.at(-1).input?.$id;
  ctx.input = declared ? await readers[declared](ctx.request) : undefined;
  await carry(ctx, async (die) => (die.output = await steer.strategy.fire(effect, die)));
  return ctx.output;
};

console.log(JSON.stringify({
  webhook: await arrive("/webhook", "application/json", '{"text":"hi"}'),
  upload: await arrive("/upload", "application/pdf", new Uint8Array([37, 80, 68, 70])),
  find: await arrive("/find", "application/json", '{"where":{}}'),
  undeclared: await arrive("/undeclared", "application/json", '{"where":{}}'),
}));
