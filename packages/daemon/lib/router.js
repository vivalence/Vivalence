import { Router } from "https://deno.land/x/oak@v12.5.0/mod.ts";

const createRouter = (basePath = "", parentMiddlewares = []) => {
  const router = new Router();
  const middlewares = [...parentMiddlewares];
  const routes = new Map();

  const use = (middleware, ...params) => {
    middlewares.push(middleware);
  };

  // const applyMiddlewares = (handler) => {return async (ctx, next) => {let request = ctx.request; for (const middleware of middlewares) {request = (await middleware(request, ctx)) || request;} try {const result = await handler(request, ctx.state); ctx.response.type = "json"; ctx.response.body = { data: result };} catch (error) {console.error(error); ctx.response.status = error.status || 500; ctx.response.type = "json"; ctx.response.body = { error: error.message || "Internal Server Error" };} await next();};};
  // const applyMiddlewares = (handler) => {return async (ctx, next) => {let index = -1; const dispatch = async (i) => {if (i <= index) {throw new Error("[CUSTOM] next() called multiple times");} index = i; let fn = middlewares[i]; if (i === middlewares.length) fn = handler; if (!fn) return; try {await fn(ctx, dispatch.bind(null, i + 1));} catch (err) {throw err;}}; await dispatch(0);};};
  const applyMiddlewares = (handler) => {
    console.log("apply middlewares to handler,", handler, middlewares);
    return async (ctx, next) => {
      let index = -1;
      const dispatch = async (i) => {
        if (i <= index) {
          console.error(
            `[CUSTOM] next() called multiple times at index: ${i}, previous index: ${index}`,
          );
          throw new Error("[CUSTOM] next() called multiple times");
        }
        index = i;
        let fn = middlewares[i];
        if (i === middlewares.length) fn = handler;
        if (!fn) return;

        try {
          console.log(`[CUSTOM] Executing middleware at index: ${i}`);
          await fn(ctx, async () => {
            console.log(`[CUSTOM] Calling next() at index: ${i}`);
            await dispatch(i + 1);
          });
          console.log(`[CUSTOM] Middleware at index: ${i} finished execution`);
        } catch (err) {
          console.error(`[CUSTOM] Error in middleware at index: ${i}`);
          throw err;
        }
      };

      console.log(`[CUSTOM] Starting middleware chain`);
      await dispatch(0);
      console.log(`[CUSTOM] Finished middleware chain`);
    };
  };

  const route = (path, handler) => {
    const fullPath = `${basePath}/${path}`.replace(/\/+/g, "/");
    routes.set(fullPath, handler);
    router.all(fullPath, applyMiddlewares(handler));
  };

  const scope = (path) => {
    const fullPath = `${basePath}/${path}`.replace(/\/+/g, "/");
    const scopedRouter = createRouter(fullPath, middlewares);
    router.use(fullPath, scopedRouter.routes(), scopedRouter.allowedMethods());
    return scopedRouter;
  };

  return {
    route,
    use,
    scope,
    routes: () => router.routes(),
    allowedMethods: () => router.allowedMethods(),
  };
};

export default createRouter;
