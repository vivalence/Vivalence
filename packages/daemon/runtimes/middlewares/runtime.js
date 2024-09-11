import supabase from "../../lib/supabase/index.js";

export default function runtimeMiddleware(runtime, runtimes) {
  function middlewareRuntime(ctx) {
    delete ctx.locals;
    ctx.runtime = runtimes.get(runtime["#symbol"]);

    if (!ctx.runtime.locals.supabase) {
      ctx.runtime.locals.supabase = supabase.createUserClient(ctx);
    }

    ctx.runtime.locals.getUser = async () => {
      const { data, error } = await ctx.runtime.locals.supabase.auth.getUser();
      if (error) throw error;
      return data.user;
    };

    ctx.runtime.call = runtime.caller(ctx);
    return ctx.runtime;
  }

  runtime.bus.use(async (ctx, next) => {
    ctx.runtime = middlewareRuntime(ctx);
    ctx.runtime.locals.supabase = supabase.createAdminClient(ctx);
    await next();
  });

  runtime.router.use(async (ctx, next) => {
    ctx.runtime = middlewareRuntime(ctx);
    await next();
  });
}
