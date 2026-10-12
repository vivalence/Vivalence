import paladin, { lifecycle } from "@vivalence/paladin";
import { Connection, v, Vector } from "@vivalence/typology";
import * as jose from "jose";

const ACTIONS = ["signup", "login", "password"];

const operator = (secret) =>
  new jose.SignJWT({ type: "operator" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("2m")
    .sign(new TextEncoder().encode(secret));

async function effect(ctx) {
  const [action, username, password] = ctx.signal.body;
  if (!ACTIONS.includes(action) || !username || !password) {
    return { error: "usage: /instance/user <signup|login|password> <username> <password>" };
  }
  await lifecycle.mount(paladin.instance);
  const proof = action === "password" ? { operator: await operator(paladin.secret.get("SECRET_VIVA_JWT")) } : {};
  return new Connection(paladin.instance.runtime.statics.remote).call(`/lighthouse/${action}`, {
    ...proof,
    username,
    ...(password && { password }),
  });
}

export const user = new Vector().open(
  {
    nature: "/instance/user",
    valence: "signup, login or reset a password against the mounted instance's runtime. Example: viva instance/user signup beef hunter2",
    schema: v.object({
      action: v.string().desc("signup | login | password. Example: signup"),
      username: v.string().desc("Example: beef"),
      password: v.string().desc("Example: hunter2"),
    }),
  },
  effect,
);
