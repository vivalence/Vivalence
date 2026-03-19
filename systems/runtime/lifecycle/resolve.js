import paladin from "@vivalence/paladin";
import { fromm, shards, Url, Connection, compiler } from "@vivalence/typology";

export async function attach(runtimeDie) {
  async function attachProcesses(runtimeDie) {
    for (const processDie of runtimeDie.good.processes) {
      processDie.good
        .open("/status", () => processDie.status.reflection)
        .open("/manifest", () => processDie.manifest);

      runtimeDie.good.aperture
        // processdie.mount.nature
        .branch(`/attached/process/${processDie.type}/${processDie.slug}`)
        .use(shards.context.attach(processDie.type, processDie.mask))
        .slurp(processDie.good);
    }
  }
  async function attachDaemons(runtimeDie) {
    for (const daemonDie of runtimeDie.good.daemons) {
      for (const mode of daemonDie.good.flatmodes()) {
        if (!mode.implements("VIEWABLE")) continue;
        runtimeDie.good.aperture //
          .branch("/attached/view")
          .branch(mode.mount.absolute)
          .use(shards.context.attach("mode", mode))
          .open("/status", () => ({ status: "success" }))
          .open("/(.*)", async (input, ctx) => {
            // console.log("paladin.is.dev", paladin.is.dev, ctx.mode.view);
            if (paladin.is.dev) await ctx.mode.view.bundle();
            ctx.response.type = "application/javascript";
            return ctx.mode.view.serve(fromm.params(ctx.params).path).text;
          });
      }
    }
  }

  async function attachFreight(runtimeDie) {
    for (const daemonDie of runtimeDie.good.daemons) {
      for (const mode of daemonDie.good.flatmodes()) {
        if (!mode.implements("FRAUGHT")) continue;
        runtimeDie.good.aperture
          .branch("/attached/freight")
          .branch(mode.mount.absolute)
          .use(shards.context.attach("mode", mode))
          .open("/(.*)", async (input, ctx) => {
            const captured = fromm.params(ctx.params).path;
            const query = captured.nature.replace(/^\//, "");
            const entry = ctx.mode.cake.freight.resolve(query);
            if (!entry) {
              ctx.response.status = 404;
              return;
            }
            const filePath = ctx.mode.cake.freight.path
              .branch("/" + entry.path).absolute;
            ctx.response.type = entry.type;
            return await Deno.readFile(filePath);
          });
      }
    }
  }

  await attachProcesses(runtimeDie);
  await attachDaemons(runtimeDie);
  await attachFreight(runtimeDie);
}

export async function expose(runtimeDie) {
  for (const daemonDie of runtimeDie.good.daemons) {
    runtimeDie.good.aperture
      .branch(daemonDie.good.mount.nature) // .branch(`/daemon/${daemonDie.slug}`)
      .open("/status", () => daemonDie.status.reflection)
      .open("/manifest", () => daemonDie.manifest)
      .slurp(daemonDie.good.aperture);
  }
}

export async function compose(runtimeDie) {
  const handler = compiler.http(runtimeDie.good.aperture);
  runtimeDie.good.handler = shards.cors.wrap(handler);
}

export async function wake(die) {
  die.good.ters = {
    async patrol() {
      for (const terran of die.good.terrans) {
        if (terran.status.is("ERROR")) {
          console.warn(`Terran unhealthy`, terran.slug);
        }
      }
      console.log(`$[runtime:${paladin.variant.runtime?.slug}]`, die.status);
    },
  };
}

export async function launch(runtimeDie) {
  const url = paladin.variant.runtime?.statics?.serve;
  if (!url) {
    console.warn("No runtime serve URL configured");
    return;
  }

  console.log(`launching on ${url.absolute}`);

  runtimeDie.good.server = Deno.serve({
    port: Number(url.port),
    hostname: url.hostname,
    signal: runtimeDie.abort.signal,
    onListen({ hostname, port }) {
      console.log(`listening on ${hostname}:${port}`);
    },
  }, runtimeDie.good.handler);

  runtimeDie.status.set({ code: "RUNNING", label: url.absolute });
}

// export async function attach(runtimeDie) {
//   for (const daemonDie of runtimeDie.good.daemons) {
//     runtimeDie.good.aperture
//       // .branch(`/daemon/${daemonDie.slug}`)
//       .branch(daemonDie.mount.nature)
//       .use(shards.context.attach("daemon", daemonDie.good))
//       .open("/status", () => daemonDie.status.reflection)
//       .open("/manifest", () => daemonDie.manifest)
//       .descendants.push(daemonDie.good.aperture);

//     // console.log(daemonDie.mount.nature);
//     // console.log(`/attached${daemonDie.mount.nature}/mode/:type/:slug`);

//     // console.log(daemonDie.good.modes);

//     runtimeDie.good.aperture //
//       .branch(`/attached/view`)
//       .branch(daemonDie.mount.nature)
//       .use(shards.context.attach("daemon", daemonDie.good))
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
//         if (paladin.is.dev) await ctx.mode.view.bundle();
//         const path = as.path.params(ctx.params);
//         console.log("@daemon/resolve ATTACHED", { path, params: ctx.params });
//         return ctx.mode.view.serve(path).text;
//       });
//   }

//   for (const processDie of runtimeDie.good.processes) {
//     processDie.good
//       .open("/status", () => processDie.status.reflection)
//       .open("/manifest", () => processDie.manifest);

//     runtimeDie.good.aperture
//       // processdie.mount.nature
//       .branch(`/attached/process/${processDie.type}/${processDie.slug}`)
//       .use(shards.context.attach(processDie.type, processDie.mask))
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
