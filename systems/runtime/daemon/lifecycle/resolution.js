import { Aperture, is, shard } from "@vivalence/typology";

export async function kernel(daemonDie) {
  daemonDie.kernel.domain.aperture // not needed anymore?
    .use(shard.context.attach("daemon", daemonDie.good));

  daemonDie.good.aperture
    .use(shard.secure.authorize())
    // .use(shard.ambient.store((ctx) => ({ user: ctx.user, entities: ctx.entities })))
    .use(shard.ambient.store((ctx) => ({ user: ctx.user })))
    .use(daemonDie.datamap.shard.bind("user", (ctx) => ({ user: ctx.user.id })))
    .slurp(daemonDie.kernel.domain.aperture);
}

export async function freight(daemonDie) {
  daemonDie.good.cargo = {};
  for (const mode of daemonDie.good.flatmodes()) {
    if (!mode.implements("FRAUGHT")) continue;
    const catalog = mode.cake.freight.catalog;
    for (const [key, value] of Object.entries(catalog)) {
      if (daemonDie.good.cargo[key]) console.warn(`[FREIGHT] slug collision: "${key}"`);
      daemonDie.good.cargo[key] = value;
    }
  }
}

export async function modes(daemonDie) {
  await daemonDie.datamap.shard.context(async () => {
    for (const mode of daemonDie.good.flatmodes()) {
      mode.aperture
        .use(shard.context.attach("daemon", daemonDie.good))
        .use(shard.context.attach("mode", mode))
        .open("/status", (_, ctx) => ctx.mode.status.reflection)
        .open("/manifest", (_, ctx) => ctx.mode.manifest);

      if (mode.cake.aperture) mode.aperture.slurp(mode.cake.aperture);

      for (const trait of mode.traits) {
        await daemonDie.variant.traits[trait]?.(mode, daemonDie.good);
      }

      await daemonDie.good.entities.mode.nativeUpdate({ id: mode.entity.id }, { installed: true });

      daemonDie.good.aperture
        .branch(mode.mount.nature)
        .use(shard.secure.authorize())
        .slurp(mode.aperture);
    }
  });
}
