export default function (runtime, daemon) {
  function middleware(ctx) {
    ctx.runtime = daemon.runtimes.get(runtime["#symbol"]);
    ctx.services = ctx.runtime.services;
    ctx.runtime.call = runtime.router.call.create(ctx);

    ctx.runtime.locals = { _isLegacy: true };
    ctx.runtime.locals.supabase = daemon.services.supabase;
    ctx.runtime.locals.getUser = async () => {
      // console.trace('call to legacy "getuser"');
      return await ctx.services.identity.getUser();
    };

    return ctx;
  }

  runtime.bus.use(async (ctx, next) => {
    ctx = middleware(ctx);
    await next();
  });
  runtime.router.middleware.push(async (ctx, next) => {
    ctx = middleware(ctx);
    await next();
  });
}
