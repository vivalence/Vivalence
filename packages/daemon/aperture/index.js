import runtime from "./runtime/index.js";
import runtimes from "./runtimes.js";

const requestMiddleware = (aperture, daemon) => async (ctx, next) => {
  ctx.aperture = aperture;
  ctx.daemon = daemon;
  ctx.services = daemon.services;
  ctx.aperture.call = aperture.router.call.create(ctx);

  await next();
};

let aperture = { router: null };

async function init(daemon) {
  daemon.aperture = await [
    (aperture) => {
      aperture.router = daemon.router.create();
      aperture.router.middleware.push(requestMiddleware(aperture, daemon));
      return aperture;
    },
    runtimes,
    runtime,
  ].reduce((acc, fn) => acc.then(fn), Promise.resolve(aperture));

  return daemon;
}

async function serve(daemon) {
  daemon.router.use(
    "/access/v1",
    ...daemon.aperture.router.middleware,
    daemon.aperture.router.routes(),
    daemon.aperture.router.allowedMethods(),
  );
  return daemon;
}

export default { init, serve };
