import paladin from "@vivalence/paladin";
import { Connection } from "@vivalence/typology";
import { envfile } from "../../belt/index.js";
import { register, specs } from "./target.js";
import { Init } from "./Init.jsx";

const GROUPS = (rows) => {
  const order = [];
  const held = new Map();
  for (const row of rows) {
    const title = row.group ?? "other";
    if (!held.has(title)) (held.set(title, []), order.push(title));
    held.get(title).push(row);
  }
  return order.map((title) => ({ title, fields: held.get(title) }));
};

// what the instance still owes. the record holds one row per consumer SITE — right for the
// doctor, wrong for a prompt — so one row per key here.
const owed = () => {
  const held = new Map();
  for (const row of paladin.check.environment(paladin.instance)) {
    if (!row.value && !held.has(row.key)) held.set(row.key, row);
  }
  // check reports verdicts, not values — the default lives in the schema the declaration exported.
  const schema = paladin.instance.environment ?? {};
  return GROUPS([...held.values()].map((row) => ({ ...row, default: schema[row.key]?.default ?? "" })));
};

const enroll = async () => {
  try {
    return { instance: await register(), note: null };
  } catch (error) {
    return { instance: null, note: error.message };
  }
};

const remote = () => new Connection(paladin.instance.lighthouse.statics.remote);

const signup = async (values) => {
  try {
    return await remote().call("/auth/signup", values);
  } catch (error) {
    if (error.context?.response?.body?.error?.code !== "USERNAME_EXISTS") throw error;
    return await remote().call("/auth/login", values);
  }
};

const poll = async (username, password) => {
  let refusal;
  for (let attempt = 0; attempt < 30; attempt++) {
    try {
      return await signup({ username, password });
    } catch (error) {
      refusal = error;
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }
  throw refusal;
};

export async function init(ctx) {
  if (!paladin.scope.instance) {
    return (ctx.effect = { error: "no instance mounted — set VIVA_INSTANCE_MOUNT" });
  }

  const mount = paladin.scope.instance.absolute;
  const file = paladin.scope.instance.branch(".env");
  // remount, not mount: mount is fn.once, and init is the verb that must see current truth.
  await paladin.remount();

  // first run: author the .env from the schema — prose, groups and defaults — then only what is
  // still blank is worth asking a human. same move as ledger/init.
  const scaffolded = !(await paladin.read.text(file).catch(() => null));
  if (scaffolded && Object.keys(paladin.instance.environment ?? {}).length) {
    await paladin.state.text(file, envfile.scaffold(paladin.instance.environment));
    await paladin.remount();
  }

  const pages = owed();
  const fill = pages.flatMap((group) => group.fields.map((row) => row.key));

  // written .env → fresh hydration, so the boot below sees the addresses just answered.
  const commit = async (values) => {
    await paladin.state.env(file, values);
    await paladin.remount();
    return { env: "written", filled: Object.keys(values) };
  };

  const [username, password] = ctx.signal.params ?? [];
  if (username && password) {
    if (fill.length) return (ctx.effect = { mount, env: "incomplete", fill });
    const enrolled = await enroll();
    const held = await paladin.ledger.boot(specs("all", { attachment: "piped", instance: enrolled.instance }));
    try {
      ctx.effect = {
        mount,
        ...(enrolled.note ? { note: enrolled.note } : {}),
        signup: await poll(username, password),
      };
    } finally {
      await Promise.all(held.map((process) => process.kill()));
    }
    return;
  }

  if (!ctx.interactive || !ctx.view) {
    return (ctx.effect = fill.length
      ? { mount, env: scaffolded ? "scaffolded" : "incomplete", fill, next: `fill ${file.absolute}, then: viva instance/init` }
      : { mount, env: "present", next: "viva instance/init <username> <password>" });
  }

  let held = [];
  const boot = async () => {
    const enrolled = await enroll();
    held = await paladin.ledger.boot(specs("all", { attachment: "piped", instance: enrolled.instance }));
    return held;
  };
  const teardown = () => Promise.all(held.map((process) => process.kill()));

  ctx.effect = {
    mount,
    ...(await ctx.view.scroll.render({ pages, commit, boot, signup, teardown }, null, Init)),
  };
}
