import paladin from "@vivalence/paladin";

import { Aperture } from "@vivalence/vector/aperture";
import { Status } from "@vivalence/typology";

export async function aperture(gaia) {
  gaia.aperture.open("/status", (body, ctx) => gaia.status.reflection);
}
export async function patrol(gaia) {
  console.log(`gaia`, gaia, { ...paladin });

  if (paladin.variant.lighthouse) {
    // check if gaia.terrans contains lighthouse.
    // if no lighthouse, cast a service die for lighthouse
    // and xxx
  }
  // clients
  // daemons
  // services
}

// // populate is for tools, maps and repositories
// import paladin from "@vivalence/paladin";
// import { Url, Path, Module } from "@vivalence/typology";
// // import * as lifecycle from "../runtime/index.js";

// // export async function services(daemon) {
// // for (const service of paladin.services) {
// //     const prototype = await daemon.registry.load(service.module);
// //     const service = new Service(service).withPrototype(prototype);
// // daemon.services.push(rme);
// // }
// // }

// // export async function attachments(daemon) {
// //   for (const att of daemon.attachments) {
// // const sme = {
// //   slug: service.manifest.slug,
// //   status: new Status(),
// //   connection: new Connection(),
// //   path: new Path(`/runtime/${service.manifest.slug}`),
// //   url: new URL(`/runtime/${service.manifest.slug}`, daemon.paladin.url),
// //   instance: new lifecycle.Runtime(service),
// //   config: service,
// //   register: await daemon.registry.loadMap(service.services),
// // };
// // rme.instance.attached = new URL(`/attached/runtime/${rme.slug}`, daemon.paladin.url,);
// //   }
// // }

// later
// export async function pup(gaia) {
//   gaia.pup = {
//     patrol: async function patrol() {
//       if(paladin.variant.lighthouse) {
// 	// check if gaia.terrans contains lighthouse.
// 	// if no lighthouse, cast a service die for lighthouse
// 	// and
//       }
//     },
//   };
// }
