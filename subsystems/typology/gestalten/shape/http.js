import { Signal, Context, fromm, steer, NotFound } from "@vivalence/typology";

export function http(vector) {
  return async (req) => {
    const ct = req.headers.get("content-type") || "";
    const body = ct.includes("application/json")
      ? await req.json().catch(() => null)
      : null;
    const ctx = new Context({
      body,
      url: req.url,
      method: req.method,
      headers: Object.fromEntries(req.headers),
      raw: req,
    });

    try {
      const signal = new Signal(ctx.request.url.pathname);
      const [effect, carry, steps] = steer.traverse(vector, signal);
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
  if (body instanceof Response) return body;
  const s = status || ctx.response.status || (body != null ? 200 : 404);
  const type = ctx.response.type || "application/json";
  const headers = Object.fromEntries(ctx.response.headers);
  headers["content-type"] = type;
  if (ctx.trace?.timing) headers["server-timing"] = ctx.trace.timing;

  if (body instanceof Uint8Array || body instanceof ReadableStream) {
    return new Response(body, { status: s, headers });
  }

  return new Response(JSON.stringify(body), { status: s, headers });
}
