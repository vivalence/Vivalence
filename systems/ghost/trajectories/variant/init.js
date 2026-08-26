import paladin from "@vivalence/paladin";
import { Connection } from "@vivalence/typology";
import { register, specs } from "./target.js";
import { Init } from "./Init.jsx";

const seed = async () => {
  const env = paladin.scope.variant.branch(".env");
  const held = await paladin.read.text(env).catch(() => null);
  if (held) return { env: "present" };

  const example = await paladin.read.text(paladin.scope.variant.branch(".env.example")).catch(() => null);
  if (!example) return { env: "missing", error: "no .env.example to seed from" };

  await paladin.state.scribe(env, example);
  return {
    env: "created",
    fill: example
      .split("\n")
      .filter((line) => line.includes("=") && !line.startsWith("#"))
      .map((line) => line.split("=")[0]),
  };
};

const remote = () => new Connection(paladin.variant.lighthouse.statics.remote);

const poll = async (username, password) => {
  let refusal;
  for (let attempt = 0; attempt < 30; attempt++) {
    try {
      return await remote().call("/auth/signup", { username, password });
    } catch (error) {
      refusal = error;
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }
  throw refusal;
};

export async function init(ctx) {
  if (!paladin.scope.variant) {
    return (ctx.effect = { error: "no variant mounted — set VIVA_VARIANT_MOUNT" });
  }

  const mount = paladin.scope.variant.absolute;
  const seeded = await seed();
  if (seeded.env !== "present") {
    return (ctx.effect = { mount, ...seeded, next: "fill .env, then: viva variant/init" });
  }

  await paladin.variant.mount();

  const [username, password] = ctx.signal.params ?? [];
  if (username && password) {
    const held = await paladin.ledger.boot(specs("all", { attachment: "piped" }));
    await register();
    try {
      ctx.effect = { mount, ...seeded, signup: await poll(username, password) };
    } finally {
      await Promise.all(held.map((process) => process.kill()));
    }
    return;
  }

  if (!ctx.view) {
    return (ctx.effect = { mount, ...seeded, next: "viva variant/init <username> <password>" });
  }

  let held = [];
  const boot = async () => {
    held = await paladin.ledger.boot(specs("all", { attachment: "piped" }));
    await register();
    return held;
  };
  const signup = (values) => remote().call("/auth/signup", values);
  const teardown = () => Promise.all(held.map((process) => process.kill()));

  ctx.effect = {
    mount,
    ...seeded,
    ...(await ctx.view.scroll.render({ boot, signup, teardown }, null, Init)),
  };
}
