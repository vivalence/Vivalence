export function context(provider) {
  return async function (ctx, next) {
    try {
      ctx.authority = {
        token: ctx.request.headers?.get("authorization")?.split(" ")[1],
      };
      ctx.identity = await provider.authenticate(ctx.authority.token);
    } catch (error) {
      console.log("[AUTH ERROR] @shared/secure/context");
      console.log(error);

      if (error.code === "ERR_JWS_INVALID") {
        ctx.response.status = 401;
        ctx.response.body = {
          error: { code: "UNAUTHORIZED" },
          // error: { message: error.message, name: error.name, code: error.code },
        };
      } else {
        ctx.response.status = 400;
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

    ctx.user = user;
    await next();
    delete ctx.user;
  };
}
