import paladin from "@vivalence/paladin";
import { contexts, Cortex, Mode, shard } from "@vivalence/typology";
import { Daemon } from "../../daemon/prototype.js";
import { Service } from "../../service/prototype.js";
import { Lighthouse } from "../../lighthouse/prototype.js";
import { ActivityEntity, ActivityRepository, sets } from "../../../entities/index.ts";
import { assemble, gather, mint, strike } from "../../../gestalten/belt/index.js";
import * as schematics from "../../../schematics/index.js";
import * as traits from "../../mode/traits/index.js";

export const validate = async (die, next) => {
  paladin.check.instance(die.runtime.instance).throw();
  const faults = schematics.Instance.faults(die.runtime.instance);
  if (faults.length)
    throw new Error(`runtime: ${faults.map((fault) => `${fault.at} ${fault.reason}`).join(" · ")}`);
  await next();
};

export const registry = async (die, next) => {
  await paladin.ledger.registry.supply();
  await next();
};

export const datamap = async (die, next) => {
  const datamapMode = await paladin.ledger.registry.accio(
    die.runtime.instance.datamap?.module ?? "@commons/datamap/libsql",
  );
  const { entities, twitch } = assemble([
    sets.identity,
    sets.composition,
    sets.traits,
    sets.userspace,
    sets.transient,
  ]);
  die.runtime.datamap = await datamapMode.provider(
    {
      mountpoint: paladin.scope.mountpoint,
      statics: {
        db: { file: `${die.runtime.instance.manifest.slug}.viva.db` },
        context: { name: `runtime/${die.mask.manifest.slug}` },
      },
    },
    { entities: entities.map((descriptor) => descriptor.schema) },
  );
  die.runtime.entities = { ...die.runtime.datamap.entities };
  die.runtime.entities.activity = new ActivityRepository(
    die.runtime.datamap.entities.em,
    ActivityEntity,
  );
  die.runtime.twitch.use(shard.context.spread(contexts.host, die.runtime));
  for (const held of twitch) die.runtime.twitch.graft(held);
  die.runtime.twitch.branch("/after").use(shard.datamap.detached(die.runtime.datamap));
  die.runtime.datamap.registerSubscriber(die.runtime.twitch);
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
  die.runtime.lighthouse = new Lighthouse(die.runtime.instance.lighthouse);
  await next();
};

export const aperture = async (die, next) => {
  die.aperture.open("/status", () => die.controller.status);
  await next();
};

export const acid = async (die, next) => {
  die.runtime.cortex = new Cortex();
  const citizens = await Promise.all(
    (die.runtime.instance.hallucinators ?? []).map((query) => paladin.ledger.registry.accio(query)),
  );
  for (const [index, citizen] of citizens.entries()) {
    try {
      const faculties = await citizen.provider(citizen);
      die.runtime.cortex.register(
        faculties.map((faculty) => ({ ...faculty, provider: citizen.manifest.slug })),
      );
    } catch (error) {
      console.warn(
        `[provider] hallucinators[${index}] ${citizen.manifest.slug} refused — ${error.message}`,
      );
    }
  }
  await next();
};

export const modes = async (die, next) => {
  die.runtime.register = await paladin.ledger.registry.wire(die.mask);
  die.runtime.domain = die.runtime.register.domain;
  die.runtime.controller = die.controller;
  die.runtime.manifest = die.mask.manifest;
  die.runtime.url = die.mask.url;
  die.runtime.attach = die.mask.attach;
  die.runtime.mountpoint = die.mask.mountpoint;
  die.runtime.statics = die.mask.statics ?? null;
  const { DATASET, DATASINK, ...admitted } = traits;
  die.traits = admitted;
  for (const mask of die.runtime.register.modes) {
    (die.runtime.modes[mask.manifest.type] ??= {})[mask.manifest.slug] = Object.assign(new Mode(mask), { stdout: die.runtime.controller.stdout.branch(mask.reference.absolute) });
  }
  await next();
};

export const services = async (die, next) => {
  const masks = await Promise.all(
    die.runtime.instance.services.map((query) => paladin.ledger.registry.accio(query)),
  );
  for (const mask of masks) {
    if (!mask.manifest.traits.includes("ATTACHED")) {
      die.runtime.instance.dormant.push({
        at: `service[${mask.manifest.slug}]`,
        module: mask.identifier,
        empty: [],
        why: "not ATTACHED — consumed only",
      });
      continue;
    }
    die.runtime.services[mask.manifest.slug] = new Service({
      slug: mask.manifest.slug,
      mask,
      controller: die.controller.branch(mask.reference.absolute),
    });
  }
  await next();
};

export const daemons = async (die, next) => {
  const prune = paladin.env.get("VIVA_RUNTIME_PRUNE") === "1";
  const repository = die.runtime.entities.daemon;
  const declared = new Map(die.runtime.instance.daemons.map((mask) => [mask.manifest.slug, mask]));
  await die.runtime.datamap.shard.scope(async () => {
    const orphans = (await repository.find({})).filter((row) => !declared.has(row.slug));
    if (orphans.length && !prune)
      throw new Error(
        `instance: ${orphans.map((row) => row.slug).join(", ")} held in the datamap but absent from instance.viva.json — viva instance/start --prune to drop them`,
      );
    for (const row of orphans) await repository.removeOne({ slug: row.slug });
    for (const [slug, mask] of declared)
      await repository.ensure({
        slug,
        mask: die.runtime.instance.raw.daemons.find((entry) => entry.manifest.slug === slug),
        traits: mask.manifest.traits ?? [],
      });
    await die.runtime.entities.em.flush();
  });
  for (const mask of die.runtime.instance.daemons)
    die.runtime.daemons[mask.manifest.slug] = new Daemon({
      slug: mask.manifest.slug,
      mask,
      controller: die.controller.branch(mask.reference.absolute),
    });
  await next();
};
