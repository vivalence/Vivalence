// import { env } from "$env/dynamic/public";
// import { browser } from "$app/environment";
// import { Trajectory, parsers } from "@vivalence/trajectory";

// import createCall from "./lib/call/index.js";
// import createIdentity from "./lib/identity/index.js";
// // import makeModules from "./lib/modules.js";

// export let app;

// async function boot() {
//   app = {
//     identity: createIdentity(env["PUBLIC_VIVA_IDENTITY_AUTHORITY_URL"]),
//     call: createCall(),
//     state: {},
//     tools: {},
//     trajectory: new Trajectory([parsers.key]),
//   };

//   app.call.use(app.identity.useIdentity);
// }

// export default async function () {
//   if (!app) await boot();
//   // console.log(await app.identity.logout());
//   return app;
// }

// // session management

// // ctx.client.trajectory.branch((p) => p.key("p"));

// // ctx.identity = {
// //   //
// //   getUser: async () => await Promise.resolve({ id: "localhost" }),
// // };

// // ctx.call = createCall({});

// // ctx.daemon = { call: ctx.call.wrap("/aperture/v1/daemon") };

// // // if (browser && !window.viva) {
// // window.viva = ctx;
// // // }

// // return ctx;
// // let ctx;
