import { wrap } from "@mikro-orm/core";
import hash from "@vivalence/shared/hash";
import createJWT from "./lib/jwt.js";

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
  const username = input.username;
  const password = hash.string(input.password);

  const identity = ctx.entities.identity.create({ slug: username });

  await ctx.entities.em.flush();

  const accessToken = await ctx.jwt.create({
    id: identity.id,
    type: "access",
  });

  const refreshToken = await ctx.rft.create({
    id: identity.id,
    type: "refresh",
  });

  const authority = {
    access: accessToken,
    refresh: refreshToken,
  };

  wrap(identity).assign({
    authentication: {
      provider: "password",
      credentials: { username, password },
      tokens: authority,
    },
  });

  return {
    identity: { ...identity, authentication: null },
    authority,
  };
}

async function login(input, ctx) {
  const identity = await ctx.identity.identify(input);
  if (!identity) {
    ctx.response.status = 400;
    return { success: false };
  }

  const accessToken = await ctx.jwt.create({
    id: identity.id,
    type: "access",
  });

  const refreshToken = await ctx.rft.create({
    id: identity.id,
    type: "refresh",
  });

  const authority = {
    access: accessToken,
    refresh: refreshToken,
  };

  wrap(identity).assign(
    {
      authentication: {
        tokens: authority,
      },
    },
    { merge: true, mergeObjectProperties: true },
  );

  return {
    identity: { ...identity, authentication: null },
    authority,
  };
}

async function logout(input, ctx) {
  const { refresh } = input;

  if (!ctx.rft.verify(refresh)) {
    ctx.response.status = 401;
    return {};
    // throw new Error("Invalid refresh token");
  }

  const payload = await ctx.jwt.verify(refresh);
  if (!payload || payload.type !== "refresh") {
    ctx.response.status = 401;
    return {};
    // throw new Error("Invalid refresh token");
  }

  const identity = await ctx.identity.findOne({ id: payload.id });
  if (!identity) {
    ctx.response.status = 401;
    return {};
    // throw new Error("Identity not found");
  }

  wrap(identity).assign(
    {
      authentication: {
        tokens: {
          access: null,
          refresh: null,
        },
      },
    },
    { mergeObjectProperties: true },
  );

  return { success: true };
}

async function refresh(input, ctx) {
  const { refresh } = input;

  if (!ctx.rft.verify(refresh)) {
    ctx.response.status = 401;
    return {};
    // throw new Error("Invalid refresh token");
  }

  const payload = await ctx.jwt.verify(refresh);
  if (!payload || payload.type !== "refresh") {
    ctx.response.status = 401;
    return {};
    // throw new Error("Invalid refresh token");
  }

  const identity = await ctx.identity.findOne({ id: payload.id });
  if (!identity) {
    ctx.response.status = 401;
    return {};
    // throw new Error("Identity not found");
  }

  const newAccessToken = await ctx.jwt.create({
    id: identity.id,
    type: "access",
  });

  wrap(identity).assign(
    {
      authentication: {
        tokens: {
          access: newAccessToken,
        },
      },
    },
    { merge: true, mergeObjectProperties: true },
  );

  return {
    access: newAccessToken,
  };
}

async function verify(input, ctx) {
  const { access } = input;

  const payload = await ctx.jwt.verify(access);
  if (!payload || payload.type !== "access") {
    ctx.response.status = 401;
    return { valid: false };
  }

  const identity = await ctx.identity.findOne({ id: payload.id });
  if (!identity) {
    ctx.response.status = 400;
    return { valid: false };
  }
  return {
    valid: true,
    identity: { ...identity, authentication: null },
  };
}
