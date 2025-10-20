import paladin from "@vivalence/paladin";
// import { shards } from "@vivalence/vector";
// import { maps } from "@vivalence/entities";
// import { Runtime, Die, Path, Url, is, as } from "@vivalence/typology";

export async function castRuntimeDies(daemon) {
  // for (const cake of paladin.runtimes) {
  //   daemon.runtimes.push(new Die({ cake, good: new Runtime(cake) }));
  // }
}
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

//     const attachables = [[rme.config.lighthouse, rme.register.lighthouse]];

//     for (const attachable of attachables) {
//       const { slug, type } = attachable[1].manifest;

//       await attachable[1].server(
//         attachable[0],
//         attached
//           .branch(`/${type}/${slug}`)
//           .use(shards.context.attach(type, attachable[0])),
//       );
//     }
//   }
// }

export async function diceRuntimes(daemon) {
  //
}
