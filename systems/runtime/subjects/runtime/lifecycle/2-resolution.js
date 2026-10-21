import paladin from "@vivalence/paladin";
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
    die.aperture.branch(service.reference.absolute, service.attachment);
  }

  const attached = die.aperture.branch("/attached");
  attached.branch("/view/:id").use(shard.datamap.errors()).do(async (input, ctx) => {
    const view = await die.runtime.entities.view.findOneOrFail({ id: ctx.params.id }, { populate: ["files"] });
    return {
      id: view.id,
      slug: view.slug,
      mime: view.mime,
      entry: view.entry,
      traits: view.traits,
      files: view.files.getItems().map((file) => ({ id: file.id, path: file.path, mime: file.mime, integrity: file.integrity })),
    };
  });
  attached.branch("/file/:id").use(shard.datamap.errors()).do(async (input, ctx) => {
    const file = await die.runtime.entities.file.findOneOrFail({ id: ctx.params.id });
    ctx.response.type = file.mime;
    ctx.response.headers.set("x-viva-integrity", file.integrity);
    return await paladin.read.bytes(file.mount);
  });

  await next();
};

export const expose = async (die, next) => {
  const runtime = die.aperture.branch(die.runtime.reference.nature, die.runtime.aperture);
  runtime.branch("/status", shard.nano.atom(die.runtime.controller.status.$transient));
  runtime.open("/batch", shard.batch.route(runtime));
  for (const daemon of Object.values(die.runtime.daemons)) {
    const branch = die.aperture.branch(daemon.reference.nature, daemon.aperture);
    branch.branch("/status", shard.nano.atom(daemon.$status));
    branch.open("/batch", shard.batch.route(branch));
  }
  await next();
};

export const metadata = async (die, next) => {
  const root = die.aperture.branch("/metadata");

  root.open("/manifest", () => die.mask.manifest);
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
