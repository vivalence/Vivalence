import user from "./user/index.js";
import runtime from "./runtime/index.js";
import dependency from "./dependency/index.js";

async function init(daemon) {
  daemon.api = await [
    (api) => {
      return Object.assign(api, {
        router: daemon.router.create(),
        locals: {},
      });
    },
    (api) => {
      api.router.middleware.push(async (ctx, next) => {
        if (!ctx.api) ctx.api = api;

        ctx.api.locals.supabase = daemon.services.supabase.createUserClient(ctx);

        ctx.api.locals.getUser = async () => {
          const { data, error } = await ctx.api.locals.supabase.auth.getUser();
          if (error) throw error;
          return data.user;
        };
        ctx.api.call = api.router.call.create(ctx);
        await next();
      });
      return api;
    },
    user,
    runtime,
    dependency,
  ].reduce((acc, fn) => acc.then(fn), Promise.resolve({}));

  return daemon;
}

async function serve(daemon) {
  daemon.router.use(
    "/api",
    ...daemon.api.router.middleware,
    daemon.api.router.routes(),
    daemon.api.router.allowedMethods(),
  );
  return daemon;
}

export default { init, serve };
