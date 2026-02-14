import { Response } from "@vivalence/typology";

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
