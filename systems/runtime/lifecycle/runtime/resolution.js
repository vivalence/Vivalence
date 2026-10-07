import paladin from "@vivalence/paladin";
import { Cargo, contexts, fromm, shape, shard } from "@vivalence/typology";
import { host } from "../../gestalten/belt/index.js";
import { cargo } from "../../gestalten/shard/index.js";

export const services = (execution) => async (die, next) => {
  try {
    for (const service of await die.runtime.processes.service.find()) await service.execute(execution);
    await next();
  } finally {
    await die.runtime.processes.service.kill({}, "SIGTERM");
  }
};

export const daemons = (execution) => async (die, next) => {
  try {
    for (const daemon of await die.runtime.processes.daemon.find()) await daemon.execute(execution, { runtime: die.runtime });
    await next();
  } finally {
    await die.runtime.processes.daemon.kill({}, "SIGTERM");
  }
};

export const modes = (execution) => async (die, next) => {
  die.runtime.aperture.use(die.runtime.lighthouse.authenticate).use(die.runtime.lighthouse.bind);
  try {
    await host.resolve(die.host, execution, die.traits);
    die.runtime.cargo = new Cargo(() => fromm.modes(die.runtime.modes).flat.filter((mode) => mode.implements("FRAUGHT") || mode.implements("MOUNTED")).map((mode) => mode.freight));
    await next();
  } finally {
    await host.release(die.host);
  }
};

const hosts = async (die) => [...(await die.runtime.processes.daemon.find()), die.host];

export const attach = async (die, next) => {
  for (const service of await die.runtime.processes.service.find()) {
    die.aperture.branch(service.reference.absolute, service.attachment);
  }

  for (const bearer of await hosts(die)) {
    for (const mode of fromm.modes(bearer.modes).flat) {
      if (!mode.implements("APPLICATION") && !mode.implements("GENERATIVE")) continue;
      const bundler = paladin.bundler(mode.bundles.absolute);
      die.aperture
        .branch("/attached/bundle")
        .branch(bearer.reference.absolute)
        .branch(mode.reference.absolute)
        .open("/(.*)", async (input, ctx) => {
          const served = await bundler.serve(fromm.params(ctx.params).path.absolute);
          if (!served) {
            ctx.response.status = 404;
            return null;
          }
          ctx.response.type = served.type;
          ctx.response.headers.set("x-viva-integrity", `sha256-${served.integrity}`);
          return served.text;
        });
    }

    const fraught = fromm.modes(bearer.modes).flat.filter((mode) => mode.implements("FRAUGHT") || mode.implements("MOUNTED"));
    if (!fraught.length) continue;
    die.aperture
      .branch("/attached/cargo")
      .branch(bearer.reference.nature)
      .use(shard.context.spread(contexts.host, bearer))
      .open("/(.*)", cargo.serve(() => fraught));
  }

  await next();
};

export const expose = async (die, next) => {
  const runtime = die.aperture.branch(die.runtime.reference.nature, die.runtime.aperture);
  runtime.branch("/status", shard.nano.atom(die.runtime.controller.status.$transient));
  runtime.open("/batch", shard.batch.route(runtime));
  for (const daemon of await die.runtime.processes.daemon.find()) {
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
    (await die.runtime.processes.daemon.find()).map((daemon) => ({
      slug: daemon.slug,
      reference: daemon.reference.nature,
      modes: fromm.modes(daemon.modes).flat.length,
      metadata: `${daemon.reference.nature}/metadata`,
    })),
  );

  root.open("/services", async () =>
    (await die.runtime.processes.service.find()).map((service) => ({
      type: service.manifest.type,
      slug: service.slug,
      reference: service.reference.absolute,
      metadata: `${service.reference.absolute}/metadata`,
    })),
  );

  await next();
};
