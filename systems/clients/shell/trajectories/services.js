import config from "@vivalence/config";
// import registry from "@vivalence/registry";

// async function services(client) {
//   // todo: move serivce server control to daemon.
//   const services = config.services;
//   const runtimes = config.runtimes;

//   for (const [slug, serviceconfig] of Object.entries(services)) {
//     const service = await registry.load(serviceconfig.service);

//     const host = {
//       trajectory: client.trajectory.branch(`/daemon/${slug}`),
//     };

//     // todo delete serviceconfig.config.client
//     if (service.control) await service.control(serviceconfig, host);
//   }

//   for (const [runtimeslug, runtimeconfig] of Object.entries(runtimes)) {
//     const services = runtimeconfig.services;
//     for (const [serviceslug, serviceconfig] of Object.entries(services)) {
//       const service = await registry.load(serviceconfig.service);

//       const host = {
//         trajectory: client.trajectory.branch(`/@${runtimeslug}/${serviceslug}`),
//       };

//       // todo delete serviceconfig.config.client
//       if (service.control) await service.control(serviceconfig, host);
//     }
//   }

//   return client;
// }
