import Aperture from "./../../locals/aperture/index.ts";

export default {
  // (subject, context)
  init: (runtime, daemon) => {
    runtime.aperture = Aperture.create({});
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

    const runtimeCallCreateMiddleware = (ctx) => {
      // create ctx
      // create a router
      // pull a aperture.serve into router
      // compose the middlewares and router.
      // apply the compose to ctx.
    };
    // the instantiation of the call method is
    // one level outsite the runtime, so it happens only once.
    // which keeps the entitymap and other state alive.
    // neat
    return daemon;
  },
  serve: (runtime, daemon: any) => {
    await runtime.aperture.serve(daemon.aperture.router);
    return daemon;
  },
};

//     const options = {};
//     // daemon
//     runtime.aperture = new Aperture(options);
//     // load some root level middlewares.
//     // including the ctx creation for the daemon-level routes
//     // high-sec shit.
//     // the runtime gets its own branch()
//     // what do i pass the call.create() ?
//     // we create two call methods.
//     // one in level daemon method call
//     // one in level runtime method call
//     // runtime.call adapts daemon context.
//     // daemon.call and runtime.call
//     // and the instantiation of the call method is
//     // one level outsite the runtime, so it happens only once.
//     // which keeps the entitymap and other state alive.
//     // neat
//     return daemon;
//   },
//   serve: (daemon: any) => {
//     const server = new Server();

//     await daemon.aperture.serve(server);

//     daemon.server = server.listen({ port: 8080 });

//     return daemon;
//   },
// };
