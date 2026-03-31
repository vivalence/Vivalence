import { Response, Url } from "@vivalence/typology";

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

  const timer = setTimeout(() => ctx.request.abort(), duration);

  try {
    await next();
  } finally {
    clearTimeout(timer);
  }
};

export const retry =
  (options = {}) =>
  async (ctx, next) => {
    const {
      maxRetries = 3,
      baseDelay = 1000,
      maxDelay = 10000,
      shouldRetry = (ctx) => ctx.response.error?.isRetryable,
    } = options;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      ctx.request._attempt = attempt;

      if (attempt > 0) {
        const delay = Math.min(
          baseDelay * Math.pow(2, attempt - 1) + Math.random() * 500,
          maxDelay,
        );
        await new Promise((r) => setTimeout(r, delay));
      }

      await next();

      if (!ctx.response.error || !shouldRetry(ctx)) {
        return;
      }

      if (attempt < maxRetries) {
        ctx.response = new Response();
        ctx.request._controller = null;
      }
    }
  };

export const batch = (options = {}) => {
  const { url, endpoint = "/batch", filter } = options;
  let queue = null;
  const basePath = url?.pathname ?? "";

  return async (ctx, next) => {
    if (filter && !filter(ctx)) return next();

    const fullPath = ctx.request.url.pathname;
    const path = basePath && fullPath.startsWith(basePath)
      ? fullPath.slice(basePath.length) || "/"
      : fullPath;
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
        lead.ctx.request.url = url
          ? url.branch(endpoint)
          : new Url(`${lead.ctx.request.url.origin}${endpoint}`);
        lead.ctx.request.method = "POST";

        lead
          .next()
          .then(() => {
            const results = lead.ctx.response.body;
            for (let i = 0; i < q.length; i++) {
              const entry = q[i];
              const result = results[i];
              if (!result || result.status >= 400) {
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
