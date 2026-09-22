import paladin from "@vivalence/paladin";
import { EntitySchema, wrap } from "@mikro-orm/core";

import { Aperture, Mode, Path, shard, Url, v, Vector } from "@vivalence/typology";
import { is, shape, steer } from "@vivalence/typology";
import { ActivityEntity, ActivityRepository, DataRepository, sets } from "@vivalence/runtime";

import * as traits from "../traits/index.js";

export async function core(die) {
  die.register = await paladin.ledger.registry.wire(die.mask);
  die.good.domain = die.register.domain;

  die.instance.traits = {
    ...traits,
    ...die.good.domain.traits,
  };

  // @beef hacky micro/abstract entity handling
  const collate = (tiers) => {
    const slots = {};
    for (const tier of tiers) {
      for (const descriptor of Object.values(tier)) {
        const slot = (slots[descriptor.type] ??= { type: descriptor.type, subscribers: new Set() });
        slot.entity = descriptor.entity ?? slot.entity;
        slot.schema = descriptor.schema ?? slot.schema;
        slot.repository = descriptor.repository ?? slot.repository;
        if (descriptor.subscriber) slot.subscribers.add(descriptor.subscriber);
      }
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

  const instance = collate([sets.daemon, sets.kernel, sets.userspace, sets.transient, die.good.domain.entities]) //
    .map(seal);

  die.instance.subscribers = [...new Set(instance.flatMap((slot) => [...slot.subscribers]))];
  die.instance.entities = instance.map(({ subscribers, ...entity }) => entity);
}

export function wiring(daemonDie) {
  daemonDie.good.statics = daemonDie.mask.statics;
  daemonDie.good.mountpoint = daemonDie.mask.mountpoint;
}

export async function datamap(daemonDie) {
  daemonDie.datamap = await daemonDie.register.datamap.provider(
    daemonDie.register.datamap,
    daemonDie.instance.entities,
    daemonDie.instance.subscribers,
  );

  daemonDie.good.entities = daemonDie.datamap.entities;
  daemonDie.good.entities.activity = new ActivityRepository(daemonDie.datamap.entities.em, ActivityEntity);
  daemonDie.good.datamap = daemonDie.datamap;

  daemonDie.good.twitch.branch("/after").use(shard.datamap.detached(daemonDie.datamap));
  daemonDie.datamap.subscribe(shape.subscriber(daemonDie.good.twitch));
  daemonDie.good.aperture.use(shard.datamap.inject(daemonDie.datamap));
}

export async function authority(daemonDie) {
  daemonDie.good.lighthouse = await daemonDie.register.lighthouse //
    .provider(daemonDie.register.lighthouse, daemonDie.good.entities.user);

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
  for (const [index, citizen] of daemonDie.register.hallucinators.entries()) {
    try {
      const faculties = await citizen.provider(citizen);
      daemonDie.good.cortex.register(
        faculties.map((faculty) => ({ ...faculty, provider: citizen.manifest.slug })),
      );
    } catch (error) {
      const at = `daemon[${daemonDie.slug}].hallucinators[${index}]`;
      console.warn(`[provider] ${at} ${citizen.manifest.slug} refused — ${error.message}`);
    }
  }
  // console.log(daemonDie.good.cortex);
}

export async function services(daemonDie) {
  for (const [slug, citizen] of Object.entries(daemonDie.register.consume)) {
    daemonDie.good.services[slug] = await citizen.provider(citizen); //@beef pass cortex or something??? maybe service provider should be a vector?
    if (citizen.manifest.traits.includes("TOOLING") && citizen.tools) {
      daemonDie.good.services[slug].tools = citizen.tools;
    }
  }
}

export async function modes(daemonDie) {
  await daemonDie.datamap.shard.context(async () => {
    for (const citizen of daemonDie.register.kernel) {
      const mode = new Mode(citizen);

      if (!mode.aperture) mode.aperture = new Aperture();

      mode.tools = new Vector();
      mode.tools.use(shard.context.bind("daemon", daemonDie.good));
      mode.tools.use(shard.context.bind("mode", mode));

      mode.entity = await daemonDie.good.entities.mode.ensure({ ...mode.manifest });

      mode.entity.traits = [...mode.manifest.traits];

      await daemonDie.good.entities.em.flush();

      mode.entity = wrap(mode.entity).toPOJO();
      mode.id = mode.entity.id;

      if (!daemonDie.good.modes[mode.manifest.type]) daemonDie.good.modes[mode.manifest.type] = {};
      daemonDie.good.modes[mode.manifest.type][mode.manifest.slug] = mode;
    }
  });
}

export function handlers(daemonDie) {
  daemonDie.good.flatmodes = () =>
    Object.values(daemonDie.good.modes)
      .map((type) => Object.values(type))
      .flat();
}
