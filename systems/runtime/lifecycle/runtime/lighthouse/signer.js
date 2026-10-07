import * as argon2 from "argon2";
import * as jose from "jose";

const ACCESS_TTL = "1d";
const REFRESH_TTL = "180d";
const OPERATOR_TTL = "2m";

const refuse = (ctx, code, message) => {
  ctx.response.status = 401;
  ctx.response.body = { status: "ERROR", error: { code, message } };
};

export function signer(secret) {
  const key = new TextEncoder().encode(secret);
  const sign = (payload, expiration) =>
    new jose.SignJWT(payload).setProtectedHeader({ alg: "HS256" }).setIssuedAt().setExpirationTime(expiration).sign(key);
  return {
    access: (user) => sign({ id: user.id, type: "access" }, ACCESS_TTL),
    refresh: (user) => sign({ id: user.id, type: "refresh" }, REFRESH_TTL),
    operator: () => sign({ type: "operator" }, OPERATOR_TTL),
    verify: async (token, type) => {
      const payload = await jose.jwtVerify(token, key).then((result) => result.payload).catch(() => null);
      return payload?.type === type ? payload : null;
    },
  };
}

export async function identify({ secret, users }, { username, password }) {
  if (!username || !password) return null;
  const user = await users.byUsername(username);
  if (!user?.authentication?.credentials?.password) return null;
  const valid = await argon2.verify(user.authentication.credentials.password, password);
  return valid ? user : null;
}

export async function bearer({ secret, users }, refresh) {
  const payload = await signer(secret).verify(refresh, "refresh");
  if (!payload) return null;
  const user = await users.findOne({ id: payload.id }, { filters: { user: false } });
  return user?.authentication?.tokens?.refresh === refresh ? user : null;
}

export function authenticate({ secret, users }) {
  return async (ctx, next) => {
    if (ctx.user) return await next();
    const header = ctx.request.headers?.get("authorization");
    const token = header?.startsWith("Bearer ") ? header.split(" ")[1] : ctx.request.url.searchParams?.get("token");
    if (!token) return refuse(ctx, "MISSING_TOKEN", "Authorization header or token param required");
    const payload = await signer(secret).verify(token, "access");
    if (!payload) return refuse(ctx, "INVALID_TOKEN", "Invalid or expired token");
    ctx.user = await users.findOne({ id: payload.id }, { filters: { user: false } });
    if (!ctx.user) return refuse(ctx, "USER_NOT_FOUND", "User not found");
    await next();
  };
}
