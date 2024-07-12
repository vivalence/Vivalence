// const createRouter = (parentPath = "/", routes = new Map(), middlewares = []) => {const use = (m) => middlewares.push(m); const applyMiddlewares = (handler) => {return async (request, locals) => {for (const middleware of middlewares) {request = (await middleware(request, locals)) || request;} return handler(request, locals);};}; const addRoute = (path, handler) => {const fullPath = `${parentPath}/${path}`.replace(/\/+/g, "/"); routes.set(fullPath, handler);}; const matchRoute = (path) => {const handler = routes.get(path); return handler ? applyMiddlewares(handler) : null;}; const scope = (path) => {const subRouter = createRouter(`${parentPath}/${path}`, routes, [])[0]; return subRouter;}; const route = (path, handler) => {addRoute(path, handler);}; route.use = use; route.scope = scope; return [route, { routes, middlewares }];}; export default createRouter;
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
        // router.use(fullPath, scopedRouter.router.routes(), scopedRouter.router.allowedMethods());
        router.use(fullPath, scopedRouter.routes(), scopedRouter.allowedMethods());
        return scopedRouter;
    };

    return {
        route,
        use,
        scope,

        // match, router,

        routes: () => router.routes(),
        allowedMethods: () => router.allowedMethods()
    };
};

export default createRouter;
