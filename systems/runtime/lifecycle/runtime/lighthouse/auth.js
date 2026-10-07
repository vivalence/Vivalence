import { Vector, shard } from "@vivalence/typology";
import { wrap } from "@mikro-orm/core";
import * as argon2 from "argon2";
import { bearer, identify, signer } from "./signer.js";

const respond = {
  success: (data = {}) => ({ status: "SUCCESS", ...data }),
  error: (ctx, code, message, httpStatus = 400) => {
    ctx.response.status = httpStatus;
    return { status: "ERROR", error: { code, message } };
  },
};

const card = (user) => ({ id: user.id, slug: user.slug, traits: user.traits, trait: user.trait });

const authority = async (ctx, user) => {
  const sign = signer(ctx.lighthouse.secret);
  return { access: await sign.access(user), refresh: await sign.refresh(user) };
};

export const auth = (lighthouse) => new Vector().use(shard.context.bind("lighthouse", lighthouse))
  .open("/signup", async ({ username, password }, ctx) => {
    if (!username || !password) return respond.error(ctx, "INVALID_INPUT", "Username and password required");
    const existing = await ctx.lighthouse.users.byUsername(username);
    if (existing) return respond.error(ctx, "USERNAME_EXISTS", "Username already taken");

    const user = ctx.lighthouse.users.create({ slug: username });
    await ctx.lighthouse.users.em.flush();
    const tokens = await authority(ctx, user);
    wrap(user).assign({
      authentication: { provider: "password", credentials: { username, password: await argon2.hash(password) }, tokens },
    });
    await ctx.lighthouse.users.em.flush();
    return respond.success({ user: card(user), authority: tokens });
  })
  .open("/login", async ({ username, password }, ctx) => {
    if (!username || !password) return respond.error(ctx, "INVALID_INPUT", "Username and password required");
    const user = await identify(ctx.lighthouse, { username, password });
    if (!user) return respond.error(ctx, "INVALID_CREDENTIALS", "Invalid username or password", 401);
    const tokens = await authority(ctx, user);
    wrap(user).assign({ authentication: { tokens } }, { merge: true, mergeObjectProperties: true });
    await ctx.lighthouse.users.em.flush();
    return respond.success({ authority: tokens, user: card(user) });
  })
  .open("/password", async ({ operator, username, password }, ctx) => {
    if (!operator || !username || !password) return respond.error(ctx, "INVALID_INPUT", "Operator token, username and password required");
    if (!(await signer(ctx.lighthouse.secret).verify(operator, "operator"))) return respond.error(ctx, "INVALID_TOKEN", "Invalid operator token", 401);
    const user = await ctx.lighthouse.users.byUsername(username);
    if (!user) return respond.error(ctx, "USER_NOT_FOUND", "User not found", 404);
    wrap(user).assign(
      { authentication: { credentials: { password: await argon2.hash(password) }, tokens: { access: null, refresh: null } } },
      { merge: true, mergeObjectProperties: true },
    );
    await ctx.lighthouse.users.em.flush();
    return respond.success({ user: card(user) });
  })
  .open("/logout", async ({ refresh }, ctx) => {
    if (!refresh) return respond.error(ctx, "MISSING_TOKEN", "Refresh token required");
    const user = await bearer(ctx.lighthouse, refresh);
    if (!user) return respond.error(ctx, "INVALID_TOKEN", "Invalid refresh token", 401);
    wrap(user).assign({ authentication: { tokens: { access: null, refresh: null } } }, { mergeObjectProperties: true });
    await ctx.lighthouse.users.em.flush();
    return respond.success({ message: "Logged out" });
  })
  .open("/verify", async ({ access }, ctx) => {
    if (!access) return respond.error(ctx, "MISSING_TOKEN", "Access token required");
    const payload = await signer(ctx.lighthouse.secret).verify(access, "access");
    if (!payload) return respond.error(ctx, "INVALID_TOKEN", "Invalid or expired token", 401);
    const user = await ctx.lighthouse.users.findOne({ id: payload.id }, { filters: { user: false } });
    if (!user) return respond.error(ctx, "USER_NOT_FOUND", "User not found", 401);
    return respond.success({ user: card(user) });
  })
  .open("/refresh", async ({ refresh }, ctx) => {
    if (!refresh) return respond.error(ctx, "MISSING_TOKEN", "Refresh token required");
    const user = await bearer(ctx.lighthouse, refresh);
    if (!user) return respond.error(ctx, "INVALID_TOKEN", "Invalid or revoked refresh token", 401);
    const access = await signer(ctx.lighthouse.secret).access(user);
    wrap(user).assign({ authentication: { tokens: { access } } }, { merge: true, mergeObjectProperties: true });
    await ctx.lighthouse.users.em.flush();
    return respond.success({ access });
  });
