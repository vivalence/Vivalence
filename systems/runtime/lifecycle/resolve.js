import paladin from "@vivalence/paladin";
import { mw } from "@vivalence/vector/aperture";
import { shards, Url, Connection } from "@vivalence/typology";

export async function attach(die) {
  for (const daemonDie of die.good.daemons) {
    die.good.aperture
      // .branch(`/daemon/${daemonDie.slug}`)
      .branch(daemonDie.mount.nature)
      .use(shards.context.attach("daemon", daemonDie.good))
      .open("/status", () => daemonDie.status.reflection)
      .open("/manifest", () => daemonDie.manifest)
      .descendants.push(daemonDie.good.aperture);
  }

  for (const processDie of die.good.processes) {
    processDie.good
      .open("/status", () => processDie.status.reflection)
      .open("/manifest", () => processDie.manifest);

    die.good.aperture
      // processdie.mount.nature
      .branch(`/attached/process/${processDie.type}/${processDie.slug}`)
      .use(shards.context.attach(processDie.type, processDie.mask))
      .descendants.push(processDie.good);
  }
}

export async function compose(die) {
  die.server.use(mw.cors).use(mw.notFound);
  die.server.use(die.good.aperture.compose(true));
}

export async function watchdog(die) {
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

export async function launch(die) {
  const url = paladin.variant.runtime?.statics?.serve;
  console.log(`launching on ${url.absolute}`);
  if (!url) {
    console.warn("No runtime serve URL configured");
    return;
  }

  die.server.addEventListener("listen", ({ hostname, port, ...rest }) => {
    console.log(`listening on ${hostname}:${port}`);
  });

  die.listening = die.server.listen({
    port: url.port,
    hostname: url.hostname,
    signal: die.abort.signal,
  });

  die.status.set({ code: "RUNNING", label: url.absolute });
}

// import paladin from "@vivalence/paladin";
// import { shards } from "@vivalence/vector";
// import { maps } from "@vivalence/entities";
// import { Runtime, Die, Path, Url, is, as } from "@vivalence/typology";

// await daemonDie.populate();
// await processDie.populate();

//   rme.instance.attached = new Url(
//     `/attached/runtime/${rme.slug}`,
//     paladin.daemon.statics.serve,
//   );

// export async function attachments(daemon) {
//   for (const rme of daemon.runtimes) {
//     const attached = daemon.aperture.branch(`/attached/runtime/${rme.slug}`);
//     attached
//       .use(shards.context.attach("runtime", rme.instance))
//       .branch("/module/:type/:slug")
//       .open("/bundle/(.*)", async (input, ctx) => {
//         const { type, slug } = ctx.params;
//         const module = ctx.runtime.module[type]?.[slug];
//         ctx.response.type = "application/javascript";
//         if (paladin.is.dev) await module?.view?.bundle();
//         const path = as.path.params(ctx.params);
//         console.log("@daemon/resolve ATTACHED", { path, params: ctx.params });
//         return module?.view?.serve(path)?.text;
//       });
//     }
//   }
// }
