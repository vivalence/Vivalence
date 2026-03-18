import { Aperture } from "@vivalence/vector/aperture";
import { is, shards } from "@vivalence/typology";

export async function kernel(daemonDie) {
  daemonDie.kernel.domain.aperture //
    .use(shards.context.attach("daemon", daemonDie.good));

  daemonDie.good.aperture.use(shards.secure.authorize()).slurp(daemonDie.kernel.domain.aperture);
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
  for (const mode of daemonDie.good.flatmodes()) {
    mode.aperture
      .use(shards.context.attach("daemon", daemonDie.good))
      .use(shards.context.attach("mode", mode))
      .open("/status", (_, ctx) => ctx.mode.status.reflection)
      .open("/manifest", (_, ctx) => ctx.mode.manifest);

    if (mode.cake.aperture) mode.aperture.slurp(mode.cake.aperture);

    for (const trait of mode.traits) {
      await daemonDie.variant.traits[trait]?.(mode, daemonDie.good);
    }

    mode.entity.installed = true;

    await daemonDie.good.entities.em.flush();

    daemonDie.good.aperture
      .branch(mode.mount.nature)
      .use(shards.secure.authorize())
      .slurp(mode.aperture);
  }
}
