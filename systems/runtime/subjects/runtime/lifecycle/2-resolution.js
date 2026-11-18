import { fromm, monad, shape, shard } from "@vivalence/typology";
import * as belt from "../../../gestalten/belt/index.js";

export const lighthouse = (factory) => async (die, next) => {
  await factory(die.runtime.lighthouse)(die);
  await next();
};

export const services = (factory) => async (die, next) => {
  try {
    await monad.traverse(Object.values(die.runtime.services), (service) => factory(service)(die));
    await next();
  } finally {
    await Promise.all(Object.values(die.runtime.services).map((service) => service.controller.kill("SIGTERM")));
  }
};

export const daemons = (factory) => async (die, next) => {
  try {
    await monad.traverse(Object.values(die.runtime.daemons), (daemon) => factory(daemon)(die));
    await next();
  } finally {
    await Promise.all(Object.values(die.runtime.daemons).map((daemon) => daemon.controller.kill("SIGTERM")));
  }
};

export const modes = (factory) => async (die, next) => {
  die.runtime.aperture.use(die.runtime.lighthouse.authenticate).use(die.runtime.lighthouse.bind);
  try {
    await belt.modes.resolve(die.runtime, factory, die.traits);
    await next();
  } finally {
    await belt.modes.release(die.runtime);
  }
};

export const attach = async (die, next) => {
  for (const service of Object.values(die.runtime.services)) {
    die.aperture.branch(service.reference, service.attachment);
  }
  await next();
};

const harnessed = (host) => fromm.modes(host.modes).flat.filter((mode) => mode.implements("HARNESS"));
const attached = (modes) => fromm.modes(modes).flat.filter((mode) => mode.implements("ATTACHED"));

const carrying = (host, runtime) => {
  host.aperture.use(shard.context.bind("runtime", runtime));
  for (const mode of harnessed(host)) mode.aperture.branch("/harness").use(shard.context.bind("runtime", runtime));
};

export const expose = async (die, next) => {
  carrying(die.runtime, die.runtime);
  const runtime = die.aperture.branch(die.runtime.reference, die.runtime.aperture);
  runtime.branch("/status", shard.nano.atom(die.runtime.controller.status.$transient));
  runtime.open("/batch", shard.batch.route(runtime));
  for (const mode of attached(die.runtime.modes)) {
    die.runtime.attachment.branch(die.runtime.reference).branch(mode.reference, mode.attachment);
  }

  for (const daemon of Object.values(die.runtime.daemons)) {
    carrying(daemon, die.runtime);
    const branch = die.aperture.branch(daemon.reference, daemon.aperture);
    branch.branch("/status", shard.nano.atom(daemon.$status));
    branch.open("/batch", shard.batch.route(branch));
    for (const mode of attached(daemon.modes)) {
      die.runtime.attachment.branch(daemon.reference).branch(mode.reference, mode.attachment);
    }
  }

  await next();
};

export const metadata = async (die, next) => {
  die.aperture.open("/beacon/manifest", () => die.mask.manifest);

  const root = die.aperture.branch("/metadata").use(die.runtime.lighthouse.authenticate);

  root.open("/aperture", () => shape.strip(die.aperture));
  root.open("/datamap", () => shard.datamap.strip(die.runtime.datamap.getMetadata()));

  root.open("/daemons", async () =>
    Object.values(die.runtime.daemons).map((daemon) => ({
      slug: daemon.slug,
      reference: daemon.reference.nature,
      modes: fromm.modes(daemon.modes).flat.length,
      metadata: `${daemon.reference.nature}/metadata`,
    })),
  );

  root.open("/services", async () =>
    Object.values(die.runtime.services).map((service) => ({
      type: service.manifest.type,
      slug: service.slug,
      reference: service.reference.absolute,
      metadata: `${service.reference.absolute}/metadata`,
    })),
  );

  await next();
};
