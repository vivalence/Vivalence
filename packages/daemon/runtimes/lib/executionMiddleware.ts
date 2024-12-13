import { Daemon, EventContext, Runtime } from "../../../../types/types.d.ts";

export default function (runtime: Runtime, daemon: Daemon) {
  function middleware(ctx: EventContext) {
    ctx.runtime = daemon.runtimes.get(runtime["#symbol"]) as Runtime;
    ctx.services = ctx.runtime.services;
    ctx.runtime.call = runtime.router.call.create(ctx);

    ctx.runtime.locals = { _isLegacy: true };
    ctx.runtime.locals && (ctx.runtime.locals.getUser = () => ctx.services?.identity?.getUser());

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
