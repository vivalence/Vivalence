import { Cake, Path, cast, as, is } from "@vivalence/typology";

// load circuits from tilde into variant.circuits
// paladin.find.viva(paladin.scope.variant)
// filter for manifest.type circuit

export async function circuits(paladin) {
  const mount = paladin.scope.tilde.branch("circuits").absolute;
  console.log("paladin mount circuits", { mount });
  const circuits = await paladin.find.viva(mount);
  const mapper = async (f) => [f, await paladin.read.viva(f)];
  const modules = await Promise.all(circuits.map((f) => mapper(f)));
  paladin.variant.circuits = modules
    .filter(([, module]) => module?.manifest?.type === "circuit")
    .map(([source, circuit]) => ({ ...circuit, source }));
}

export async function variant(paladin) {
  const circuits = paladin.variant.circuits;

  const gaiaConfigs = circuits.map((c) => c.gaia).filter(Boolean);
  // const lighthouseConfigs = circuits.map((c) => c.lighthouse).filter(Boolean);
  const clientsConfigs = circuits.map((c) => c.clients).filter(Boolean);
  const daemonsConfigs = circuits.flatMap((c) => c.daemons || []);
  const servicesConfigs = circuits.flatMap((c) => c.services || []);

  if (gaiaConfigs.length > 1) {
    // same for lighthouse
    throw new Error("Multiple gaia configurations found in circuits");
  }

  paladin.variant.gaia = gaiaConfigs[0] || {};
  // paladin.variant.lighthouse = lighthouseConfigs[0] || {};
  // paladin.variant.gaia.mount =  ??

  paladin.variant.clients = Object.assign({}, ...clientsConfigs);

  paladin.variant.daemons = daemonsConfigs.map((daemon) => {
    const cake = new Cake(daemon);
    cake.mount = paladin.join.mountpoint.daemon(cake.slug);
    return cake;
  });

  paladin.variant.services = servicesConfigs.map((service) => {
    const cake = new Cake(service);
    cake.mount = paladin.join.mountpoint.service(cake.slug);
    return cake;
  });
}

export async function dependencies(paladin) {
  for (const daemon of paladin.variant.daemons) {
    if (daemon.consume) {
      for (const [serviceSlug, serviceConfig] of Object.entries(
        daemon.consume,
      )) {
        const serviceProvider = paladin.variant.services.find(
          (s) => s.slug === serviceSlug,
        );
        if (serviceProvider) {
          daemon.consume[serviceSlug] = {
            ...serviceConfig,
            provider: serviceProvider,
          };
        }
      }
    }
  }
}

export async function mounts(paladin) {
  const allMounts = [
    paladin.variant.gaia.mount,
    ...paladin.variant.daemons.map((d) => d.mount),
    ...paladin.variant.services.map((s) => s.mount),
  ].filter(Boolean);

  for (const mount of allMounts) {
    // console.log("@testable mount:", { ...mount }, mount.absolute);
    await paladin.state.dir(mount.absolute);
  }

  // console.log({ paladin });
}

// export async function cross(paladin) {
//   console.log({ paladin: { ...paladin.variant } });

//   const requiredServices = [];
//   for (const daemon of paladin.variant.daemons) {
//     if (daemon.consume) {
//       requiredServices.push(...Object.keys(daemon.consume));
//     }
//   }

//   const availableServices = paladin.variant.services.map((s) => s.slug);
//   const missingServices = requiredServices.filter(
//     (s) => !availableServices.includes(s),
//   );

//   console.log();

//   if (missingServices.length > 0) {
//     throw new Error(`Missing required services: ${missingServices.join(", ")}`);
//   }

//   if (paladin.variant.gaia && !paladin.variant.gaia.statics?.serve) {
//     console.warn("Gaia configuration missing serve URL");
//   }
// }

// gaia, clients, daemons, services,
// there is a lot to be done here now.
//

