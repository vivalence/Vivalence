import { Vector, compiler, controller, shards } from "@vivalence/vector";

export * as aperture from "./aperture/index.js";

// export async function domain(die) {
//   if (is.fn(die.variant.modes.domain.aperture))
//     await die.variant.modes.domain.aperture(die.good.aperture);
// }

export async function call(die) {
  const composed = await die.good.aperture.compose(true);
  // .use(notFoundMiddleware)

  die.good.call = async (path, body = {}, params = {}) => {
    const ctx = context(path, body, params);
    await composed(ctx);
    if (ctx.response.status === 404) console.log("[404]", ctx.request);
    return ctx.response.body;
  };
}

export async function modes(die) {
  for (const mode of die.good.modes()) {
    die.good.aperture
      .branch(mode.mount)
      .use(shards.secure.authorize())
      .descendants.push(mode.aperture);
  }
}

export async function twitch(die) {
  try {
    const subscriptions = die.good.entities.on.patterns
      .map((p) => p.signature)
      .map((s) => die.variant.kernel.domain.entities.map[s].entity);

    const subscriber = new compiler.Subscriber(
      subscriptions,
      async (signal, event) => {
        try {
          const [effect, apply] = controller //
            .traverse(die.good.entities.on, signal);
          const context = { event, runtime: die.good };
          context.runtime.entities.em = context.runtime.entities.em.fork();
          await apply(context, async (ctx) => (ctx.effect = await effect(ctx)));
          await context.runtime.entities.em.flush();
        } catch (error) {
          if (!["NOT_FOUND", "LONG", "SHORT"].includes(error.code)) throw error;
        }
      },
    );

    die.good.entities.em
      .getEventManager() //
      .registerSubscriber(subscriber);
  } catch (e) {
    console.log("@runtime/runtime/integrate/twitch");
    console.log("[expected to fail on pattern signature entity lookup]");
    console.log("[haha future me.]");
    throw e;
  }
}

// export async function domain(die) {
//   if (die.variant.modes.domain.lifecycle.integrate)
//     await die.variant.modes.domain.lifecycle.integrate(die.good);
// }
