import { Signal, Context, fromm } from "@vivalence/typology";
import { traverse } from "../controller/traverse.js";
import { NotFound } from "../prototypes/errors.js";

export function http(vector) {
  return async (req) => {
    const body = await req.json().catch(() => null);
    const ctx = new Context({
      body,
      url: req.url,
      method: req.method,
      headers: Object.fromEntries(req.headers),
    });

    try {
      const signal = new Signal(ctx.request.url.pathname);
      const [effect, carry, steps] = traverse(vector, signal);
      if (!effect) return respond(ctx, 404);

      ctx.params = fromm.match(steps).parameters;

      await carry(ctx, async (c) => {
        if (effect.length === 0) c.output = await effect();
        else if (effect.length === 1) c.output = await effect(c);
        else if (effect.length === 2) c.output = await effect(c.input, c);
      });
    } catch (e) {
      if (e instanceof NotFound || e.code === "NOT_FOUND") return respond(ctx, 404);
      console.error(e);
      return respond(ctx, 500);
    }

    return respond(ctx);
  };
}

function respond(ctx, status) {
  const body = ctx.response.body;
  const s = status || ctx.response.status || (body != null ? 200 : 404);
  const type = ctx.response.type || "application/json";

  if (body instanceof Uint8Array || body instanceof ReadableStream) {
    return new Response(body, { status: s, headers: { "content-type": type } });
  }

  return new Response(
    JSON.stringify(body),
    { status: s, headers: { "content-type": type } },
  );
}
