import { Cake, Path, cast, is } from "@vivalence/typology";

// move back to lifecycle
export default function bake(paladin) {
  paladin.bake = {};

  paladin.bake.service = (servicecake) => {
    if (!servicecake.mount)
      servicecake.mount = paladin.join.mountpoint.service(servicecake.slug);
    return servicecake;
  };

  paladin.bake.runtime = (runtimecake) => {
    runtimecake.mount = paladin.join.mountpoint.runtime(runtimecake.slug);

    if (!runtimecake.gaia) {
      let gaiaservicecake =
        runtimecake.services?.find((s) => s.slug === "gaia") ||
        paladin.services.find((s) => s.slug === "gaia");
      if (gaiaservicecake) {
        runtimecake.gaia = new Cake({
          ...gaiaservicecake,
          runtime: runtimecake.slug,
          mount: paladin.join.mountpoint.service("gaia", runtimecake.slug),
        });
      }
    }
    if (!runtimecake.datamap) {
      let datamapservicecake =
        runtimecake.services?.find((s) => s.slug === "datamap") ||
        paladin.services.find((s) => s.slug === "datamap");

      if (datamapservicecake) {
        runtimecake.datamap = new Cake({
          ...datamapservicecake,
          runtime: runtimecake.slug,
          mount: paladin.join.mountpoint.service("datamap", runtimecake.slug),
        });
      }
    }

    if (runtimecake.services) {
      runtimecake.services = runtimecake.services.map((serviceconfig) => {
        let servicecake = null;

        const remote = is.object(serviceconfig.service)
          ? serviceconfig.service
          : paladin.services.find(
              (service) =>
                service.slug === serviceconfig.service ||
                service.slug === serviceconfig.slug,
            );

        if (remote) {
          servicecake = new Cake({
            module: remote.module,
            manifest: {
              ...remote.manifest,
              ...serviceconfig.manifest,
              slug: serviceconfig.slug || remote.slug,
            },
            secrets: {
              ...(remote.secrets || {}),
              ...(serviceconfig.secrets || {}),
            },
            statics: {
              ...(remote.statics || {}),
              ...(serviceconfig.statics || {}),
            },
          });
        }

        if (!servicecake) {
          servicecake = new Cake(serviceconfig);
        }

        servicecake.runtime = runtimecake.slug;
        servicecake.mount = paladin.join.mountpoint //
          .service(servicecake.slug, servicecake.runtime);

        return servicecake;
      });
    }

    return runtimecake;
  };
}

// import { Cake, Path, Url, cast, as } from "@vivalence/typology";

// export default function bake(paladin) {
//   paladin.bake = {};

//   paladin.bake.service = (serviceconfig) => {
//     const cake = new Cake(serviceconfig);

//     // if(!path ...)  path: new Path(segment),
//     //   if(!url...)url: new Url(segment, paladin.daemon.statics.serve),
//     //...
//     // const mount = runtime
//     //   ? paladin.join.mountpoint.service(service.slug, runtime)
//     //   : paladin.join.mountpoint.service(service.slug);

//     // const segment = runtime
//     //   ? `/runtime/${runtime}/service/${service.slug}`
//     //   : `/service/${service.slug}`;

//     // if (services) {
//     //   services.map((service) => {
//     //     service.mount = paladin.join.mountpoint.service(service.slug);
//     //     // url: new Url(`/runtime/${slug}`, new URL("http://localhost")),
//     //     // path: new Path(`/runtime/${slug}`),
//     //     paladin.services.push(new Cake(service));
//     //   });
//     // }
//     return cake;
//   };

//   // source: file - required input
//   paladin.bake.runtime = (runtimeconfig) => {
//     const cake = new Cake(runtimeconfig);

//     // path: new Path(pathSegment),
//     // url: new Url(pathSegment, paladin.daemon?.statics?.serve),
//     // cake.mount = paladin.join.mountpoint.runtime(cake.slug);

//     // the following three should derive from  paladin tools. ensure. ...more
//     // processRuntimeServices(runtimecake, paladin);
//     // ensureGaiaService(runtimecake, paladin);
//     // ensureDatamapService(runtimecake, paladin);

//     // runtime.services = runtime.services.map((serviceconfig) => {
//     // const servicecake = paladin.bake.service(serviceconfig);
//     //   service.remote = findRemoteService(serviceconfig, paladin);
//     //   return servicecake;
//     // });
//     // // runtime.services = runtime.services.map((servicecake) => {const remoteService = findRemoteService(servicecake, paladin); const service = new Cake({remote: remoteService, ...servicecake, runtime: runtime.slug, mount: paladin.join.mountpoint.service(servicecake.slug, runtime.slug),});

//     return cake;
//   };
// }

// // scout
// function findRemoteService(servicecake, paladin) {
//   return paladin.services.find(
//     (service) =>
//       service.slug === servicecake.service || service.slug === servicecake.slug,
//   );
// }
// // scout
// function findServiceForRuntime(slug, runtime, paladin) {
//   return (
//     runtime.services?.find((s) => s.slug === slug) ||
//     paladin.services.find((s) => s.slug === slug)
//   );
// }

// // ensure
// function ensureGaiaService(runtime, paladin) {
//   if (runtime.gaia) return;

//   const gaia = findServiceForRuntime("gaia", runtime, paladin);
//   if (!gaia)
//     throw new Error(`Runtime ${runtime.slug} missing required gaia service`);

//   runtime.gaia = {
//     ...gaia,
//     runtime: runtime.slug,
//   };
// }

// // ensure
// function ensureDatamapService(runtime, paladin) {
//   if (runtime.datamap) return;

//   const datamap = findServiceForRuntime("datamap", runtime, paladin);
//   if (!datamap)
//     throw new Error(`Runtime ${runtime.slug} missing required datamap service`);

//   runtime.datamap = {
//     ...datamap,
//     runtime: runtime.slug,
//     mount: paladin.join.mountpoint.service("datamap", runtime.slug),
//   };
// }
