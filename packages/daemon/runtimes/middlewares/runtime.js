import supabase from "../../lib/supabase/index.js";
import runtimes from "../index.js";

export default function runtimeMiddleware(runtime) {
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

  runtime.bus.use((ctx, next) => {
    ctx.runtime = middlewareRuntime(ctx);
    ctx.runtime.locals.supabase = supabase.createAdminClient();
    next();
  });

  runtime.router.middleware.push(async (ctx, next) => {
    ctx.runtime = middlewareRuntime(ctx);
    await next();
  });
}
