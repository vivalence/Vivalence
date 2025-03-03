import { Application } from "oak";
import { Aperture } from "./aperture.ts";
// import bootDaemonAperture from "./daemon/boot.js";
// import runtimeAperture from "./runtime/index.js";

export default {
  init: (daemon) => {
    const options = {};
    daemon.aperture = new Aperture(options);

    // load some root level middlewares.
    // including the ctx creation for the daemon-level routes
    // high-sec shit.
    // the runtime gets its own branch()
    // what do i pass the call.create() ?
    // we create two call methods.
    // one in level daemon method call
    // one in level runtime method call
    // runtime.call adapts daemon context.
    // daemon.call and runtime.call
    // and the instantiation of the call method is
    // one level outsite the runtime, so it happens only once.
    // which keeps the entitymap and other state alive.
    // neat
    return daemon;
  },
  serve: (daemon: any) => {
    const server = new Server();

    await daemon.aperture.serve(server);

    daemon.server = server.listen({ port: 8080 });

    return daemon;
  },
};

// async function init(daemon) {
//   let aperture = { router: daemon.router.create(), pathname: "/aperture" };
//   daemon.aperture = aperture;
//   return daemon;
// }

// async function boot(daemon) {
//   daemon.aperture.router.middleware.push(async (ctx, next) => {
//     ctx.daemon = daemon;
//     ctx.aperture = daemon.aperture;
//     ctx.services = daemon.services;
//     ctx.entities = daemon.entities;
//     ctx.entities.em = daemon.entities.em.fork();
//     ctx.aperture.call = ctx.aperture.router.call.create(ctx);
//     await next();
//   });

//   daemon.aperture = await [bootDaemonAperture].reduce(
//     (acc, fn) => acc.then(fn),
//     Promise.resolve(daemon.aperture),
//   );
//   return daemon;
// }

// async function serve(daemon) {
//   daemon.router.use(
//     daemon.aperture.pathname,
//     ...daemon.aperture.router.middleware,
//     daemon.aperture.router.routes(),
//     daemon.aperture.router.allowedMethods(),
//   );
//   return daemon;
// }

// export default { init, boot, serve, runtime: runtimeAperture };

// diff -u /Users/finn/vivalence/code/vivalence/packages/daemon/aperture/index.js /Users/finn/vivalence/code/vivalence/packages/daemon/aperture/\#index.js\#
// --- /Users/finn/vivalence/code/vivalence/packages/daemon/aperture/index.js	2025-02-12 19:42:17.070240207 +0100
// +++ /Users/finn/vivalence/code/vivalence/packages/daemon/aperture/#index.js#	2025-03-03 22:50:18.189753028 +0100
// @@ -1,38 +1,76 @@
// -import bootDaemonAperture from "./daemon/boot.js";
// -import runtimeAperture from "./runtime/index.js";
// +import { Application } from "oak";
// +import { Aperture } from "./aperture.ts";
// +import { Handler } from "./types.ts";

// -async function init(daemon) {
// -  let aperture = { router: daemon.router.create(), pathname: "/aperture" };
// -  daemon.aperture = aperture;
// -  return daemon;
// -}
// -
// -async function boot(daemon) {
// -  daemon.aperture.router.middleware.push(async (ctx, next) => {
// -    ctx.daemon = daemon;
// -    ctx.aperture = daemon.aperture;
// -    ctx.services = daemon.services;
// -    ctx.entities = daemon.entities;
// -    ctx.entities.em = daemon.entities.em.fork();
// -    ctx.aperture.call = ctx.aperture.router.call.create(ctx);
// -    await next();
// -  });
// -
// -  daemon.aperture = await [bootDaemonAperture].reduce(
// -    (acc, fn) => acc.then(fn),
// -    Promise.resolve(daemon.aperture),
// -  );
// -  return daemon;
// -}
// -
// -async function serve(daemon) {
// -  daemon.router.use(
// -    daemon.aperture.pathname,
// -    ...daemon.aperture.router.middleware,
// -    daemon.aperture.router.routes(),
// -    daemon.aperture.router.allowedMethods(),
// -  );
// -  return daemon;
// -}
// +export { Aperture, Handler };

// -export default { init, boot, serve, runtime: runtimeAperture };
// / +};
// / +// import bootDaemonAperture from "./daemon/boot.js";
// / +// import runtimeAperture from "./runtime/index.js";
// / +
// / +// async function init(daemon) {
// / +//   let aperture = { router: daemon.router.create(), pathname: "/aperture" };
// / +//   daemon.aperture = aperture;
// / +//   return daemon;
// / +// }
// / +
// // +// async function boot(daemon) {
// +//   daemon.aperture.router.middleware.push(async (ctx, next) => {
// +//     ctx.daemon = daemon;
// +//     ctx.aperture = daemon.aperture;
// +//     ctx.services = daemon.services;
// +//     ctx.entities = daemon.entities;
// +//     ctx.entities.em = daemon.entities.em.fork();
// +//     ctx.aperture.call = ctx.aperture.router.call.create(ctx);
// +//     await next();
// +//   });
// +
// +//   daemon.aperture = await [bootDaemonAperture].reduce(
// +//     (acc, fn) => acc.then(fn),
// +//     Promise.resolve(daemon.aperture),
// +//   );
// +//   return daemon;
// +// }
// +
// +// async function serve(router) {
// +//   // do a bunch fo stuff to decendants.serve(this.router)
// +//   router.use(
// +//     this..pathname,
// +//     ...this..router.middleware,
// +//     this..router.routes(),
// +//     this..router.allowedMethods(),
// +//   );
// +//   return this;
// +// }
// +
// +// export default { init, boot, serve, runtime: runtimeAperture };

// Diff finished.  Mon Mar  3 22:53:19 2025
