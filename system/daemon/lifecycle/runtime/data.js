import { mw, Vector, compiler, controller } from "@vivalence/vector";
import { bundler, secure, is } from "@vivalence/shared";
import { maps } from "@vivalence/entities";

export async function data(rme, daemon) {
  const runtime = rme.instance;
  const datamap = {
    ...maps.userland,
    ...rme.register.domain.data.map,
  };

  const database = [...daemon.services] //
    .find(({ slug, runtime }) => slug === "database" && runtime === rme.slug);
  if (!database.implements("DATAMAP")) throw new Error();

  runtime.domain.datamap = await database.prototype //
    .client(database, datamap);

  runtime.entities = {
    orm: runtime.domain.datamap,
    em: runtime.domain.datamap.em.fork(),
    on: new Vector(),
  };

  await Promise.all(
    Object.entries(datamap).map(async ([slug, dme]) => {
      if (dme.entity)
        runtime.entities[slug] = await runtime.entities.em //
          .getRepository(dme.entity);
    }),
  );
}

export async function twitch(rme) {
  const subscriptions = rme.instance.entities.on.patterns
    .map((p) => p.signature)
    .map((s) => rme.register.domain.data.map[s].entity);

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
