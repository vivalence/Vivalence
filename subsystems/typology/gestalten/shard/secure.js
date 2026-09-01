const refuse = (ctx, status, code, message) => {
  ctx.response.status = status;
  ctx.response.body = { status: "ERROR", error: { code, message } };
};

export function authority(provider) {
  return async (ctx, next) => {
    ctx.authority = provider;
    await next();
  };
}

export function authenticate() {
  return async (ctx, next) => {
    if (ctx.identity) return await next();
    const header = ctx.request.headers?.get("authorization");
    const param = ctx.request.url.searchParams?.get("token");
    const token = header?.startsWith("Bearer ") ? header.split(" ")[1] : param;
    if (!token) return refuse(ctx, 401, "MISSING_TOKEN", "Authorization header or token param required");
    try {
      ctx.identity = await ctx.authority.authenticate(token);
    } catch (error) {
      return refuse(ctx, 401, "INVALID_TOKEN", error.message);
    }
    await next();
  };
}

export function authorize() {
  const identify = authenticate();
  const admit = async (ctx, next) => {
    try {
      ctx.user = await ctx.identity.getUser();
    } catch {
      return refuse(ctx, 500, "USER_LOOKUP_FAILED", "Failed to retrieve user");
    }
    if (!ctx.user) return refuse(ctx, 401, "USER_NOT_FOUND", "no userspace in this daemon — /userspace/handshake first");
    await next();
  };
  return (ctx, next) => identify(ctx, () => admit(ctx, next));
}
// export function authorize(claims = []) {
//   return async (ctx, next) => {
//     // if (ctx.internal) return await next(); // temp
//     try {
//       const token = ctx.request.headers?.get("authorization")?.split(" ")[1];
//       ctx.identity = await ctx.authority.authenticate(token);
//       ctx.user = await ctx.identity.getUser();

//       if (!ctx.user) {
//         // throw new Error()
//         not.authorized();
//       }
//     } catch (error) {
//       console.log("[AUTH ERROR]", error);
//       if (error.code === "ERR_JWS_INVALID") {
//         ctx.response.status = 401;
//         ctx.response.body = { error: { code: "UNAUTHORIZED" } };
//       } else {
//         ctx.response.status = 400;
//         ctx.response.body = { error };
//       }
//       return ctx;
//     }
//     await next();
//     delete ctx.identity;
//     delete ctx.user;
//   };
// }

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
//       console.log("[AUTH ERROR]");
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
