export default (aperture, daemon) => async (ctx, next) => {
  ctx.aperture = aperture;
  ctx.daemon = daemon;
  ctx.services = daemon.services;
  ctx.aperture.call = aperture.router.call.create(ctx);
  await next();
};
