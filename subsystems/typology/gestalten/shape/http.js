import { Signal, Context, fromm, steer, NotFound } from "@vivalence/typology";

export function http(vector) {
  return async (req) => {
    const ct = req.headers.get("content-type") || "";
    const body = ct.includes("application/json") ? await req.json().catch(() => null) : null;
    const ctx = new Context({
      request: { body, url: req.url, method: req.method, headers: Object.fromEntries(req.headers), raw: req },
    });

    try {
      const signal = new Signal(new URL(req.url).pathname);
      const [effect, carry, steps] = steer.traverse(vector, signal);
      if (!effect) return respond(ctx, 404);

      ctx.params = fromm.match(steps).parameters;
      ctx.signal = signal;
      ctx.steps = steps;

      await carry(ctx, async (c) => {
        const result = await steer.dispatch(effect, c);
        if (result !== undefined) c.output = result;
      });
    } catch (e) {
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

  if (body instanceof Uint8Array || body instanceof ReadableStream) {
    return new Response(body, { status: s, headers });
  }

  if (type !== "application/json") {
    return new Response(body ?? "", { status: s, headers });
  }

  return new Response(JSON.stringify(body), { status: s, headers });
}
