import bootDaemonAperture from "./daemon/boot.js";
import runtimeAperture from "./runtime/index.js";

async function init(daemon) {
  let aperture = { router: daemon.router.create(), pathname: "/aperture" };
  daemon.aperture = aperture;
  return daemon;
}

async function boot(daemon) {
  daemon.aperture.router.middleware.push(async (ctx, next) => {
    ctx.daemon = daemon;
    ctx.aperture = daemon.aperture;
    ctx.services = daemon.services;
    ctx.entities = daemon.entities;
    ctx.entities.em = daemon.entities.em.fork();
    ctx.aperture.call = ctx.aperture.router.call.create(ctx);
    await next();
  });

  daemon.aperture = await [bootDaemonAperture].reduce(
    (acc, fn) => acc.then(fn),
    Promise.resolve(daemon.aperture),
  );
  return daemon;
}

async function serve(daemon) {
  daemon.router.use(
    daemon.aperture.pathname,
    ...daemon.aperture.router.middleware,
    daemon.aperture.router.routes(),
    daemon.aperture.router.allowedMethods(),
  );
  return daemon;
}

export default { init, boot, serve, runtime: runtimeAperture };
