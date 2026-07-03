import paladin from "@vivalence/paladin";
import { fromm, shard, Url, Connection, shape } from "@vivalence/typology";

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
  async function attachDaemons(runtimeDie) {
    for (const daemonDie of runtimeDie.good.daemons) {
      for (const mode of daemonDie.good.flatmodes()) {
        if (!mode.implements("APPLICATION")) continue;
        runtimeDie.good.aperture //
          .branch("/attached/view")
          .branch(mode.mount.absolute)
          .use(shard.context.attach("mode", mode))
          .open("/status", () => ({ status: "success" }))
          .open("/(.*)", async (input, ctx) => {
            if (paladin.is.dev) await ctx.mode.module.app.bundle.compile();
            ctx.response.type = "application/javascript";
            return ctx.mode.module.app.bundle.serve(fromm.params(ctx.params).path).text;
          });
      }
      // for (const mode of daemonDie.good.flatmodes()) {
      //   if (!mode.implements("APPLICATION")) continue;
      //   runtimeDie.good.aperture.branch("/attached/view").branch(mode.mount.absolute)
      //     .use(shard.context.attach("mode", mode))
      //     .open("/(.*)", async (input, ctx) => {
      //       if (paladin.is.dev) await ctx.mode.app.bundle();
      //       ctx.response.type = "application/javascript";
      //       return ctx.mode.app.serve(fromm.params(ctx.params).path).text;
      //     });
      // }
    }
  }

  async function attachCargo(runtimeDie) {
    for (const daemonDie of runtimeDie.good.daemons) {
      const modes = daemonDie.good.flatmodes().filter((m) => m.implements("FRAUGHT"));
      if (!modes.length) continue;

      runtimeDie.good.aperture
        .branch("/attached/cargo")
        .branch(daemonDie.good.mount.nature)
        .use(shard.context.attach("daemon", daemonDie.good))
        .open("/(.*)", async (input, ctx) => {
          const query = fromm.params(ctx.params).path.absolute.replace(/^\//, "");
          for (const mode of modes) {
            const entry = mode.module.freight.resolve(query);
            if (!entry) continue;
            const filePath = mode.module.freight.path.branch("/" + entry.path).absolute;
            ctx.response.type = entry.type;
            return await Deno.readFile(filePath);
          }
          ctx.response.status = 404;
        });
    }
  }

  await attachProcesses(runtimeDie);
  await attachDaemons(runtimeDie);
  await attachCargo(runtimeDie);
}

export async function expose(runtimeDie) {
  for (const daemonDie of runtimeDie.good.daemons) {
    const daemonBranch = runtimeDie.good.aperture.branch(daemonDie.good.mount.nature);
    daemonBranch
      .open("/status", () => daemonDie.status.reflection)
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

// export async function compose(runtimeDie) {
// const handler = shape.http(runtimeDie.good.aperture);
// runtimeDie.good.handler = shard.cors.wrap(handler);
// }

// export async function attach(runtimeDie) {
//   for (const daemonDie of runtimeDie.good.daemons) {
//     runtimeDie.good.aperture
//       // .branch(`/daemon/${daemonDie.slug}`)
//       .branch(daemonDie.mount.nature)
//       .use(shard.context.attach("daemon", daemonDie.good))
//       .open("/status", () => daemonDie.status.reflection)
//       .open("/manifest", () => daemonDie.manifest)
//       .descendants.push(daemonDie.good.aperture);

//     // console.log(daemonDie.mount.nature);
//     // console.log(`/attached${daemonDie.mount.nature}/mode/:type/:slug`);

//     // console.log(daemonDie.good.modes);

//     runtimeDie.good.aperture //
//       .branch(`/attached/view`)
//       .branch(daemonDie.mount.nature)
//       .use(shard.context.attach("daemon", daemonDie.good))
//       // .use(async (ctx, next) => {
//       //   console.log("ctx.daemon", ctx.daemon);
//       // })
//       .branch(`/mode/:type/:slug`)
//       .use(async (ctx, next) => {
//         console.log({ ctx });
//         console.log("request", ctx.request);
//         console.log("params", ctx.params);
//         // console.log("daemon", ctx.daemon);
//         console.log("flatmodes", ctx.daemon.flatmodes());
//         const { type, slug } = ctx.params;
//         console.log("{type,slug}", { type, slug });
//         //  if (!type|| !slug) throw
//         const mode = ctx.daemon?.good?.modes?.[type]?.[slug];
//         console.log({ type, slug, mode });
//         if (!mode) throw new Error(`Mode not found: ${type}/${slug}`);
//         ctx.mode = mode;
//         await next();
//       })
//       .open("/status", () => ({ status: "success" }))
//       .open("/view/(.*)", async (input, ctx) => {
//         console.log("view");
//         console.log({ input, params: ctx.params });
//         console.log("view");
//         console.log("view");
//         console.log({ ctx });
//         //
//         ctx.response.type = "application/javascript";
//         if (paladin.is.dev) await ctx.mode.app.bundle();
//         const path = as.path.params(ctx.params);
//         console.log("@daemon/resolve ATTACHED", { path, params: ctx.params });
//         return ctx.mode.app.serve(path).text;
//       });
//   }

//   for (const processDie of runtimeDie.good.processes) {
//     processDie.good
//       .open("/status", () => processDie.status.reflection)
//       .open("/manifest", () => processDie.manifest);

//     runtimeDie.good.aperture
//       // processdie.mount.nature
//       .branch(`/attached/process/${processDie.type}/${processDie.slug}`)
//       .use(shard.context.attach(processDie.type, processDie.mask))
//       .descendants.push(processDie.good);
//   }
// }

// import paladin from "@vivalence/paladin";
// import { shards } from "@vivalence/vector";
// import { maps } from "@vivalence/entities";
// import { Runtime, Die, Path, Url, is, as } from "@vivalence/typology";

// await daemonDie.populate();
// await processDie.populate();

//   mode.instance.attached = new Url(
//     `/attached/runtime/${mode.slug}`,
//     paladin.daemon.statics.serve,
//   );

// export async function attachments(daemon) {
// }
