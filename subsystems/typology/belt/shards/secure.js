export function authority(provider) {
  return async (ctx, next) => {
    ctx.authority = provider;
    await next();
  };
}

export function authorize(claims = []) {
  return async (ctx, next) => {
    try {
      const token = ctx.request.headers?.get("authorization")?.split(" ")[1];
      ctx.identity = await ctx.authority.authenticate(token);
      ctx.user = await ctx.identity.getUser();

      if (!ctx.user) {
        // throw new Error()
        not.authorized();
      }
    } catch (error) {
      console.log("[AUTH ERROR] @shared/secure/context", error);
      if (error.code === "ERR_JWS_INVALID") {
        ctx.response.status = 401;
        ctx.response.body = { error: { code: "UNAUTHORIZED" } };
      } else {
        ctx.response.status = 400;
        ctx.response.body = { error };
      }
      return ctx;
    }
    await next();
    delete ctx.user;
  };
}

// export function context(provider) {
//   console.log("SECURE CONTEXT PROVIDER", provider);
//   return async function (ctx, next) {
//     try {
//       ctx.authority = {
// 	provider,
//         token: ctx.request.headers?.get("authorization")?.split(" ")[1],
//       };
//       // ctx.identity = await ctx.authority.provider.authenticate(ctx.authority.token);

//     } catch (error) {
//       console.log("[AUTH ERROR] @shared/secure/context");
//       console.log(error);
//       ctx.response.status = 401;
//       if (error.code === "ERR_JWS_INVALID") {
//         ctx.response.body = {
//           error: { code: "UNAUTHORIZED" },
//           // error: { message: error.message, name: error.name, code: error.code },
//         };
//       } else {
//         ctx.response.body = { error };
//       }
//       return ctx;
//     }
//     await next();
//   };
// }
