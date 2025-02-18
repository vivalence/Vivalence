import { Daemon, EventContext, Runtime } from "@vivalence/types";
import { RequestContext } from "@mikro-orm/core";
import { schemas, entities, runtimeEntities } from "@vivalence/schema";

export default function (daemon: Daemon, runtime: Runtime) {
  async function middleware(ctx: EventContext) {
    ctx.runtime = { ...daemon.runtimes.get(runtime["#symbol"]) } as Runtime;

    ctx.services = ctx.runtime.services;
    ctx.runtime.call = runtime.router?.call.create(ctx);

    const entities = { em: ctx.runtime.entities.em.fork() };
    for (const [key, entity] of Object.entries(ctx.runtime.entities)) {
      if (!entity.hasOwnProperty("entityName")) continue;
      entities[key] = entity;
      entities[key].em = entities.em;
    }
    ctx.runtime.entities = entities;

    return ctx;
  }

  runtime.bus.use(async (ctx, next) => {
    await middleware(ctx);
    await next();
  });

  runtime.router.middleware.push(async (ctx, next) => {
    await middleware(ctx);
    await next();
  });
}
