import paladin from "@vivalence/paladin";
import { shape } from "@vivalence/typology";
import { Daemon, DaemonSchema } from "../../prototypes/daemon.js";
import { Service, ServiceSchema } from "../../prototypes/service.js";
import { ProcessRepository, ProcessSchema } from "../../entities/index.ts";
import * as schematics from "../../schematics/index.js";

export const validate = async (die, next) => {
  paladin.check.instance(die.runtime.instance).throw();
  const faults = schematics.Instance.faults(die.runtime.instance);
  if (faults.length) throw new Error(`runtime: ${faults.map((fault) => `${fault.at} ${fault.reason}`).join(" · ")}`);
  await next();
};

export const registry = async (die, next) => {
  await paladin.ledger.registry.supply();
  await next();
};

export const datamap = async (die, next) => {
  const citizen = await paladin.ledger.registry.accio(die.runtime.instance.datamap?.module ?? "@commons/datamap/libsql");
  die.runtime.datamap = await citizen.provider(
    { statics: { context: { name: `runtime/${die.mask.manifest.slug}` } } },
    { entities: [ProcessSchema, ServiceSchema, DaemonSchema] },
  );
  die.runtime.processes = {
    service: new ProcessRepository(die.runtime.datamap.orm.em, Service),
    daemon: new ProcessRepository(die.runtime.datamap.orm.em, Daemon),
  };
  die.runtime.datamap.registerSubscriber(shape.subscriber(die.runtime.twitch));
  try {
    await next();
  } finally {
    await die.runtime.datamap.close();
  }
};

export const aperture = async (die, next) => {
  die.runtime.aperture.open("/status", () => die.controller.status).open("/manifest", () => die.mask.manifest);
  await next();
};

export const services = async (die, next) => {
  const masks = await Promise.all(die.runtime.instance.services.map((query) => paladin.ledger.registry.accio(query)));
  await die.runtime.datamap.shard.scope(() =>
    Promise.all(
      masks.map((mask) => {
        if (!mask.manifest.traits.includes("ATTACHED")) {
          return die.runtime.instance.dormant.push({ at: `service[${mask.manifest.slug}]`, module: mask.identifier, empty: [], why: "not ATTACHED — consumed only" });
        }
        return die.runtime.processes.service.create({ slug: mask.manifest.slug, mask, controller: die.controller.branch(mask.reference.absolute) });
      }),
    ),
  );
  try {
    await next();
  } finally {
    await die.runtime.processes.service.remove();
  }
};

export const daemons = async (die, next) => {
  await die.runtime.datamap.shard.scope(() =>
    Promise.all(
      die.runtime.instance.daemons.map((mask) =>
        die.runtime.processes.daemon.create({ slug: mask.manifest.slug, mask, controller: die.controller.branch(mask.reference.absolute) }),
      ),
    ),
  );
  try {
    await next();
  } finally {
    await die.runtime.processes.daemon.remove();
  }
};
