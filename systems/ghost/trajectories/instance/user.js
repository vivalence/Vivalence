import paladin, { lifecycle } from "@vivalence/paladin";
import { Connection } from "@vivalence/typology";
import * as jose from "jose";

const ACTIONS = ["signup", "login", "password"];

const operator = (secret) =>
  new jose.SignJWT({ type: "operator" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("2m")
    .sign(new TextEncoder().encode(secret));

export async function user(ctx) {
  const [action, username, password] = ctx.signal.params ?? [];
  if (!ACTIONS.includes(action) || !username || !password) {
    return (ctx.effect = { error: "usage: /instance/user <signup|login|password> <username> <password>" });
  }
  await lifecycle.mount(paladin.instance);
  const proof = action === "password" ? { operator: await operator(paladin.secret.get("SECRET_VIVA_JWT")) } : {};
  ctx.effect = await new Connection(paladin.instance.runtime.statics.remote).call(`/lighthouse/${action}`, {
    ...proof,
    username,
    ...(password && { password }),
  });
}
