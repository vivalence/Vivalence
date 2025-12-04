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
