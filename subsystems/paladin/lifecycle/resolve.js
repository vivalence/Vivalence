import { Url, Mask, Path, cast, fromm, as, is } from "@vivalence/typology";

// load circuitry from tilde into variant.circuitry
// paladin.find.viva(paladin.scope.variant)
// filter for manifest.type circuit

export async function circuitry(paladin) {
  // console.log(paladin.env);
  // console.log(paladin.scope.circuitry);
  if (!paladin.scope.circuitry) return;
  await paladin.state.dir(paladin.scope.circuitry.absolute);
  // console.log("stated:", paladin.scope.circuitry.absolute);
  // unnessesarily complex
  const modules = await paladin.find.viva(paladin.scope.circuitry);
  // console.log("found modules:", { modules });
  const fn = async (f) => [f, await paladin.read.viva(f)];
  const circuitry = (await Promise.all(modules.map((f) => fn(f))))
    .filter(([, module]) => module?.manifest?.type === "circuit")
    .map(([source, circuit]) => ({ ...circuit, source }));
  // paladin.variant.circuitry(circuit =>(circuit))
  // console.log("found circuitry:", { circuitry });
  paladin.variant.circuitry = circuitry;
}

export async function variant(paladin) {
  const circuitry = paladin.variant.circuitry;
  // not good for figuring out what part of the config belongs together! @change: process sequentually.
  const runtimeConfigs = circuitry.map((c) => c.runtime).filter(Boolean);
  // const lighthouseConfigs = circuitry.map((c) => c.lighthouse).filter(Boolean);
  const clientsConfigs = circuitry.map((c) => c.clients).filter(Boolean);
  const daemonsConfigs = circuitry.flatMap((c) => c.daemons || []);
  const servicesConfigs = circuitry.flatMap((c) => c.services || []);

  // console.log("clients:", { clientsConfigs });

  if (runtimeConfigs.length > 1) {
    // same for lighthouse
    throw new Error("Multiple runtime configurations found in circuitry");
  }

  paladin.variant.runtime = runtimeConfigs[0] || {};
  // paladin.variant.lighthouse = lighthouseConfigs[0] || {};
  // paladin.variant.runtime.mount =  ??

  paladin.variant.clients = Object.assign({}, ...clientsConfigs);

  // console.log("clients:", { ...paladin.variant.clients });
  // if role = client & !clients[*]; then check if env client; then resolve
  // if (paladin.is.client) {if (is.empty(paladin.variant.clients) && paladin.env.has("VIVA_CLIENT_HTML_SERVE")) {paladin.variant.clients.html = {statics: {serve: new Url(paladin.env.get("VIVA_CLIENT_HTML_SERVE")),},};} if (paladin.env.has("PUBLIC_VIVA_LIGHTHOUSE_REMOTE")) {paladin.variant.clients.html.statics.lighthouse = {remote: new Url(paladin.env.get("PUBLIC_VIVA_LIGHTHOUSE_REMOTE")),};} if (paladin.env.has("PUBLIC_VIVA_CLIENT_HTML_REMOTE")) {paladin.variant.clients.html.statics.remote = new Url(paladin.env.get("PUBLIC_VIVA_CLIENT_HTML_REMOTE"),);}}

  paladin.variant.daemons = daemonsConfigs.map((daemon) => {
    const mask = new Mask(daemon);
    mask.mount = paladin.join.mountpoint.daemon(mask.slug);
    return mask;
  });

  paladin.variant.services = servicesConfigs.map((service) => {
    const mask = new Mask(service);
    mask.mount = paladin.join.mountpoint.service(mask.slug);
    if (mask.datamap && !mask.datamap.mount) mask.datamap.mount = mask.mount;
    return mask;
  });
}

