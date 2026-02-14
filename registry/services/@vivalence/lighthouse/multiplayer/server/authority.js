import { wrap } from "@mikro-orm/core";
import hash from "@vivalence/shared/hash";
import createJWT from "./lib/jwt.js";

const respond = {
  success: (data = {}) => ({ status: "SUCCESS", ...data }),
  error: (ctx, code, message, httpStatus = 400) => {
    ctx.response.status = httpStatus;
    return { status: "ERROR", error: { code, message } };
  },
};

export async function inject(service) {
  const { jwt, rft } = await createJWT(service);
  return async (ctx, next) => {
    ctx.jwt = jwt;
    ctx.rft = rft;
    await next();
  };
}

export function expose(service, aperture) {
  aperture
    .branch("/auth")
    .open("/signup", signup)
    .open("/login", login)
    .open("/logout", logout)
    .open("/verify", verify)
    .open("/refresh", refresh);
}

async function signup(input, ctx) {
  const { username, password } = input;

  if (!username || !password) {
    return respond.error(
      ctx,
      "INVALID_INPUT",
      "Username and password required",
    );
  }

  // if (password.length < 8) {return respond.error(ctx, "WEAK_PASSWORD", "Password must be at least 8 characters");}

  const existing = await ctx.entities.identity //
    .findOne({ "authentication.credentials.username": username });

  if (existing) {
    return respond.error(ctx, "USERNAME_EXISTS", "Username already taken");
  }

  const passwordHash = await hash(password);
  const identity = ctx.entities.identity.create({ slug: username });

  await ctx.entities.em.flush();

  const authority = {
    access: await ctx.jwt.create({ id: identity.id, type: "access" }),
    refresh: await ctx.rft.create({ id: identity.id, type: "refresh" }),
  };

  wrap(identity).assign({
    authentication: {
      provider: "password",
      credentials: { username, password: passwordHash },
      tokens: authority,
    },
  });

  return respond.success({
    identity: { id: identity.id, slug: identity.slug },
    authority,
  });
}

async function login(input, ctx) {
  const { username, password } = input;

  if (!username || !password) {
    return respond.error(
      ctx,
      "INVALID_INPUT",
      "Username and password required",
    );
  }

  const identity = await ctx.identity.identify({ username, password });

  if (!identity) {
    return respond.error(
      ctx,
      "INVALID_CREDENTIALS",
      "Invalid username or password",
      401,
    );
  }

  const authority = {
    access: await ctx.jwt.create({ id: identity.id, type: "access" }),
    refresh: await ctx.rft.create({ id: identity.id, type: "refresh" }),
  };

  wrap(identity).assign(
    { authentication: { tokens: authority } },
    { merge: true, mergeObjectProperties: true },
  );

  return respond.success({
    authority,
    identity: { id: identity.id, slug: identity.slug },
  });
}

async function logout(input, ctx) {
  const { refresh } = input;

  if (!refresh) {
    return respond.error(ctx, "MISSING_TOKEN", "Refresh token required");
  }

  if (!ctx.rft.verify(refresh)) {
    return respond.error(ctx, "INVALID_TOKEN", "Invalid refresh token", 401);
  }

  const payload = await ctx.jwt.verify(refresh).catch(() => null);

  if (!payload || payload.type !== "refresh") {
    return respond.error(ctx, "INVALID_TOKEN", "Invalid refresh token", 401);
  }

  const identity = await ctx.identity.findOne({ id: payload.id });

  if (identity) {
    wrap(identity).assign(
      { authentication: { tokens: { access: null, refresh: null } } },
      { mergeObjectProperties: true },
    );
    await ctx.rft.revoke(refresh);
  }

  return respond.success({ message: "Logged out" });
}

async function verify(input, ctx) {
  const { access } = input;

  if (!access) {
    return respond.error(ctx, "MISSING_TOKEN", "Access token required");
  }

  const payload = await ctx.jwt.verify(access).catch(() => null);

  if (!payload || payload.type !== "access") {
    return respond.error(ctx, "INVALID_TOKEN", "Invalid or expired token", 401);
  }

  const identity = await ctx.identity.findOne({ id: payload.id });

  if (!identity) {
    return respond.error(ctx, "IDENTITY_NOT_FOUND", "Identity not found", 401);
  }

  return respond.success({
    identity: { id: identity.id },
  });
}

async function refresh(input, ctx) {
  const { refresh } = input;

  if (!refresh) {
    return respond.error(ctx, "MISSING_TOKEN", "Refresh token required");
  }

  if (!ctx.rft.verify(refresh)) {
    return respond.error(
      ctx,
      "INVALID_TOKEN",
      "Invalid or revoked refresh token",
      401,
    );
  }

  const payload = await ctx.jwt.verify(refresh).catch(() => null);

  if (!payload || payload.type !== "refresh") {
    return respond.error(ctx, "INVALID_TOKEN", "Invalid refresh token", 401);
  }

  const identity = await ctx.identity.findOne({ id: payload.id });

  if (!identity) {
    await ctx.rft.revoke(refresh);
    return respond.error(ctx, "IDENTITY_NOT_FOUND", "Identity not found", 401);
  }

  const newAccessToken = await ctx.jwt.create({
    id: identity.id,
    type: "access",
  });

  wrap(identity).assign(
    { authentication: { tokens: { access: newAccessToken } } },
    { merge: true, mergeObjectProperties: true },
  );

  return respond.success({ access: newAccessToken });
}
// import { wrap } from "@mikro-orm/core";
// import hash from "@vivalence/shared/hash";
// import createJWT from "./lib/jwt.js";

