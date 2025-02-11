import { Daemon, EventContext, Runtime } from "@vivalence/types";
import { RequestContext } from "@mikro-orm/core";
import { schemas, entities, runtimeEntities } from "@vivalence/schema";

export default function (daemon: Daemon, runtime: Runtime) {
  async function middleware(ctx: EventContext) {
    const r = daemon.runtimes.get(runtime["#symbol"]) as Runtime;
    ctx.runtime = { ...r };

    ctx.services = ctx.runtime.services;
    ctx.runtime.call = runtime.router?.call.create(ctx);

    ctx.runtime.locals = { _isLegacy: true };
    ctx.runtime.locals && (ctx.runtime.locals.getUser = () => ctx.services?.identity?.getUser());

    return ctx;
  }

  runtime.bus.use(async (ctx, next) => {
    await middleware(ctx);
    await next();
  });

  runtime.router.middleware.push(async (ctx, next) => {
    const entities = {
      em: ctx.runtime.entities.em.fork(),
    };
    for (const [key, entity] of Object.entries(runtimeEntities)) {
      if (!entity.hasOwnProperty("entityName")) continue;
      entities[key] = entity;
      entities[key].em = entities.em;
    }

    ctx.runtime.entities = entities;

    await next();
  });

  runtime.router.middleware.push(async (ctx, next) => {
    await middleware(ctx);
    await next();
  });
}
