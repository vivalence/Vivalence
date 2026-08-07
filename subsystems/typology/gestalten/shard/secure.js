// import { RequestContext } from "@mikro-orm/core";

export function authority(provider) {
  return async (ctx, next) => {
    ctx.authority = provider;
    await next();
  };
}

export function authorize(claims = []) {
  return async (ctx, next) => {
    const header = ctx.request.headers?.get("authorization");
    const param = ctx.request.url.searchParams?.get("token");
    const token = header?.startsWith("Bearer ") ? header.split(" ")[1] : param;

    if (!token) {
      ctx.response.status = 401;
      ctx.response.body = {
        status: "ERROR",
        error: {
          code: "MISSING_TOKEN",
          message: "Authorization header or token param required",
        },
      };
      return;
    }

    try {
      ctx.identity = await ctx.authority.authenticate(token);
    } catch (error) {
      ctx.response.status = 401;
      ctx.response.body = {
        status: "ERROR",
        error: { code: "INVALID_TOKEN", message: error.message },
      };
      return;
    }

    try {
      ctx.user = await ctx.identity.getUser();
    } catch (error) {
      ctx.response.status = 500;
      ctx.response.body = {
        status: "ERROR",
        error: {
          code: "USER_LOOKUP_FAILED",
          message: "Failed to retrieve user",
        },
      };
      return;
    }

    if (!ctx.user) {
      ctx.response.status = 401;
      ctx.response.body = {
        status: "ERROR",
        error: { code: "USER_NOT_FOUND", message: "User does not exist" },
      };
      return;
    }

    // RequestContext.getEntityManager().setFilterParams("user", { id: ctx.user.id });

    // if (claims.length > 0) {const userClaims = ctx.user.claims || []; const missing = claims.filter(c => !userClaims.includes(c)); if (missing.length > 0) {ctx.response.status = 403; ctx.response.body = {status: "ERROR", error: { code: "INSUFFICIENT_CLAIMS", message: `Missing claims: ${missing.join(", ")}` }}; return;}}

    await next();
  };
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
