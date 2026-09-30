import paladin from "@vivalence/paladin";
import { Mode, shape, shard } from "@vivalence/typology";
import { ActivityEntity, ActivityRepository, assemble, sets } from "../../entities/index.ts";
import * as traits from "../mode/traits/index.js";

export const core = async (die, next) => {
  die.register = await paladin.ledger.registry.wire(die.mask);
  die.daemon.domain = die.register.domain;
  die.instance = {
    traits: { ...traits, ...die.daemon.domain.traits },
    ...assemble([sets.kernel, sets.userspace, sets.transient, die.daemon.domain.entities]),
  };
  await next();
};

export const wiring = async (die, next) => {
  die.daemon.statics = die.mask.statics;
  die.daemon.mountpoint = die.mask.mountpoint;
  await next();
};

export const datamap = async (die, next) => {
  die.daemon.datamap = await die.register.datamap.provider(die.register.datamap, {
    entities: die.instance.entities.map((descriptor) => descriptor.schema),
    subscribers: die.instance.subscribers.map((Subscriber) => new Subscriber()),
  });
  die.daemon.entities = die.daemon.datamap.entities;
  die.daemon.entities.activity = new ActivityRepository(die.daemon.datamap.entities.em, ActivityEntity);
  die.daemon.twitch.branch("/after").use(shard.datamap.detached(die.daemon.datamap));
  die.daemon.datamap.registerSubscriber(shape.subscriber(die.daemon.twitch));
  die.daemon.aperture.use(shard.datamap.inject(die.daemon.datamap));
  try {
    await next();
  } finally {
    await die.daemon.entities.activity.remove({});
    await die.daemon.datamap.close();
  }
};

export const authority = async (die, next) => {
  die.daemon.lighthouse = await die.register.lighthouse.provider(die.register.lighthouse, die.daemon.entities.user);
  die.daemon.aperture
    .use(shard.secure.authority(die.daemon.lighthouse))
    .use(async (ctx, next) => {
      ctx.daemon.connection = die.connection.clone();
      ctx.daemon.connection.use(async (context, next) => {
        context.request.headers.set("authorization", ctx.request.headers.get("authorization"));
        await next();
      });
      await next();
    });
  await next();
};

export const acid = async (die, next) => {
  for (const [index, citizen] of die.register.hallucinators.entries()) {
    try {
      const faculties = await citizen.provider(citizen);
      die.daemon.cortex.register(faculties.map((faculty) => ({ ...faculty, provider: citizen.manifest.slug })));
    } catch (error) {
      const at = `daemon[${die.daemon.slug}].hallucinators[${index}]`;
      console.warn(`[provider] ${at} ${citizen.manifest.slug} refused — ${error.message}`);
    }
  }
  await next();
};

export const services = async (die, next) => {
  for (const [slug, citizen] of Object.entries(die.register.consume)) {
    die.daemon.services[slug] = await citizen.provider(citizen); //@beef pass cortex or something??? maybe service provider should be a vector?
    if (citizen.manifest.traits.includes("TOOLING") && citizen.tools) {
      die.daemon.services[slug].tools = citizen.tools;
    }
  }
  await next();
};

export const modes = async (die, next) => {
  for (const mask of die.register.kernel) {
    (die.daemon.modes[mask.manifest.type] ??= {})[mask.manifest.slug] = Object.assign(new Mode(mask), { stdout: die.controller.stdout.branch(mask.reference.absolute) });
  }
  await next();
};
