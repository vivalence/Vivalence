import paladin from "@vivalence/paladin";
import { wrap, EntitySchema } from "@mikro-orm/core";

import { Mode, Url, Path, Aperture, Cortex, shard, v } from "@vivalence/typology";
import { is, array, shape, steer } from "@vivalence/typology";
import { sets, DataRepository } from "@vivalence/typology/entities";

import * as traits from "../traits/index.js";

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

  // @beef hacky micro/abstract entity handling
  const collate = (tiers) => {
    const slots = {};
    for (const tier of tiers)
      for (const descriptor of Object.values(tier)) {
        const slot = (slots[descriptor.type] ??= { type: descriptor.type, subscribers: new Set() });
        slot.entity = descriptor.entity ?? slot.entity;
        slot.schema = descriptor.schema ?? slot.schema;
        slot.repository = descriptor.repository ?? slot.repository;
        if (descriptor.subscriber) slot.subscribers.add(descriptor.subscriber);
      }
    return Object.values(slots);
  };

  const seal = (slot) =>
    !slot.schema.meta.abstract
      ? slot
      : {
          ...slot,
          schema: new EntitySchema({
            class: slot.entity,
            extends: slot.schema,
            name: slot.schema.meta.className,
            tableName: slot.schema.meta.className,
            repository: () => slot.repository ?? DataRepository,
          }),
        };

  const variant = collate([sets.daemon, sets.kernel, sets.userspace, die.domain.entities]) //
    .map(seal);

  die.variant.subscribers = [...new Set(variant.flatMap((slot) => [...slot.subscribers]))];
  die.variant.entities = variant.map(({ subscribers, ...entity }) => entity);
}

export function wiring(daemonDie) {
  daemonDie.good.statics = daemonDie.mask.statics;
  daemonDie.good.docs = daemonDie.mask.docs;
}

export async function datamap(daemonDie) {
  daemonDie.datamap = await daemonDie.register.datamap.provider(
    daemonDie.mask.datamap,
    daemonDie.variant.entities,
    daemonDie.variant.subscribers,
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
