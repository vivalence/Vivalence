import * as jose from "jose";
import { Connection, v, Vector } from "@vivalence/typology";
import paladin from "../../../mod.js";
import { factory as mount } from "../../../instance/factory.js";

const Credentials = v.object({
  username: v.string().desc("the user's username. Example: beef"),
  password: v.string().desc("the user's password — for /password, the new one. Example: hunter2"),
});

const operator = (secret) =>
  new jose.SignJWT({ type: "operator" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("2m")
    .sign(new TextEncoder().encode(secret));

const called = (route, proof) => async (ctx) => {
  const [username, password] = ctx.signal.body;
  if (!username || !password) throw new Error(`usage: viva instance/lighthouse${route} <username> <password>`);
  await mount(paladin.instance);
  return new Connection(paladin.instance.runtime.statics.remote).call(`/lighthouse${route}`, { ...(await proof()), username, password });
};

export const lighthouse = new Vector()
  .open(
    {
      nature: "/instance/lighthouse/signup",
      valence: "sign a user up against the mounted instance's runtime. Example: viva instance/lighthouse/signup beef hunter2",
      input: Credentials,
    },
    called("/signup", () => ({})),
  )
  .open(
    {
      nature: "/instance/lighthouse/signin",
      valence: "sign a user in against the mounted instance's runtime — the session's tokens. Example: viva instance/lighthouse/signin beef hunter2",
      input: Credentials,
    },
    called("/login", () => ({})),
  )
  .open(
    {
      nature: "/instance/lighthouse/password",
      valence: "reset a user's password against the mounted instance's runtime, signed as the operator. Example: viva instance/lighthouse/password beef hunter3",
      input: Credentials,
    },
    called("/password", async () => ({ operator: await operator(paladin.secret.get("SECRET_VIVA_JWT")) })),
  );
