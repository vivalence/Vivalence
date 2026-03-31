import { Signal, Context, fromm, steer, NotFound } from "@vivalence/typology";

export function route(aperture) {
  return async (calls, ctx) => {
    const baseUrl = ctx.request.url?.absolute ?? ctx.request.raw?.url ?? "http://batch";
    const origin = new URL(baseUrl).origin;
    const headers = ctx.request.headers instanceof Map
      ? Object.fromEntries(ctx.request.headers)
      : ctx.request.headers ?? {};

    return Promise.all(
      calls.map(async (call) => {
        const signal = new Signal(call.path);
        let effect, carry, steps;
        try {
          [effect, carry, steps] = steer.traverse(aperture, signal);
        } catch (e) {
          if (e instanceof NotFound || e.code === "NOT_FOUND") {
            return { path: call.path, status: 404, body: null };
          }
          throw e;
        }
        if (!effect) return { path: call.path, status: 404, body: null };

        const inner = new Context({
          request: {
            body: call.body ?? null,
            url: `${origin}${call.path}`,
            method: call.method || "POST",
            headers,
            raw: ctx.request.raw,
          },
          params: fromm.match(steps).parameters,
          signal,
          steps,
        });

        try {
          await carry(inner, async (c) => {
            const result = await steer.dispatch(effect, c);
            if (result !== undefined) c.output = result;
          });
        } catch (e) {
          return { path: call.path, status: 500, body: { code: "INTERNAL", message: e.message } };
        }

        return {
          path: call.path,
          status: inner.response.status || 200,
          body: inner.output ?? inner.response.body ?? null,
        };
      }),
    );
  };
}
