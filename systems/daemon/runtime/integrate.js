import { Vector, compiler, controller, shards } from "@vivalence/vector";

export async function call(rme) {
  const composed = await rme.instance.aperture.compose(true);
  // .use(notFoundMiddleware)

  rme.instance.call = async (path, body = {}, params = {}) => {
    const ctx = context(path, body, params);
    await composed(ctx);
    if (ctx.response.status === 404) console.log("[404]", ctx.request);
    return ctx.response.body;
  };
}

export async function modules(rme) {
  for (const module of rme.instance.module.values()) {
    rme.instance.aperture
      .branch(module.path.value)
      // .use(secure.authorize())
      .descendants.push(module.aperture);
  }
}

export async function twitch(rme) {
  const subscriptions = rme.instance.entities.on.patterns
    .map((p) => p.signature)
    .map((s) => rme.register.modules.domain.entities.map[s].entity);

  const subscriber = new compiler.Subscriber(
    subscriptions,
    async (signal, event) => {
      try {
        const [effect, apply] = controller //
          .traverse(rme.instance.entities.on, signal);
        const context = { event, runtime: rme.instance };
        context.runtime.entities.em = context.runtime.entities.em.fork();
        await apply(context, async (ctx) => (ctx.effect = await effect(ctx)));
        await context.runtime.entities.em.flush();
      } catch (error) {
        if (!["NOT_FOUND", "LONG", "SHORT"].includes(error.code)) throw error;
      }
    },
  );

  rme.instance.entities.em
    .getEventManager() //
    .registerSubscriber(subscriber);
}

// export async function domain(rme) {
//   if (rme.register.modules.domain.lifecycle.integrate)
//     await rme.register.modules.domain.lifecycle.integrate(rme.instance);
// }
