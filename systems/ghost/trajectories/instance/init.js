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
const owed = (rows) => {
  const held = new Map();
  const wrong = (row) => paladin.check.wrong.includes(row.verdict);
  for (const row of rows) {
    if (row.value && row.verdict !== "INVALID") continue;
    const prior = held.get(row.key);
    if (!prior || (wrong(row) && !wrong(prior))) held.set(row.key, row);
  }
  // check reports verdicts, not values — the default lives in the schema the declaration exported.
  const schema = paladin.instance.environment?.properties ?? {};
  return GROUPS(
    [...held.values()].map((row) => ({
      ...row,
      default:
        row.verdict === "INVALID" && !row.key.startsWith("SECRET_")
          ? row.value
          : envfile.fallback(schema[row.key]),
    })),
  );
};

const invalidated = (rows) => {
  const held = new Map();
  for (const row of rows) {
    if (row.verdict === "INVALID" && !held.has(row.key)) held.set(row.key, { key: row.key, reason: row.reason });
  }
  return [...held.values()];
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

export async function init(ctx) {
  const mount = paladin.instance.home.absolute;
  const file = paladin.instance.home.branch(".env");
  // remount, not mount: mount is fn.once, and init is the verb that must see current truth.
  await paladin.remount();

  // first run: author the .env from the schema — prose, groups and defaults — then only what is
  // still blank is worth asking a human. same move as ledger/init.
  const scaffolded = !(await paladin.read.text(file).catch(() => null));
  if (scaffolded && Object.keys(paladin.instance.environment?.properties ?? {}).length) {
    await paladin.state.text(file, envfile.scaffold(paladin.instance.environment));
    await paladin.remount();
  }

  const rows = paladin.check.environment(paladin.instance);
  const pages = owed(rows);
  const fill = pages.flatMap((group) =>
    group.fields.filter((row) => paladin.check.wrong.includes(row.verdict)).map((row) => row.key),
  );
  const invalid = invalidated(rows);
  const incomplete = (env) => ({
    mount,
    env,
    fill,
    ...(invalid.length ? { invalid } : {}),
    next: `fill ${file.absolute}, then: viva instance/init`,
  });

  // written .env → fresh hydration, so the boot below sees the addresses just answered.
  const commit = async (values) => {
    await paladin.state.env(file, values);
    await paladin.remount();
    return { env: "written", filled: Object.keys(values) };
  };

  const [username, password] = ctx.signal.params ?? [];
  if (username && password) {
    if (fill.length) return (ctx.effect = incomplete("incomplete"));
    const enrolled = await enroll();
    const die = await paladin.ledger.boot(specs("all"), { instance: enrolled.instance, attachment: "piped" });
    try {
      await die.integrate();
      ctx.effect = {
        mount,
        ...(enrolled.note ? { note: enrolled.note } : {}),
        signup: await signup({ username, password }),
      };
    } finally {
      await die.disintegrate();
    }
    return;
  }

  if (!ctx.interactive || !ctx.view) {
    return (ctx.effect = fill.length
      ? incomplete(scaffolded ? "scaffolded" : "incomplete")
      : { mount, env: "present", next: "viva instance/init <username> <password>" });
  }

  let die = null;
  const boot = async () => {
    const enrolled = await enroll();
    die = await paladin.ledger.boot(specs("all"), { instance: enrolled.instance, attachment: "piped" });
    return die;
  };
  const teardown = () => die?.disintegrate() ?? Promise.resolve();

  ctx.effect = {
    mount,
    ...(await ctx.view.scroll.render({ pages, commit, boot, signup, teardown }, null, Init)),
  };
}
