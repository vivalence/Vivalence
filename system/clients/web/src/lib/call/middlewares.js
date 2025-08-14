import { get } from "svelte/store";

export function withAuth(auth) {
  return async (ctx, next) => {
    ctx.auth = auth;
    await next();
  };
}

export function authorize(auth) {
  return async (ctx, next) => {
    ctx.auth = auth || ctx.auth;
    const { access } = ctx.auth.token;
    if (access) ctx.request.headers["Authorization"] = `Bearer ${access}`;

    await next();

    if (ctx.response.status === 401) {
      const refresh = await ctx.auth.refresh();
      if (refresh.valid && !ctx.state.isRetry) await ctx.request.retry();
    }
  };
}
