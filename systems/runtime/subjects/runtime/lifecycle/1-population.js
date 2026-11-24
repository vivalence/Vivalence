import paladin from "@vivalence/paladin";
import { contexts, Cortex, Mode, shard } from "@vivalence/typology";
import { Daemon } from "../../daemon/prototype.js";
import { Service } from "../../service/prototype.js";
import { Lighthouse } from "../../lighthouse/prototype.js";
import { ActivityEntity, ActivityRepository, sets } from "@vivalence/typology/entities";
import { assemble, gather, mint, strike } from "../../../gestalten/belt/index.js";
import * as schematics from "../../../schematics/index.js";
import * as traits from "../../mode/traits/index.js";

export const validate = async (die, next) => {
  paladin.check.instance(paladin.instance).throw();
  const faults = schematics.Instance.faults(paladin.instance);
  if (faults.length)
    throw new Error(`runtime: ${faults.map((fault) => `${fault.at} ${fault.reason}`).join(" · ")}`);
  await next();
};

export const registry = async (die, next) => {
  await paladin.ledger.registry.supply();
  die.register = await paladin.ledger.registry.wire(die.mask);
  paladin.instance.paladin.dormant.push(...die.register.dormant);
  await next();
};

export const datamap = async (die, next) => {
  const datamapMode = await paladin.ledger.registry.accio(
    paladin.instance.datamap?.module ?? "@commons/datamap/libsql",
  );
  const { entities, twitch } = assemble([
    sets.identity,
    sets.composition,
    sets.traits,
    sets.userspace,
    sets.transient,
  ]);
  for (const held of twitch) die.runtime.twitch.graft(held);
  die.runtime.datamap = await datamapMode.provider(
    {
      mountpoint: paladin.scope.mountpoint,
      statics: {
        db: { file: `${paladin.instance.manifest.slug}.viva.db` },
        context: { name: `runtime/${die.mask.manifest.slug}` },
      },
      version: paladin.version,
    },
    {
      twitch: die.runtime.twitch,
      entities: entities.map((descriptor) => descriptor.schema),
    },
  );
  die.runtime.entities = { ...die.runtime.datamap.entities };
  die.runtime.entities.activity = new ActivityRepository(
    die.runtime.datamap.entities.em,
    ActivityEntity,
  );
  die.runtime.twitch
    .use(shard.context.spread(contexts.runtimeDie, die.runtime))
    .use(shard.context.bind("runtime", die.runtime));
  die.runtime.twitch.branch("/after").use(shard.datamap.detached(die.runtime.datamap));
  die.runtime.datamap.registerSubscriber(die.runtime.twitch);
  await die.runtime.datamap.shard.scope(async () => {
    await die.runtime.twitch.dispatch("/after/datamap/boot");
    if (die.runtime.datamap.migrated.length)
      await die.runtime.twitch.dispatch("/after/datamap/migrate", { migrations: die.runtime.datamap.migrated });
  });
  die.runtime.minted = mint({
    slug: null,
    kinds: { note: sets.traits.note, mode: sets.traits.mode },
    traits: { note: gather(null, [], "note"), mode: gather(null, [], "mode") },
  });
  Object.assign(
    die.runtime.entities,
    strike(die.runtime.minted, die.runtime.datamap.entities.em, sets.traits),
  );
  die.aperture.use(shard.datamap.inject(die.runtime.datamap));
  try {
    await next();
  } finally {
    await die.runtime.entities.activity.remove({});
    await die.runtime.datamap.close();
  }
};

export const lighthouse = async (die, next) => {
  die.runtime.lighthouse = new Lighthouse(paladin.instance.lighthouse);
  await next();
};

export const aperture = async (die, next) => {
  die.aperture.open("/beacon/status", () => die.controller.status);
  await next();
};

export const acid = async (die, next) => {
  const supplied = await Promise.all(
    die.register.hallucinators.map((citizen) => citizen.provider(citizen)),
  );
  die.runtime.cortex = new Cortex(supplied.flat());
  await next();
};

export const modes = async (die, next) => {
  die.runtime.domain = die.register.domain;
  die.runtime.controller = die.controller;
  die.runtime.mountpoint = die.mask.mountpoint;
  die.runtime.statics = die.mask.statics ?? null;
  const { DATASET, DATASINK, ...admitted } = traits;
  die.traits = admitted;
  for (const [index, module] of die.register.modes.entries()) {
    const mode = new Mode({ module, mask: die.mask.modes[index] });
    mode.stdout = die.runtime.controller.stdout.branch(mode.reference.absolute);
    (die.runtime.modes[mode.manifest.type] ??= {})[mode.manifest.slug] = mode;
  }
  await next();
};

export const services = async (die, next) => {
  for (const mask of paladin.instance.services) {
    const citizen = await paladin.ledger.registry.accio(mask);
    if (!citizen.manifest.traits.includes("ATTACHED")) {
      paladin.instance.paladin.dormant.push({
        at: `services.${citizen.manifest.slug}`,
        module: citizen.identifier,
        empty: [],
        why: "not ATTACHED — consumed only",
      });
      continue;
    }
    die.runtime.services[mask.manifest.slug] = new Service({
      mask,
      module: citizen,
      controller: die.controller.branch(mask.reference.absolute),
    });
  }
  await next();
};

export const daemons = async (die, next) => {
  const repository = die.runtime.entities.daemon;
  const declared = new Map(paladin.instance.daemons.map((mask) => [mask.manifest.slug, mask]));
  await die.runtime.datamap.shard.scope(async () => {
    const orphans = (await repository.find({})).filter((row) => !declared.has(row.slug));
    for (const row of orphans) await repository.removeOne({ slug: row.slug });
    for (const [slug, mask] of declared)
      await repository.ensure({
        slug,
        traits: mask.manifest.traits ?? [],
      });
    await die.runtime.entities.em.flush();
  });
  for (const mask of paladin.instance.daemons)
    die.runtime.daemons[mask.manifest.slug] = new Daemon({
      mask,
      controller: die.controller.branch(mask.reference.absolute),
    });
  await next();
};
