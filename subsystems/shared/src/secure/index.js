export function context(service, repository) {
  return async function (ctx, next) {
    // console.log("secure context");
    try {
      const token = ctx.request.headers?.get("authorization")?.split(" ")[1];
      ctx.identity = await service.authenticate(token, repository);
    } catch (error) {
      console.log("[AUTH ERROR] @shared/secure/context");
      console.log(error);
      console.log(ctx.request);
      ctx.response.status = 401;
      if (error.code === "ERR_JWS_INVALID") {
        ctx.response.body = {
          error: { code: "UNAUTHORIZED" },
          // error: { message: error.message, name: error.name, code: error.code },
        };
      } else {
        ctx.response.body = { error };
      }
      return ctx;
    }
    await next();
  };
}

export function authorize(claims = []) {
  return async function (ctx, next) {
    // validate identity integrity
    // validate claims against user and context.
    if (!ctx.identity) {
      ctx.response.status = 400;
      ctx.response.body = {
        error: { message: "cant invoke secure authorization without identity" },
      };
      return ctx;
    }

    const user = await ctx.identity.getUser();
    if (!user) {
      ctx.response.status = 401;
      ctx.response.body = { error: { name: "Unauthorized" } };
      return ctx;
    }
    await next();
  };
}

export default { context, authorize };
