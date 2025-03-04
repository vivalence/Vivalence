// this method is off.
// why is this a decorator?
const runtimeContextMiddleware = (runtime) => async (ctx, next) => {
  ctx.runtime = runtime;

  // const daemonCall = ctx.aperture?.call;

  // ctx.aperture.call = async (path, body = {}, params = {}) => {
  //   const runtimePath = path.startsWith("/") ? `/runtime${path}` : `/runtime/${path}`;
  //   const runtimeBody = typeof body === "object" ? { ...body, runtime: runtime.id } : body;
  //   return await daemonCall(runtimePath, runtimeBody, params);
  // };

  await next();
};

const entityMiddleware = (runtime) => async (ctx, next) => {
  // Override entity manager with runtime-specific one if available
  if (runtime.entities) {
    ctx.entities = runtime.entities;
    ctx.entities.em = runtime.entities.em.fork();
  }

  await next();
};

export default {
  init: async (runtime, daemon) => {
    // Create runtime aperture as branch of daemon aperture
    runtime.aperture = daemon.aperture.branch("/runtime");

    // Apply runtime-specific middlewares
    runtime.aperture.use(runtimeContextMiddleware(runtime));
    runtime.aperture.use(entityMiddleware(runtime));

    // Add status endpoint
    runtime.aperture.open("/status", (ctx) => ({
      status: "ok",
      runtime: runtime.id,
      timestamp: new Date().toISOString(),
    }));

    return runtime;
  },

  serve: async (runtime, daemon) => {
    // const router = new Router();

    // await runtime.aperture.serve(router);

    // const composed = compose([
    //   router.routes(),
    //   router.allowedMethods(),
    // ]);

    // await composedMiddleware(ctx);

    // const composed = await compose([
    //   // compose/
    //   // await router.routes()(callCtx, async () => {}),
    //   // await router.allowedMethods()(callCtx, async () => {}),
    //   // \compose
    // ]);

    await runtime.aperture.compose();

    runtime.call = async (path, body = {}, params = {}) => {
      // const ctx = {request: {body, url: new URL(path, "http://internal"), method: params.method || "POST", headers: new Headers(),}, response: { body: {}, status: 404, headers: new Headers() },};

      const ctx = Aperture.context(path, body, params);

      // const tmpRouter = new Router();

      // await runtime.aperture.serve(tmpRouter);

      // await tmpRouter.routes()(callCtx, async () => {});
      // await tmpRouter.allowedMethods()(callCtx, async () => {});
      await runtime.aperture.composed(ctx);
      return ctx.response.body;
    };

    return runtime;
  },
};
