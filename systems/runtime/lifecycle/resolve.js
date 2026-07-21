import paladin from "@vivalence/paladin";
import { fromm, shard, shape } from "@vivalence/typology";

export async function attach(runtimeDie) {
  async function attachProcesses(runtimeDie) {
    for (const processDie of runtimeDie.good.processes) {
      processDie.good
        .open("/status", () => processDie.status.reflection)
        .open("/manifest", () => processDie.manifest);

      runtimeDie.good.aperture
        .branch(`/attached/process/${processDie.type}/${processDie.slug}`)
        .use(shard.context.attach(processDie.type, processDie.mask))
        .slurp(processDie.good);
    }
  }

  async function attachBundles(runtimeDie) {
    for (const daemonDie of runtimeDie.good.daemons) {
      for (const mode of daemonDie.good.flatmodes()) {
        if (!mode.implements("APPLICATION") && !mode.implements("GENERATIVE")) continue;
        const bundler = paladin.bundler(
          `${daemonDie.good.mountpoint.absolute}/${mode.type}/${mode.slug}`,
        );

        runtimeDie.good.aperture
          .branch("/attached/bundle")
          .branch(mode.mount.absolute)
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
    }
  }

  async function attachCargo(runtimeDie) {
    for (const daemonDie of runtimeDie.good.daemons) {
      const modes = daemonDie.good.flatmodes().filter((mode) => mode.implements("FRAUGHT"));
      if (!modes.length) continue;

      runtimeDie.good.aperture
        .branch("/attached/cargo")
        .branch(daemonDie.good.mount.nature)
        .use(shard.context.bind("daemon", daemonDie.good))
        .open("/(.*)", async (input, ctx) => {
          const query = fromm.params(ctx.params).path.absolute.replace(/^\//, "");
          for (const mode of modes) {
            const entry = mode.freight.resolve(query);
            if (!entry) continue;
            const filePath = mode.freight.path.branch("/" + entry.path).absolute;
            ctx.response.type = entry.type;
            return await Deno.readFile(filePath);
          }
          ctx.response.status = 404;
        });
    }
  }

  await attachProcesses(runtimeDie);
  await attachBundles(runtimeDie);
  await attachCargo(runtimeDie);
}

export async function expose(runtimeDie) {
  for (const daemonDie of runtimeDie.good.daemons) {
    const daemonBranch = runtimeDie.good.aperture.branch(daemonDie.good.mount.nature);
    daemonBranch.branch("/status").slurp(shard.nano.atom(daemonDie.status.$transient));
    daemonBranch
      .open("/manifest", () => daemonDie.manifest)
      .slurp(daemonDie.good.aperture)
      .open("/batch", shard.batch.route(daemonBranch));
  }
}

export async function metadata(runtimeDie) {
  const root = runtimeDie.good.aperture.branch("/metadata");

  root.open("/manifest", () => runtimeDie.manifest);
  root.open("/aperture", () => shape.strip(runtimeDie.good.aperture));

  root.open("/variant", () => ({
    daemons: paladin.variant.daemons.map((mask) => mask.manifest ?? mask),
    services: paladin.variant.services.map((mask) => mask.manifest ?? { module: mask.module }),
  }));

  root.open("/daemons", () =>
    runtimeDie.good.daemons.map((daemonDie) => ({
      slug: daemonDie.slug,
      mount: daemonDie.good.mount.nature,
      modes: daemonDie.good.flatmodes().length,
      metadata: `${daemonDie.good.mount.nature}/metadata`,
    })),
  );

  root.open("/services", () =>
    runtimeDie.good.processes.map((processDie) => ({
      type: processDie.type,
      slug: processDie.slug,
      mount: `/attached/process/${processDie.type}/${processDie.slug}`,
      metadata: `/attached/process/${processDie.type}/${processDie.slug}/metadata`,
    })),
  );
}
