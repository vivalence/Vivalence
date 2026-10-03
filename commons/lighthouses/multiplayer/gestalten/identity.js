import * as argon2 from "argon2";
import * as jose from "jose";

const ACCESS_TTL = "1d";
const REFRESH_TTL = "180d";
const OPERATOR_TTL = "2m";

const refuse = (ctx, code, message) => {
  ctx.response.status = 401;
  ctx.response.body = { status: "ERROR", error: { code, message } };
};

export function signer(ctx) {
  const key = new TextEncoder().encode(ctx.mask.secrets.jwt);
  const sign = (payload, expiration) =>
    new jose.SignJWT(payload).setProtectedHeader({ alg: "HS256" }).setIssuedAt().setExpirationTime(expiration).sign(key);
  return {
    access: (identity) => sign({ id: identity.id, type: "access" }, ACCESS_TTL),
    refresh: (identity) => sign({ id: identity.id, type: "refresh" }, REFRESH_TTL),
    operator: () => sign({ type: "operator" }, OPERATOR_TTL),
    verify: async (token, type) => {
      const payload = await jose.jwtVerify(token, key).then((result) => result.payload).catch(() => null);
      return payload?.type === type ? payload : null;
    },
  };
}

export async function identify(ctx, { username, password }) {
  if (!username || !password) return null;
  const identity = await ctx.entities.identity
    .createQueryBuilder("i")
    .where(`json_extract(i.authentication, '$.credentials.username') = ?`, [username])
    .getSingleResult();
  if (!identity?.authentication?.credentials?.password) return null;
  const valid = await argon2.verify(identity.authentication.credentials.password, password);
  return valid ? identity : null;
}

export async function bearer(ctx, refresh) {
  const payload = await signer(ctx).verify(refresh, "refresh");
  if (!payload) return null;
  const identity = await ctx.entities.identity.findOne({ id: payload.id });
  return identity?.authentication?.tokens?.refresh === refresh ? identity : null;
}

export function authenticate() {
  return async (ctx, next) => {
    const header = ctx.request.headers?.get("authorization");
    const token = header?.startsWith("Bearer ") ? header.split(" ")[1] : ctx.request.url.searchParams?.get("token");
    if (!token) return refuse(ctx, "MISSING_TOKEN", "Authorization header or token param required");
    const payload = await signer(ctx).verify(token, "access");
    if (!payload) return refuse(ctx, "INVALID_TOKEN", "Invalid or expired token");
    ctx.identity = await ctx.entities.identity.findOne({ id: payload.id });
    if (!ctx.identity) return refuse(ctx, "IDENTITY_NOT_FOUND", "Identity not found");
    await next();
  };
}
