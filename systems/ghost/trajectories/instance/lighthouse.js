import paladin, { lifecycle } from "@vivalence/paladin";
import { Connection } from "@vivalence/typology";
import * as jose from "jose";

const operator = (secret) =>
  new jose.SignJWT({ type: "operator" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("2m")
    .sign(new TextEncoder().encode(secret));

export async function lighthouse(ctx) {
  const [action, username, password] = ctx.signal.params ?? [];
  if (!["signup", "login", "password"].includes(action) || !username || !password) {
    return (ctx.effect = { error: "usage: /instance/lighthouse <signup|login|password> <username> <password>" });
  }
  await lifecycle.mount(paladin.instance);
  const proof = action === "password" ? { operator: await operator(paladin.secret.get("SECRET_VIVA_JWT")) } : {};
  ctx.effect = await new Connection(paladin.instance.lighthouse.statics.remote).call(
    `/auth/${action}`,
    { ...proof, username, password },
  );
}
