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
      const [effect, carry, steps] = steer.dispatch.traverse(vector, signal);
      if (!effect) return respond(ctx, 404);

      ctx.params = fromm.match(steps).parameters;
      ctx.signal = signal;
      ctx.steps = steps;

      await carry(ctx, async (c) => {
        const result = await steer.strategy.fire(effect, c);
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
  let body = ctx.response.body;

  // Bare async generators (e.g. ctx.output from cortex stream leaves) get
  // auto-framed as SSE. ReadableStream and Uint8Array are already-wrapped
  // response bodies — leave them for the native Response path below.
  if (
    body != null
    && typeof body[Symbol.asyncIterator] === "function"
    && !(body instanceof ReadableStream)
    && !(body instanceof Uint8Array)
  ) {
    ctx.response.publish(body);
    body = ctx.response.body;
  }

  if (body instanceof Response) return body;

  const s = status || ctx.response.status || (body != null ? 200 : 404);
  const type = ctx.response.type || "application/json";
  const headers = Object.fromEntries(ctx.response.headers);
  headers["content-type"] = type;
  if (ctx.span?.complete) {
    const flatten = (node) => {
      const result = [];
      if (node.duration != null) result.push(`${node.nature};dur=${node.duration.toFixed(1)}`);
      for (const gauge of node.gauges ?? []) result.push(...flatten(gauge));
      return result;
    };
    headers["server-timing"] = flatten(ctx.span).join(", ");
  }

  if (body instanceof Uint8Array || body instanceof ReadableStream) {
    return new Response(body, { status: s, headers });
  }

  if (type !== "application/json") {
    return new Response(body ?? "", { status: s, headers });
  }

  return new Response(JSON.stringify(body), { status: s, headers });
}
