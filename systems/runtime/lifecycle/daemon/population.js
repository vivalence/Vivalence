import paladin from "@vivalence/paladin";
import { contexts, Mode, shard, Twitch } from "@vivalence/typology";
import { kernel, sets, wrap } from "../../entities/index.ts";
import { gather, mint, strike } from "../../gestalten/belt/index.js";
import * as traits from "../../traits/index.js";

export const core = async (die, next) => {
  die.register = await paladin.ledger.registry.wire(die.mask);
  die.daemon.domain = die.register.domain;
  die.traits = traits;
  die.daemon.entity = await die.runtime.datamap.shard.scope(async () =>
    wrap(await die.runtime.entities.daemon.findOneOrFail({ slug: die.daemon.slug })).toPOJO(),
  );
  await next();
};

export const wiring = async (die, next) => {
  die.daemon.statics = die.mask.statics;
  die.daemon.mountpoint = die.mask.mountpoint;
  await next();
};

export const datamap = async (die, next) => {
  const { datamap } = die.runtime;
  die.daemon.datamap = datamap;
  const traits = Object.fromEntries(Object.keys(sets.traits).map((kind) => [kind, gather(kernel, die.daemon.domain, die.register.modes, kind)]));
  die.daemon.minted = mint({ slug: die.daemon.slug, kinds: sets.traits, traits });
  die.daemon.entities = { ...datamap.entities, ...strike(die.daemon.minted, datamap.entities.em, sets.traits), activity: die.runtime.entities.activity };
  die.daemon.twitch = new Twitch().use(shard.context.spread(contexts.host, die.daemon)).use(shard.datamap.owned());
  die.daemon.twitch.branch("/after").use(shard.datamap.detached(datamap));
  if (die.daemon.domain.twitch) die.daemon.twitch.graft(die.daemon.domain.twitch);
  datamap.registerSubscriber(die.daemon.twitch);
  die.daemon.aperture.use(shard.datamap.inject(datamap));
  await next();
};

export const acid = async (die, next) => {
  const faculties = [];
  for (const [index, citizen] of die.register.hallucinators.entries()) {
    try {
      const supplied = await citizen.provider(citizen);
      faculties.push(...supplied.map((faculty) => ({ ...faculty, provider: citizen.manifest.slug })));
    } catch (error) {
      const at = `daemon[${die.daemon.slug}].hallucinators[${index}]`;
      console.warn(`[provider] ${at} ${citizen.manifest.slug} refused — ${error.message}`);
    }
  }
  die.daemon.cortex = die.runtime.cortex.split(faculties);
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
  for (const mask of die.register.modes) {
    (die.daemon.modes[mask.manifest.type] ??= {})[mask.manifest.slug] = Object.assign(new Mode(mask), { stdout: die.daemon.controller.stdout.branch(mask.reference.absolute) });
  }
  await next();
};
