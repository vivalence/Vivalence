import paladin from "@vivalence/paladin";
import { contexts, control, Cortex, Mode, shard, Twitch } from "@vivalence/typology";
import { sets, wrap } from "@vivalence/typology/entities";
import { gather, mint, strike } from "../../../gestalten/belt/index.js";
import * as traits from "../../mode/traits/index.js";

export const core = async (die, next) => {
  die.register = await paladin.ledger.registry.wire(die.mask);
  paladin.instance.paladin.dormant.push(...die.register.dormant);
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
  die.daemon.datamap = die.runtime.datamap;

  die.daemon.minted = mint({
    slug: die.daemon.slug,
    kinds: sets.traits,
    traits: {
      literal: gather(die.daemon.domain, die.register.modes, "literal"),
      symbol: gather(die.daemon.domain, die.register.modes, "symbol"),
      note: gather(die.daemon.domain, die.register.modes, "note"),
      mode: gather(die.daemon.domain, die.register.modes, "mode"),
    },
  });

  die.daemon.entities = {
    ...die.daemon.datamap.entities,
    ...strike(die.daemon.minted, die.daemon.datamap.entities.em, sets.traits),
    activity: die.runtime.entities.activity,
  };

  die.daemon.twitch = new Twitch()
    .use(shard.context.spread(contexts.daemonDie, die.daemon))
    .use(shard.context.bind("daemon", die.daemon))
    .use(shard.datamap.owned());
  die.daemon.twitch
    .branch("/after")
    .use(shard.datamap.detached(die.daemon.datamap))
    .use(control.fault((die) => die.daemon.controller));
  if (die.daemon.domain.twitch) die.daemon.twitch.graft(die.daemon.domain.twitch);
  die.daemon.datamap.registerSubscriber(die.daemon.twitch);
  await die.daemon.datamap.shard.scope(async () => {
    await die.daemon.twitch.dispatch("/after/datamap/boot");
    if (die.daemon.datamap.migrated.length)
      await die.daemon.twitch.dispatch("/after/datamap/migrate", { migrations: die.daemon.datamap.migrated });
  });

  die.daemon.aperture
    .use(shard.datamap.inject(die.daemon.datamap))
    .use(die.daemon.datamap.shard.bind("daemon", () => ({ daemon: die.daemon.slug })));

  await next();
};

export const acid = async (die, next) => {
  const supplied = await Promise.all(
    die.register.hallucinators.map((citizen) => citizen.provider(citizen)),
  );
  die.daemon.cortex = new Cortex(supplied.flat());
  await next();
};

export const providers = async (die, next) => {
  for (const [slug, citizen] of Object.entries(die.register.consume)) {
    die.daemon.providers[slug] = await citizen.provider(citizen); //@beef pass cortex or something??? maybe service provider should be a vector?
    if (citizen.manifest.traits.includes("TOOLING") && citizen.tools) {
      die.daemon.providers[slug].tools = citizen.tools;
    }
  }
  await next();
};

export const modes = async (die, next) => {
  for (const [index, module] of die.register.modes.entries()) {
    const mode = new Mode({ module, mask: die.mask.modes[index] });
    mode.stdout = die.daemon.controller.stdout.branch(mode.reference.absolute);
    (die.daemon.modes[mode.manifest.type] ??= {})[mode.manifest.slug] = mode;
  }
  await next();
};
