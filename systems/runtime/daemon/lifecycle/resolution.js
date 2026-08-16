import { shape, shard, steer } from "@vivalence/typology";
import { stagger } from "../traits/index.js";

export async function domain(daemonDie) {
  daemonDie.good.aperture
    .use(shard.secure.authorize())
    .use(daemonDie.datamap.shard.bind("user", (ctx) => ({ user: ctx.user.id })));

  if (daemonDie.good.domain.aperture) {
    daemonDie.good.domain.aperture.use(shard.context.bind("daemon", daemonDie.good));
    daemonDie.good.aperture.slurp(daemonDie.good.domain.aperture);
    daemonDie.good.call = shape.proxy(daemonDie.good.domain.aperture, steer.strategy.direct);
  }

  // domain wires its own userspace entities (trace/retention, …); slim daemon has no domain → no-op
  await daemonDie.good.domain.resolve?.(daemonDie);
}

export async function freight(daemonDie) {
  daemonDie.good.cargo = {};
  for (const mode of daemonDie.good.flatmodes()) {
    if (!mode.implements("FRAUGHT")) continue;
    const catalog = mode.freight.catalog;
    for (const [key, value] of Object.entries(catalog)) {
      if (daemonDie.good.cargo[key]) console.warn(`[FREIGHT] slug collision: "${key}"`);
      daemonDie.good.cargo[key] = value;
    }
  }
}

export async function modes(daemonDie) {
  await daemonDie.datamap.shard.context(async () => {
    const finalizers = [];
    for (const mode of daemonDie.good.flatmodes()) {
      mode.aperture
        .use(shard.context.bind("daemon", daemonDie.good))
        .use(shard.context.bind("mode", mode))
        .open("/status", (_, ctx) => ctx.mode.status.reflection)
        .open("/manifest", (_, ctx) => ctx.mode.manifest);

      if (mode.module.aperture) mode.aperture.slurp(mode.module.aperture);

      finalizers.push(...(await stagger(mode, daemonDie.good, daemonDie.variant.traits)));

      if (mode.module.aperture && !mode.implements("EXPOSED")) {
        console.warn(`[trait] ${mode.type}/${mode.slug} exports aperture without EXPOSED`);
      }
      if (mode.module.datasink && !mode.implements("DATASINK")) {
        console.warn(`[trait] ${mode.type}/${mode.slug} exports datasink without DATASINK`);
      }

      await daemonDie.good.entities.mode.nativeUpdate({ id: mode.entity.id }, { installed: true });
    }

    await Promise.all(finalizers.map((finalize) => finalize()));

    for (const mode of daemonDie.good.flatmodes()) {
      daemonDie.good.aperture
        .branch(mode.mount.nature)
        .use(shard.secure.authorize())
        .slurp(mode.aperture);
    }
  });
}