// export async function inject(service) {
//   const { jwt, rft } = await createJWT(service);
//   return async (ctx, next) => {
//     ctx.jwt = jwt;
//     ctx.rft = rft;
//     await next();
//   };
// }

// export function expose(service, aperture) {
//   // TODO IMPORTANT CHORE: implement @typology/status
//   aperture
//     .branch("/auth")
//     .open("/signup", signup)
//     .open("/login", login)
//     .open("/logout", logout)
//     .open("/verify", verify)
//     // delete
//     .open("/refresh", refresh);
// }

// async function signup(input, ctx) {
//   const username = input.username;
//   const password = hash.string(input.password);

//   const identity = ctx.entities.identity.create({ slug: username });

//   await ctx.entities.em.flush();

//   const accessToken = await ctx.jwt.create({
//     id: identity.id,
//     type: "access",
//   });

//   const refreshToken = await ctx.rft.create({
//     id: identity.id,
//     type: "refresh",
//   });

//   const authority = {
//     access: accessToken,
//     refresh: refreshToken,
//   };

//   wrap(identity).assign({
//     authentication: {
//       provider: "password",
//       credentials: { username, password },
//       tokens: authority,
//     },
//   });

//   return {
//     identity: { ...identity, authentication: null },
//     authority,
//   };
// }

// async function login(input, ctx) {
//   const identity = await ctx.identity.identify(input);
//   if (!identity) {
//     ctx.response.status = 400;
//     return { success: false, message: "identity not found" };
//   }
//   const authentication = {
//     tokens: {
//       access: await ctx.jwt.create({
//         id: identity.id,
//         type: "access",
//       }),
//       refresh: await ctx.rft.create({
//         id: identity.id,
//         type: "refresh",
//       }),
//     },
//   };
//   wrap(identity).assign(
//     { authentication },
//     { merge: true, mergeObjectProperties: true },
//   );

//   return {
//     authority: authentication.tokens,
//     identity: { ...identity, authentication: null },
//   };
// }

// async function logout(input, ctx) {
//   const { refresh } = input;

//   if (!ctx.rft.verify(refresh)) {
//     ctx.response.status = 401;
//     return {};
//     // throw new Error("Invalid refresh token");
//   }

//   const payload = await ctx.jwt.verify(refresh);
//   if (!payload || payload.type !== "refresh") {
//     ctx.response.status = 401;
//     return {};
//     // throw new Error("Invalid refresh token");
//   }

//   const identity = await ctx.identity.findOne({ id: payload.id });
//   if (!identity) {
//     ctx.response.status = 401;
//     return {};
//     // throw new Error("Identity not found");
//   }

//   wrap(identity).assign(
//     {
//       authentication: {
//         tokens: {
//           access: null,
//           refresh: null,
//         },
//       },
//     },
//     { mergeObjectProperties: true },
//   );

//   return { success: true };
// }

// async function refresh(input, ctx) {
//   const { refresh } = input;

//   if (!ctx.rft.verify(refresh)) {
//     ctx.response.status = 401;
//     return { success: false, message: "rft verification failed" };
//   }

//   const payload = await ctx.jwt.verify(refresh);
//   if (!payload || payload.type !== "refresh") {
//     ctx.response.status = 401;
//     return { success: false, message: "invalid rft" };
//     return {};
//     // throw new Error("Invalid refresh token");
//   }

//   const identity = await ctx.identity.findOne({ id: payload.id });
//   if (!identity) {
//     ctx.response.status = 401;
//     return { success: false, message: "invalid rft" };
//     return {};
//     // throw new Error("Identity not found");
//   }

//   const newAccessToken = await ctx.jwt.create({
//     id: identity.id,
//     type: "access",
//   });

//   wrap(identity).assign(
//     {
//       authentication: {
//         tokens: {
//           access: newAccessToken,
//         },
//       },
//     },
//     { merge: true, mergeObjectProperties: true },
//   );

//   return {
//     access: newAccessToken,
//   };
// }

// async function verify(input, ctx) {
//   const { access } = input;

//   const payload = await ctx.jwt.verify(access);
//   if (!payload || payload.type !== "access") {
//     ctx.response.status = 401;
//     return { success: false, message: "invalid token" };
//   }

//   const identity = await ctx.identity.findOne(
//     { id: payload.id },
//     { populate: ["id", "slug"] },
//   );
//   if (!identity) {
//     ctx.response.status = 400;
//     return { success: false, message: "invalid token" };
//   }
//   return {
//     identity: { id: identity.id },
//     success: true,
//   };
// }
