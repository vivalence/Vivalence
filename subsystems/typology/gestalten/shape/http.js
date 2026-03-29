import { Signal, Context, fromm, steer, NotFound } from "@vivalence/typology";

export function http(vector) {
  return async (req) => {
    const ct = req.headers.get("content-type") || "";
    const ctx = new Context({
      url: req.url,
      method: req.method,
      headers: Object.fromEntries(req.headers),
      raw: req,
    });

    try {
      if (ct.includes("application/json")) ctx.input = await req.json();

      const signal = new Signal(ctx.request.url.pathname);
      const [effect, carry, steps] = steer.traverse(vector, signal);
      if (!effect) return respond(ctx, 404);

      ctx.params = fromm.match(steps).parameters;

      await carry(ctx, async (c) => {
        let result;
        if (effect.length === 0) result = await effect();
        else if (effect.length === 1) result = await effect(c);
        else if (effect.length === 2) result = await effect(c.input, c);
        if (result !== undefined) c.output = result;
      });
    } catch (e) {
      if (e instanceof SyntaxError) {
        ctx.output = { code: "BAD_REQUEST", message: e.message };
        return respond(ctx, 400);
      }
      if (e instanceof NotFound || e.code === "NOT_FOUND") return respond(ctx, 404);
      console.error(e);
      ctx.output = { code: "INTERNAL", message: e.message };
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

  // binary / stream — pass through
  if (body instanceof Uint8Array || body instanceof ReadableStream) {
    return new Response(body, { status: s, headers });
  }

  // explicit non-JSON type (text/html, text/plain, etc.) — raw string
  if (type !== "application/json") {
    return new Response(body ?? "", { status: s, headers });
  }

  // default: JSON
  return new Response(JSON.stringify(body), { status: s, headers });
}
