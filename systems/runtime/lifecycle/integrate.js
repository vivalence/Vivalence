import paladin from "@vivalence/paladin";
import { shard, Url, Connection, shape, Vector, Status } from "@vivalence/typology";

// const testVector = new Vector();
// testVector.branch("/test/vector").open("/here", () => {
//   return { success: true };
// });

// export async function test(die) {
//   die.good.aperture.branch("/runtime").router.use(compiler.oak(testVector));
//   // die.good.aperture.branch("/runtime").slurp(testVector);
// }

export async function wake(die) {
  die.good.ters = {
    async patrol() {
      for (const child of [...die.good.daemons, ...die.good.processes]) {
        if (child.status.is("ERROR")) {
          console.warn(`child unhealthy`, child.slug);
        }
      }
      console.log(`$[runtime:${paladin.variant.runtime?.slug}]`, die.status);
    },
  };
}

export async function launch(runtimeDie) {
  const url = paladin.variant.runtime?.statics?.serve;
  if (!url) {
    console.warn("No runtime serve URL configured");
    return;
  }

  console.log(`launching on ${url.absolute}`);

  runtimeDie.good.aperture.open(
    "/multiplex",
    shard.serve.multiplex(runtimeDie.good.aperture),
  );

  runtimeDie.good.server = Deno.serve(
    {
      port: Number(url.port),
      hostname: url.hostname,
      signal: runtimeDie.abort.signal,
      onListen() {
        console.log(new Status("alive"));
      },
    },
    shard.cors.wrap(shape.http(runtimeDie.good.aperture)),
  );

  runtimeDie.status.set({ code: "RUNNING", label: url.absolute });
}

export async function announce(die) {
  for (const daemonDie of die.good.daemons) {
    // console.log(daemonDie.mask);
    const connection = new Connection(daemonDie.mask.lighthouse.statics.remote).use(
      async (ctx, next) => {
        // console.log("request", ctx);
        await next();
        // console.log("response", ctx);
      },
    );
    await connection.call("/entities/daemon/ensure", {
      data: { slug: daemonDie.slug, url: daemonDie.good.url.absolute },
    });
  }
}
// import paladin from "@vivalence/paladin";
// import { context, mw } from "@vivalence/vector/aperture";

// export async function serve(runtime) {
//   runtime.server.use(mw.cors);
//   runtime.server.use(mw.notFound);
//   const composed = runtime.aperture.compose(true);
//   runtime.server.use(composed);
// }

// export async function watchdog(runtime) {
//   runtime.ters = {
//     async patrol() {
//       for (const terran of runtime.terrans) {
//         if (terran.status.is("ERROR"))
//           console.warn(`Terran  unhealthy`, terran);
//       }
//       console.log(`$[runtime:${paladin.variant.runtime.slug}]`, runtime.status);
//     },
//   };
// }

// export async function launch(runtime) {
//   await paladin.ikiro;
//   const url = paladin.variant.runtime.statics.serve;

//   runtime.server.addEventListener(
//     "listen",
//     ({ hostname, port, serverType }) => {
//       console.log(`${"listening on :"}${`${port}`}`);
//       console.log({ hostname, port, serverType });
//     },
//   );

//   runtime.listen = runtime.server.listen({
//     port: url.port,
//     hostname: url.hostname,
//     signal: runtime.abort.signal,
//   }); // port hostname

//   runtime.status.set({ code: "RUNNING", label: url.toString() });

//   return runtime;
// }

// // import config from "@vivalence/paladin";
// // import { secure, is } from "@vivalence/shared";
// // import { context, mw as mwa } from "@vivalence/vector/aperture";
// // import { compiler, controller } from "@vivalence/vector";
// // import { Application } from "oak";

// // import * as lifecycle from "../runtime/index.js";

// // export async function attach(daemon) {
// //   for (const rme of daemon.runtimes) {
// //     daemon.aperture
// //       .branch(rme.url.pathname)
// //       .use(secure.context(rme.instance.lighthouse))
// //       .use(secure.authorize())
// //       .descendants.push(rme.instance.aperture);
// //   }
// // }

// // export async function runtimes(daemon) {
// //   for (const rme of daemon.runtimes) {
// //     for (const integrate of Object.values(lifecycle.integrate)) {
// //       await integrate(rme, daemon);
// //     }
// //     // checks
// //   }
// // }

// // export async function serve(daemon) {
// //   const app = new Application();
// //   app.use(mwa.notFound);
// //   app.use(mwa.cors);
// //   app.use(daemon.aperture.compose(true));

// //   daemon.server = app.listen({
// //     hostname: paladin.runtime.static.serve, // daemon.config.serve.host,
// //     port: parseInt(daemon.config.serve.port),
// //   });
// // }
