import { Cake, Path, cast, as, is } from "@vivalence/typology";

export async function variant(paladin) {
  // console.log(0);
  const file = paladin.join.tilde("variant/variant.viva.js");
  // console.log(0, file);

  const module = await paladin.read.module(file);
  const { statics, manifest, gaia, daemon, clients, services } = module;

  // TODO derive serve & remote!
  // TODO cast/is

  if (manifest) {
    paladin.variant = manifest.slug;
    paladin.traits = manifest.traits || [];
  }

  if (statics) paladin.statics = statics;
  if (gaia) paladin.gaia = gaia;
  if (daemon) paladin.daemon = daemon;

  if (clients) {
    clients.map((client) => {
      paladin.clients.push(client);
    });
  }

  services?.forEach((serviceconfig) => {
    paladin.services.push(paladin.bake.service(new Cake(serviceconfig)));
  });
}

export async function runtimes(paladin) {
  const runtimes = await loadRuntimes(paladin);
  runtimes.forEach((runtimeconfig) => {
    paladin.runtimes.push(paladin.bake.runtime(new Cake(runtimeconfig)));
  });
}

async function loadRuntimes(paladin) {
  const files = await paladin.find.viva(paladin.join.variant.runtimes());
  return (
    await Promise.all(
      files.map(async (file) => [file, await paladin.read.viva(file)]),
    )
  )
    .filter(([, module]) => is.module(module)) // is runtime // cast?
    .map(([source, runtime]) => ({ ...runtime, source }));
}

// function createRuntimeCake(file, module, paladin) {const runtimecake = new Cake(cast.runtime(module)); runtimecake.source = file; runtimecake.mount = paladin.join.mountpoint.runtime(runtimecake.slug); return runtimecake;}

// export async function runtimes(paladin) {
//   const modules = (
//     await Promise.all(
//       (await paladin.find.viva(paladin.join.variant.runtimes())) //
//         .map(async (file) => [file, await paladin.read.viva(file)]),
//     )
//   ).filter(([, module]) => is.module(module));

//   console.log({ paladin, modules });
//   for (const [file, module] of modules) {
//     const runtimecake = new Cake(cast.runtime(module));
//     console.log("pre", { runtimecake });
//     runtimecake.source = file;
//     runtimecake.mount = paladin.join.mountpoint.runtime(runtimecake.slug);

//     if (runtimecake.services) {
//       runtimecake.services = runtimecake.services //
//         .map((servicecake) => {
//           const service = new Cake({
//             remote: paladin.services.find(
//               (service) =>
//                 service.slug === servicecake.service ||
//                 service.slug === servicecake.slug,
//             ),
//             ...servicecake,
//             runtime: runtimecake.slug,
//             mount: paladin.join.mountpoint.service(
//               servicecake.slug,
//               runtimecake.slug,
//             ),
//             // url: new Url(`/runtime/${slug}`, new URL("http://localhost")),
//             // path: new Path(`/runtime/${slug}`),
//           });
//           paladin.services.push(service);
//           return service;
//         });
//     }

//     if (!runtimecake.gaia) {
//       const gaia =
//         runtimecake.services.find((s) => s.slug === "gaia") ||
//         paladin.services.find((s) => s.slug === "gaia");
//       if (!gaia) throw new Error("no gaia");
//       runtimecake.gaia = {
//         ...gaia,
//         runtime: runtimecake.slug,
//       };
//     }

//     if (!runtimecake.datamap) {
//       const datamap =
//         runtimecake.services.find((s) => s.slug === "datamap") ||
//         paladin.services.find((s) => s.slug === "datamap");
//       if (!datamap) throw new Error("no datamap");
//       runtimecake.datamap = {
//         ...datamap,
//         runtime: runtimecake.slug,
//         mount: paladin.join.mountpoint.service("datamap", runtimecake.slug),
//       };
//     }

//     console.log("post", { runtimecake });
//     paladin.runtimes.push(runtimecake);
//   }
// }
