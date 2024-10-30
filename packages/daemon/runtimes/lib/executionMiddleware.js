export default function execution(runtime, daemon) {
  function middleware(ctx) {
    ctx.runtime = daemon.runtimes.get(runtime["#symbol"]);

    if (!ctx.runtime.locals) ctx.runtime.locals = {};

    ctx.runtime.locals.getUser = async () => {
      const { data, error } = await ctx.runtime.locals.supabase.auth.getUser();
      if (error) throw error;
      return data.user;
    };

    ctx.runtime.call = runtime.router.call.create(ctx);
    return ctx.runtime;
  }

  runtime.bus.use(async (ctx, next) => {
    ctx.runtime = middleware(ctx);

    if (!ctx.runtime.locals.supabase) {
      ctx.runtime.locals.supabase = daemon.services.supabase.createAdminClient();
      delete ctx.runtime.locals.getUser;
    }

    await next();
  });
  runtime.router.middleware.push(async (ctx, next) => {
    ctx.runtime = middleware(ctx);

    if (!ctx.runtime.locals.supabase) {
      ctx.runtime.locals.supabase = daemon.services.supabase.createUserClient(ctx);
    }

    await next();
  });
}
