import { Url } from "@vivalence/typology";

export const authorize = ($authority) => async (ctx, next) => {
  const auth = $authority.get();
  if (auth?.access) {
    ctx.request.headers.set("Authorization", `Bearer ${auth.access}`);
  }
  await next();
};

export const timeout = (ms) => async (ctx, next) => {
  const duration = ms ?? ctx.request.options.timeout;
  if (!duration) return next();
  // a stream's lifetime is not a request timeout — SSE connects exempt
  if (ctx.request.headers.get("accept") === "text/event-stream") return next();

  const timer = setTimeout(() => ctx.request.abort(), duration);

  try {
    await next();
  } finally {
    clearTimeout(timer);
  }
};

export const batch = (options = {}) => {
  const { hatch, endpoint = "/batch", filter } = options;
  let queue = null;
  const basePath = hatch?.pathname ?? "";

  return async (ctx, next) => {
    if (filter && !filter(ctx)) return next();

    const fullPath = ctx.request.url.pathname;
    const path =
      basePath && fullPath.startsWith(basePath) ? fullPath.slice(basePath.length) || "/" : fullPath;
    const body = ctx.request.body;
    const method = ctx.request.method;

    if (!queue) {
      queue = [];
      const q = queue;

      queueMicrotask(() => {
        queue = null;

        if (q.length === 1) {
          const entry = q[0];
          entry.next().then(entry.resolve, entry.reject);
          return;
        }

        const lead = q[0];
        lead.ctx.request.body = q.map((e) => ({ path: e.path, body: e.body, method: e.method }));
        lead.ctx.request.url = hatch
          ? hatch.branch(endpoint)
          : new Url(`${lead.ctx.request.url.origin}${endpoint}`);
        lead.ctx.request.method = "POST";

        lead
          .next()
          .then(() => {
            const results = lead.ctx.response.body;
            if (!Array.isArray(results)) {
              console.warn(`[probe] batch response not array @ ${lead.ctx.request.url.pathname}`);
              lead.ctx.response.setError();
              for (const entry of q) entry.reject(lead.ctx.response.error);
              return;
            }
            for (let i = 0; i < q.length; i++) {
              const entry = q[i];
              const result = results[i];
              if (!result || result.status >= 400) {
                console.warn(`[probe] batch entry failed ${entry.path} status ${result?.status ?? "none"}`);
                entry.ctx.response.status = result?.status ?? 500;
                entry.ctx.response.body = result?.body ?? null;
                entry.ctx.response.setError();
                entry.reject(entry.ctx.response.error);
              } else {
                entry.ctx.response.status = result.status;
                entry.ctx.response.body = result.body;
                entry.resolve();
              }
            }
          })
          .catch((err) => {
            console.warn(`[probe] batch transport failed (${q.length} entries)`, err);
            for (const entry of q) entry.reject(err);
          });
      });
    }

    return new Promise((resolve, reject) => {
      queue.push({ ctx, path, body, method, next, resolve, reject });
    });
  };
};

export const track = (connection) => async (ctx, next) => {
  connection.$state.set("CONNECTING");

  try {
    await next();

    if (ctx.response.error) {
      connection.$state.set("ERROR");
      connection.$error.set(ctx.response.error);
    } else {
      connection.$state.set("CONNECTED");
      connection.$error.set(null);
    }
  } catch (error) {
    connection.$state.set("ERROR");
    connection.$error.set(error);
    throw error;
  }
};
