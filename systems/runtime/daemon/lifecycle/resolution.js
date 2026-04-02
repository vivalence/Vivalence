import { is, shard } from "@vivalence/typology";

export async function kernel(daemonDie) {
  const { entities } = daemonDie.good;

  daemonDie.kernel.domain.aperture
    .use(shard.context.attach("daemon", daemonDie.good));

  const userspace = daemonDie.kernel.domain.aperture.branch("/userspace");

  userspace
    .branch("/entities/trace")
    .slurp(shard.datamap.repository(entities.trace))
    .slurp(shard.datamap.reactive(entities.trace, daemonDie.good.twitch));

  userspace
    .branch("/entities/memory")
    .slurp(shard.datamap.repository(entities.memory))
    .slurp(shard.datamap.reactive(entities.memory, daemonDie.good.twitch));

  daemonDie.good.aperture
    .use(shard.secure.authorize())
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

      const finalizers = [];
      for (const trait of mode.traits) {
        const result = await daemonDie.variant.traits[trait]?.(mode, daemonDie.good);
        if (is.fn(result)) finalizers.push(result);
      }
      for (const finalize of finalizers) await finalize();

      if (mode.cake.aperture && !mode.implements("EXPOSED")) {
        console.warn(`[trait] ${mode.type}/${mode.slug} exports aperture without EXPOSED`);
      }

      await daemonDie.good.entities.mode.nativeUpdate({ id: mode.entity.id }, { installed: true });

      daemonDie.good.aperture
        .branch(mode.mount.nature)
        .use(shard.secure.authorize())
        .slurp(mode.aperture);
    }
  });
}
