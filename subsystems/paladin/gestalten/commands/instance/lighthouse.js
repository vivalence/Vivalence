import * as jose from "jose";
import { Connection, v, Vector } from "@vivalence/typology";
import paladin from "../../../mod.js";
import { factory as mount } from "../../../instance/factory.js";
import * as views from "../views/index.js";

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
  await mount(paladin);
  return new Connection(paladin.instance.runtime.statics.remote).call(`/lighthouse${route}`, { ...(await proof()), username, password });
};

const shown = (ctx, answer) =>
  ctx.signal.flags.json === true ? answer : { status: answer.status, user: answer.user };

const PASSWORD = {
  title: "sign up",
  pages: [{
    title: "password",
    fields: [{ name: "password", label: "password", kind: "password", initial: "" }],
  }],
  actions: ["commit", "abort"],
};

const signup = async (ctx) => {
  const [username, password] = ctx.signal.body;
  if (!username) throw new Error("usage: viva instance/lighthouse/signup <username> [password]");
  await mount(paladin);
  const runtime = new Connection(paladin.instance.runtime.statics.remote);
  const traits = paladin.instance.lighthouse.traits;
  const named = !traits.includes("JOINABLE") && !traits.includes("INVITATIONAL");
  if (password && named) {
    await runtime.call("/lighthouse/autosignup", { username });
    const proof = await operator(paladin.secret.get("SECRET_VIVA_JWT"));
    const reset = { operator: proof, username, password };
    return shown(ctx, await runtime.call("/lighthouse/password", reset));
  }
  if (password) return shown(ctx, await runtime.call("/lighthouse/signup", { username, password }));
  if (traits.includes("AUTOSIGNUP")) {
    return shown(ctx, await runtime.call("/lighthouse/autosignup", { username }));
  }
  if (!ctx.hold) {
    throw new Error("instance/lighthouse/signup: this lighthouse needs <username> <password>");
  }
  const asked = await ctx.hold(views.form, PASSWORD);
  if (asked.aborted) return { aborted: true };
  const typed = { username, password: asked.values.password };
  return shown(ctx, await runtime.call("/lighthouse/signup", typed));
};

const signin = async (ctx) => {
  const [username, password] = ctx.signal.body;
  if (!username) throw new Error("usage: viva instance/lighthouse/signin <username> [password]");
  await mount(paladin);
  const runtime = new Connection(paladin.instance.runtime.statics.remote);
  if (password) return shown(ctx, await runtime.call("/lighthouse/login", { username, password }));
  if (!paladin.instance.lighthouse.traits.includes("AUTOSIGNUP")) {
    throw new Error("instance/lighthouse/signin: this lighthouse needs <username> <password>");
  }
  return shown(ctx, await runtime.call("/lighthouse/autosignup", { username }));
};

export const lighthouse = new Vector()
  .open(
    {
      nature: "/instance/lighthouse/signup",
      valence:
        "sign a user up against the mounted instance's runtime, by name alone where the " +
        "lighthouse has AUTOSIGNUP. Example: viva instance/lighthouse/signup beef hunter2",
      input: v.object({
        username: v.string().desc("the user's username. Example: beef"),
        password: v.string().optional().desc("the user's password. Example: hunter2"),
      }),
    },
    signup,
  )
  .open(
    {
      nature: "/instance/lighthouse/signin",
      valence:
        "sign a user in against the mounted instance's runtime, by name alone where the " +
        "lighthouse has AUTOSIGNUP. Example: viva instance/lighthouse/signin beef hunter2",
      input: v.object({
        username: v.string().desc("the user's username. Example: beef"),
        password: v.string().optional().desc("the user's password. Example: hunter2"),
      }),
    },
    signin,
  )
  .open(
    {
      nature: "/instance/lighthouse/password",
      valence: "reset a user's password against the mounted instance's runtime, signed as the operator. Example: viva instance/lighthouse/password beef hunter3",
      input: Credentials,
    },
    called("/password", async () => ({ operator: await operator(paladin.secret.get("SECRET_VIVA_JWT")) })),
  );
