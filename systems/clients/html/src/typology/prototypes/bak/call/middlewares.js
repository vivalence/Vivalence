import { get } from "svelte/store";

export function withAuth(auth) {
  return async (ctx, next) => {
    console.log("call/mw/withauth", auth);
    ctx.auth = get(auth);
    await next();
  };
}

export function authorize(authority) {
  return async (ctx, next) => {
    console.log("call/mw/withauth", authority);
    const { access } = get(authority);
    if (access) ctx.request.headers["Authorization"] = `Bearer ${access}`;

    await next();

    if (ctx.response.status === 401) {
      console.log("@call/middleware/AUTHORIZE fail", ctx.response);
      // const refresh = await ctx.auth.refresh();
      // if (refresh.valid && !ctx.state.isRetry) await ctx.request.retry();
    }
  };
}