// OLD
// export async function variant(paladin) {
//   // find all .viva.js files in tilde/variant/
//   // filter for circuits
//   // compile variant from circuits
//   // old:
//   // const file = paladin.join.tilde("variant/variant.viva.js");
//   // const module = await paladin.read.module(file);
//   // const { statics, manifest, lighthouse, daemon, clients, services } = module;
//   // if (manifest) {
//   //   paladin.variant = manifest.slug;
//   //   paladin.traits = manifest.traits || [];
//   // }
//   // if (statics) paladin.statics = statics;
//   // if (lighthouse) paladin.lighthouse = lighthouse;
//   // if (daemon) paladin.daemon = daemon;
//   // if (clients) {clients.map((client) => {paladin.clients.push(client);});}
//   // services?.forEach((serviceconfig) => {paladin.services.push(paladin.bake.service(new Cake(serviceconfig)));});
// }

// export async function runtimes(paladin) {
//   const runtimes = await loadRuntimes(paladin);
//   runtimes.forEach((runtimeconfig) => {
//     paladin.runtimes.push(paladin.bake.runtime(new Cake(runtimeconfig)));
//   });
// }

// async function loadRuntimes(paladin) {
//   const files = (await paladin.find.viva(paladin.join.variant.runtimes())) //
//     .map(async (file) => [file, await paladin.read.viva(file)]);
//   return (await Promise.all(files))
//     .filter(([, module]) => is.module(module)) // is runtime // cast?
//     .map(([source, runtime]) => ({ ...runtime, source }));
// }

// // function createRuntimeCake(file, module, paladin) {const runtimecake = new Cake(cast.runtime(module)); runtimecake.source = file; runtimecake.mount = paladin.join.mountpoint.runtime(runtimecake.slug); return runtimecake;}

// // export async function runtimes(paladin) {
// //   const modules = (
// //     await Promise.all(
// //       (await paladin.find.viva(paladin.join.variant.runtimes())) //
// //         .map(async (file) => [file, await paladin.read.viva(file)]),
// //     )
// //   ).filter(([, module]) => is.module(module));

// //   console.log({ paladin, modules });
// //   for (const [file, module] of modules) {
// //     const runtimecake = new Cake(cast.runtime(module));
// //     console.log("pre", { runtimecake });
// //     runtimecake.source = file;
// //     runtimecake.mount = paladin.join.mountpoint.runtime(runtimecake.slug);

// //     if (runtimecake.services) {
// //       runtimecake.services = runtimecake.services //
// //         .map((servicecake) => {
// //           const service = new Cake({
// //             remote: paladin.services.find(
// //               (service) =>
// //                 service.slug === servicecake.service ||
// //                 service.slug === servicecake.slug,
// //             ),
// //             ...servicecake,
// //             runtime: runtimecake.slug,
// //             mount: paladin.join.mountpoint.service(
// //               servicecake.slug,
// //               runtimecake.slug,
// //             ),
// //             // url: new Url(`/runtime/${slug}`, new URL("http://localhost")),
// //             // path: new Path(`/runtime/${slug}`),
// //           });
// //           paladin.services.push(service);
// //           return service;
// //         });
// //     }

// //     if (!runtimecake.lighthouse) {
// //       const lighthouse =
// //         runtimecake.services.find((s) => s.slug === "lighthouse") ||
// //         paladin.services.find((s) => s.slug === "lighthouse");
// //       if (!lighthouse) throw new Error("no lighthouse");
// //       runtimecake.lighthouse = {
// //         ...lighthouse,
// //         runtime: runtimecake.slug,
// //       };
// //     }

// //     if (!runtimecake.datamap) {
// //       const datamap =
// //         runtimecake.services.find((s) => s.slug === "datamap") ||
// //         paladin.services.find((s) => s.slug === "datamap");
// //       if (!datamap) throw new Error("no datamap");
// //       runtimecake.datamap = {
// //         ...datamap,
// //         runtime: runtimecake.slug,
// //         mount: paladin.join.mountpoint.service("datamap", runtimecake.slug),
// //       };
// //     }

// //     console.log("post", { runtimecake });
// //     paladin.runtimes.push(runtimecake);
// //   }
// // }
