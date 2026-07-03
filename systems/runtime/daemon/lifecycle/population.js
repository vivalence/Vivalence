import paladin from "@vivalence/paladin";
import { wrap } from "@mikro-orm/core";

import { Mode, Url, Path, Aperture, Cortex, shard, v } from "@vivalence/typology";
import { is, array, shape, steer } from "@vivalence/typology";
import { sets } from "@vivalence/typology/entities";

import * as kinds from "../kinds.js";
import * as traits from "../traits/index.js";
import { entities as defaults } from "../entities.js";

export async function core(die) {
  const registry = {
    lighthouse: die.mask.lighthouse,
    hallucinators: die.mask.hallucinators,
    datamap: die.mask.datamap,
    kernel: die.mask.kernel,
    consume: die.mask.consume,
  };

  die.register = await paladin.vip.accioMap(registry);

  die.domain = v.primitives.kernel.Domain.cast(
    die.register.kernel.find((module) => module.manifest?.type === "domain") ?? {},
  );

  die.variant.traits = {
    ...kinds.traits,
    ...traits,
    ...die.domain.traits,
  };

  die.variant.kinds = { ...kinds.kinds, ...die.domain.kinds };

  // tiers by type: base sets (abstract, shadowed) → daemon-default concretes → domain concretes (win)
  die.variant.entities = Object.values({
    ...sets.daemon,
    ...sets.kernel,
    ...sets.userspace,
    ...defaults,
    ...die.domain.entities,
  });
}

export function wiring(daemonDie) {
  daemonDie.good.statics = daemonDie.mask.statics;
  daemonDie.good.docs = daemonDie.mask.docs;
}

export async function datamap(daemonDie) {
  daemonDie.datamap = await daemonDie.register.datamap.provider(
    daemonDie.mask.datamap,
    daemonDie.variant.entities,
  );

  daemonDie.good.entities = daemonDie.datamap.entities;
  daemonDie.good.datamap = daemonDie.datamap;

  daemonDie.datamap.subscribe(shape.subscriber(daemonDie.good.twitch));
  daemonDie.good.aperture.use(shard.datamap.inject(daemonDie.datamap));
}

export async function authority(daemonDie) {
  daemonDie.good.lighthouse = await daemonDie.register.lighthouse //
    .provider(daemonDie.mask.lighthouse, daemonDie.good.entities.user);

  daemonDie.good.aperture //
    .use(shard.secure.authority(daemonDie.good.lighthouse))
    .use(async (ctx, next) => {
      ctx.daemon.connection = daemonDie.connection.clone();
      ctx.daemon.connection //
        .use(async (context, next) => {
          context.request.headers.set("authorization", ctx.request.headers.get("authorization"));
          await next();
        });
      ctx.daemon.call = ctx.daemon.connection.call.bind(ctx.daemon.connection);
      await next();
    });
}

export async function acid(daemonDie) {
  daemonDie.good.cortex = new Cortex();
  for (const { service, mask } of daemonDie.register.hallucinators ?? []) {
    daemonDie.good.cortex.extend(await service.provider(mask));
  }
}

export async function services(daemonDie) {
  for (const [slug, servicemask] of Object.entries(daemonDie.mask.consume)) {
    const servicecake = daemonDie.register.consume[slug];
    daemonDie.good.services[slug] = await servicecake.provider(servicemask);
  }
}

export async function modes(daemonDie) {
  await daemonDie.datamap.shard.context(async () => {
    const registeredModes = daemonDie.register.kernel
      .map((register) => {
        const kind = daemonDie.variant.kinds[register.manifest.type] ?? kinds.root;
        return { kind, register };
      });

    for (const { register, kind } of registeredModes) {
      const mode = new kind.prototype(register);
      mode.mount = daemonDie.good.mount.clone().branch(`/mode/${mode.type}/${mode.slug}`);
      mode.url = daemonDie.good.url.branch(mode.mount.nature);

      if (!mode.aperture) mode.aperture = new Aperture();

      if (mode.implements("APPLICATION")) {
        mode.module.app.mount.from(new Path(mode.module.mount.dirname));

        const url = daemonDie.good.attach
          .branch("/view")
          .branch(mode.mount.absolute)
          .branch(mode.module.app.mount.nature);

        mode.module.app.withUrl(url);
      }

      if (mode.implements("FRAUGHT")) {
        mode.module.freight.path.from(new Path(mode.module.mount.dirname));
        const url = daemonDie.good.attach.branch("/cargo").branch(daemonDie.good.mount.nature);
        mode.module.freight.withUrl(url);
      }

      mode.entity = await daemonDie.good.entities.mode //
        .ensure(mode.manifest);

      mode.entity.traits = array //
        .unique([...mode.entity.traits, ...mode.traits]);

      await daemonDie.good.entities.em.flush();

      mode.entity = wrap(mode.entity).toPOJO();
      mode.id = mode.entity.id;

      if (!daemonDie.good.modes[mode.type]) daemonDie.good.modes[mode.type] = {};
      daemonDie.good.modes[mode.type][mode.slug] = mode;
    }
  });
}

export function handlers(daemonDie) {
  daemonDie.good.flatmodes = () =>
    Object.values(daemonDie.good.modes)
      .map((type) => Object.values(type))
      .flat();
}
