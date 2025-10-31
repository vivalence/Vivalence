// import config from "@vivalence/paladin";
// import { secure, is } from "@vivalence/shared";
// import { context, mw as mwa } from "@vivalence/vector/aperture";
// import { compiler, controller } from "@vivalence/vector";
// import { Call } from "@vivalence/typology";
// import { Application } from "oak";

// import * as lifecycle from "../runtime/index.js";

// export async function attach(daemon) {
//   for (const rme of daemon.runtimes) {
//     daemon.aperture
//       .branch(rme.url.pathname)
//       .use(secure.context(rme.instance.lighthouse))
//       .use(secure.authorize())
//       .descendants.push(rme.instance.aperture);
//   }
// }

// export async function runtimes(daemon) {
//   for (const rme of daemon.runtimes) {
//     for (const integrate of Object.values(lifecycle.integrate)) {
//       await integrate(rme, daemon);
//     }
//     // checks
//   }
// }

// export async function serve(daemon) {
//   const app = new Application();
//   app.use(mwa.notFound);
//   app.use(mwa.cors);
//   app.use(daemon.aperture.compose(true));

//   app.addEventListener("listen", ({ hostname, port, serverType }) => {
//     console.log(`${"listening on :"}${`${port}`}`);
//   });

//   daemon.server = app.listen({
//     hostname: paladin.gaia.static.serve, // daemon.config.serve.host,
//     port: parseInt(daemon.config.serve.port),
//   });
// }

// export async function announce(daemon) {
//   const call = new Call(config.lighthouse.url);
//   for (const rme of daemon.runtimes) {
//     call("/entities/runtime/expect", {
//       where: { slug: rme.slug, url: rme.url.toString() },
//     });
//   }
// }
