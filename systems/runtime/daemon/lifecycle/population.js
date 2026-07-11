import paladin from "@vivalence/paladin";
import { wrap, EntitySchema } from "@mikro-orm/core";

import { Mode, Url, Path, Aperture, Cortex, shard, v } from "@vivalence/typology";
import { is, array, shape, steer } from "@vivalence/typology";
import { sets, DataRepository } from "@vivalence/typology/entities";

import * as traits from "../traits/index.js";

// Concrete a kernel/userspace base for a domain-less (slim) daemon. The bases
// ship abstract so a domain can be their sole concrete subclass; with no domain
// (e.g. the chaosmonkey variant) concretize here, keeping the base's OWN
// repository — never flatten to DataRepository, which drops Literal/Symbol
// query methods (search/due/byStrength/…).
const concrete = ({ type, entity, schema, repository }) => {
  const name = type[0].toUpperCase() + type.slice(1);
  return {
    type,
    entity,
    schema: new EntitySchema({
      class: entity,
      extends: schema,
      tableName: name,
      name,
      repository: () => repository ?? DataRepository,
    }),
  };
};

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
    ...traits,
    ...die.domain.traits,
  };

  // tiers by type: base sets (abstract, shadowed) → daemon concretes → domain concretes (win)
  die.variant.entities = Object.values({
    ...sets.daemon,
    ...sets.kernel,
    ...sets.userspace,
    buffer:  concrete(sets.userspace.buffer),
    literal: concrete(sets.kernel.literal),
    symbol:  concrete(sets.kernel.symbol),
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
      await next();
    });
}

export async function acid(daemonDie) {
  daemonDie.good.cortex = new Cortex();
  for (const { service, mask } of daemonDie.register.hallucinators ?? []) {
    daemonDie.good.cortex.register(await service.provider(mask));
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
    for (const register of daemonDie.register.kernel) {
      const mode = new Mode(register);
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