export async function consumables(paladin) {
  for (const daemon of paladin.variant.daemons) {
    if (!daemon.consume) continue;
    for (const service of fromm.slugmap(daemon.consume).array) {
      let f;
      if (is.string(service.provider)) f = (s) => s.slug === service.provider;

      const provider = paladin.variant.services.find(f);
      if (provider) {
        service.provide = provider;
        service.mount = service.provider.mount;
        daemon.consume[service.slug] = service;
        continue;
      }

      console.warn("[@paladin] resolution issue: service provider not found");
      console.log({ service });
    }
  }
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

//   if (paladin.variant.runtime && !paladin.variant.runtime.statics?.serve) {
//     console.warn("Runtime configuration missing serve URL");
//   }
// }

// runtime, clients, daemons, services,
// there is a lot to be done here now.
//

// OLD
// export async function variant(paladin) {
//   // find all .viva.js files in tilde/variant/
//   // filter for circuitry
//   // compile variant from circuitry
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
//   // services?.forEach((serviceconfig) => {paladin.services.push(paladin.bake.service(new Mask(serviceconfig)));});
// }

// export async function runtimes(paladin) {
//   const runtimes = await loadRuntimes(paladin);
//   runtimes.forEach((runtimeconfig) => {
//     paladin.runtimes.push(paladin.bake.runtime(new Mask(runtimeconfig)));
//   });
// }

// async function loadRuntimes(paladin) {
//   const files = (await paladin.find.viva(paladin.join.variant.runtimes())) //
//     .map(async (file) => [file, await paladin.read.viva(file)]);
//   return (await Promise.all(files))
//     .filter(([, module]) => is.module(module)) // is runtime // cast?
//     .map(([source, runtime]) => ({ ...runtime, source }));
// }

// // function createRuntimeMask(file, module, paladin) {const runtimemask = new Mask(cast.runtime(module)); runtimemask.source = file; runtimemask.mount = paladin.join.mountpoint.runtime(runtimemask.slug); return runtimemask;}

// // export async function runtimes(paladin) {
// //   const modules = (
// //     await Promise.all(
// //       (await paladin.find.viva(paladin.join.variant.runtimes())) //
// //         .map(async (file) => [file, await paladin.read.viva(file)]),
// //     )
// //   ).filter(([, module]) => is.module(module));

// //   console.log({ paladin, modules });
// //   for (const [file, module] of modules) {
// //     const runtimemask = new Mask(cast.runtime(module));
// //     console.log("pre", { runtimemask });
// //     runtimemask.source = file;
// //     runtimemask.mount = paladin.join.mountpoint.runtime(runtimemask.slug);

// //     if (runtimemask.services) {
// //       runtimemask.services = runtimemask.services //
// //         .map((servicemask) => {
// //           const service = new Mask({
// //             remote: paladin.services.find(
// //               (service) =>
// //                 service.slug === servicemask.service ||
// //                 service.slug === servicemask.slug,
// //             ),
// //             ...servicemask,
// //             runtime: runtimemask.slug,
// //             mount: paladin.join.mountpoint.service(
// //               servicemask.slug,
// //               runtimemask.slug,
// //             ),
// //             // url: new Url(`/runtime/${slug}`, new URL("http://localhost")),
// //             // path: new Path(`/runtime/${slug}`),
// //           });
// //           paladin.services.push(service);
// //           return service;
// //         });
// //     }

// //     if (!runtimemask.lighthouse) {
// //       const lighthouse =
// //         runtimemask.services.find((s) => s.slug === "lighthouse") ||
// //         paladin.services.find((s) => s.slug === "lighthouse");
// //       if (!lighthouse) throw new Error("no lighthouse");
// //       runtimemask.lighthouse = {
// //         ...lighthouse,
// //         runtime: runtimemask.slug,
// //       };
// //     }

// //     if (!runtimemask.datamap) {
// //       const datamap =
// //         runtimemask.services.find((s) => s.slug === "datamap") ||
// //         paladin.services.find((s) => s.slug === "datamap");
// //       if (!datamap) throw new Error("no datamap");
// //       runtimemask.datamap = {
// //         ...datamap,
// //         runtime: runtimemask.slug,
// //         mount: paladin.join.mountpoint.service("datamap", runtimemask.slug),
// //       };
// //     }

// //     console.log("post", { runtimemask });
// //     paladin.runtimes.push(runtimemask);
// //   }
// // }
