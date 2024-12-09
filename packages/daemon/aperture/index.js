import onRequest from "./lib/middlewares/onRequest.js";

import runtime from "./runtime/index.js";
import runtimes from "./runtimes/index.js";

let aperture = { router: null };

async function init(daemon) {
  aperture.router = daemon.router.create();

  aperture.router.middleware.push(onRequest(aperture, daemon));

  daemon.aperture = await [
    runtime,
    runtimes, //
  ].reduce((acc, fn) => acc.then(fn), Promise.resolve(aperture));

  return daemon;
}

async function serve(daemon) {
  daemon.router.use(
    "/aperture",
    ...daemon.aperture.router.middleware,
    daemon.aperture.router.routes(),
    daemon.aperture.router.allowedMethods(),
  );
  return daemon;
}

export default { init, serve };
