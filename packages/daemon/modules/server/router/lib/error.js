export default async function error(router) {
  router.use(async (ctx, next) => {
    try {
      await next();
    } catch (error) {
      console.error("[ERROR] @daemon/server/router/error.js");
      console.error(error);
      ctx.response.status = error.code || 500;
      ctx.response.body = {
        error: {
          code: error.code || 500,
          message: error.message || "Internal Server Error",
        },
      };
    }
  });
}
