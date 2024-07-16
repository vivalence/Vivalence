import { Router } from "https://deno.land/x/oak@v12.5.0/mod.ts";

const createRouter = (basePath = "", parentMiddlewares = []) => {
  const router = new Router();
  const middlewares = [...parentMiddlewares];
  const routes = new Map();

  const use = (middleware) => {
    middlewares.push(middleware);
  };

  const applyMiddlewares = (handler) => {
    return async (ctx, next) => {
      let request = ctx.request;
      for (const middleware of middlewares) {
        request = (await middleware(request, ctx.state)) || request;
      }
      try {
        const result = await handler(request, ctx.state);
        ctx.response.type = "json";
        ctx.response.body = { data: result };
      } catch (error) {
        console.error(error);
        ctx.response.status = error.status || 500;
        ctx.response.type = "json";
        ctx.response.body = { error: error.message || "Internal Server Error" };
      }
      await next();
    };
  };

  const route = (path, handler) => {
    const fullPath = `${basePath}/${path}`.replace(/\/+/g, "/");
    routes.set(fullPath, handler);
    router.all(fullPath, applyMiddlewares(handler));
  };

  const match = (path) => {
    for (const [routePath, handler] of routes.entries()) {
      if (path.startsWith(routePath)) {
        return applyMiddlewares(handler);
      }
    }
    return null;
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
