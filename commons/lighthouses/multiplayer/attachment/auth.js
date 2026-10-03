import { Vector } from "@vivalence/typology";
import { wrap } from "@vivalence/runtime";
import { UniqueConstraintViolationException } from "@mikro-orm/core";
import * as argon2 from "argon2";
import { bearer, identify, signer } from "../gestalten/identity.js";

const respond = {
  success: (data = {}) => ({ status: "SUCCESS", ...data }),
  error: (ctx, code, message, httpStatus = 400) => {
    ctx.response.status = httpStatus;
    return { status: "ERROR", error: { code, message } };
  },
};

const card = (identity) => ({ id: identity.id, slug: identity.slug, traits: identity.traits, trait: identity.trait });

const authority = async (ctx, identity) => {
  const sign = signer(ctx);
  return { access: await sign.access(identity), refresh: await sign.refresh(identity) };
};

export const auth = new Vector()
  .open("/signup", async ({ username, password }, ctx) => {
    if (!username || !password) return respond.error(ctx, "INVALID_INPUT", "Username and password required");
    const existing = await ctx.entities.identity
      .createQueryBuilder("i")
      .where(`json_extract(i.authentication, '$.credentials.username') = ?`, [username])
      .getSingleResult();
    if (existing) return respond.error(ctx, "USERNAME_EXISTS", "Username already taken");

    const identity = ctx.entities.identity.create({ slug: username });
    await ctx.entities.em.flush();
    const tokens = await authority(ctx, identity);
    wrap(identity).assign({
      authentication: { provider: "password", credentials: { username, password: await argon2.hash(password) }, tokens },
    });
    await ctx.entities.em.flush();
    return respond.success({ identity: card(identity), authority: tokens });
  })
  .open("/login", async ({ username, password }, ctx) => {
    if (!username || !password) return respond.error(ctx, "INVALID_INPUT", "Username and password required");
    const identity = await identify(ctx, { username, password });
    if (!identity) return respond.error(ctx, "INVALID_CREDENTIALS", "Invalid username or password", 401);
    const tokens = await authority(ctx, identity);
    wrap(identity).assign({ authentication: { tokens } }, { merge: true, mergeObjectProperties: true });
    await ctx.entities.em.flush();
    return respond.success({ authority: tokens, identity: card(identity) });
  })
  .open("/password", async ({ operator, username, password }, ctx) => {
    if (!operator || !username || !password) return respond.error(ctx, "INVALID_INPUT", "Operator token, username and password required");
    if (!(await signer(ctx).verify(operator, "operator"))) return respond.error(ctx, "INVALID_TOKEN", "Invalid operator token", 401);
    const identity = await ctx.entities.identity
      .createQueryBuilder("i")
      .where(`json_extract(i.authentication, '$.credentials.username') = ?`, [username])
      .getSingleResult();
    if (!identity) return respond.error(ctx, "IDENTITY_NOT_FOUND", "Identity not found", 404);
    wrap(identity).assign(
      { authentication: { credentials: { password: await argon2.hash(password) }, tokens: { access: null, refresh: null } } },
      { merge: true, mergeObjectProperties: true },
    );
    await ctx.entities.em.flush();
    return respond.success({ identity: card(identity) });
  })
  .open("/logout", async ({ refresh }, ctx) => {
    if (!refresh) return respond.error(ctx, "MISSING_TOKEN", "Refresh token required");
    const identity = await bearer(ctx, refresh);
    if (!identity) return respond.error(ctx, "INVALID_TOKEN", "Invalid refresh token", 401);
    wrap(identity).assign({ authentication: { tokens: { access: null, refresh: null } } }, { mergeObjectProperties: true });
    await ctx.entities.em.flush();
    return respond.success({ message: "Logged out" });
  })
  .open("/verify", async ({ access }, ctx) => {
    if (!access) return respond.error(ctx, "MISSING_TOKEN", "Access token required");
    const payload = await signer(ctx).verify(access, "access");
    if (!payload) return respond.error(ctx, "INVALID_TOKEN", "Invalid or expired token", 401);
    const identity = await ctx.entities.identity.findOne({ id: payload.id });
    if (!identity) return respond.error(ctx, "IDENTITY_NOT_FOUND", "Identity not found", 401);
    return respond.success({ identity: card(identity) });
  })
  .open("/refresh", async ({ refresh }, ctx) => {
    if (!refresh) return respond.error(ctx, "MISSING_TOKEN", "Refresh token required");
    const identity = await bearer(ctx, refresh);
    if (!identity) return respond.error(ctx, "INVALID_TOKEN", "Invalid or revoked refresh token", 401);
    const access = await signer(ctx).access(identity);
    wrap(identity).assign({ authentication: { tokens: { access } } }, { merge: true, mergeObjectProperties: true });
    await ctx.entities.em.flush();
    return respond.success({ access });
  })
  .open("/enroll", async ({ access, daemon }, ctx) => {
    if (!access || !daemon) return respond.error(ctx, "INVALID_INPUT", "Access token and daemon slug required");
    const payload = await signer(ctx).verify(access, "access");
    if (!payload) return respond.error(ctx, "INVALID_TOKEN", "Invalid or expired token", 401);
    const identity = await ctx.entities.identity.findOne({ id: payload.id }, { populate: ["daemons"] });
    if (!identity) return respond.error(ctx, "IDENTITY_NOT_FOUND", "Identity not found", 401);
    const row = await ctx.entities.daemon.findOne({ slug: daemon });
    if (!row) return respond.error(ctx, "DAEMON_NOT_FOUND", "Daemon not announced", 404);
    if (!identity.daemons.contains(row)) identity.daemons.add(row);
    await ctx.entities.em.flush().catch((error) => {
      if (!(error instanceof UniqueConstraintViolationException)) throw error;
    });
    return respond.success({ identity: card(identity), daemon: { id: row.id, slug: row.slug } });
  });
