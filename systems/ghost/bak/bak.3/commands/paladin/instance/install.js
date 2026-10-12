import paladin, { lifecycle } from "@vivalence/paladin";
import * as dotenv from "@std/dotenv";
import { Connection, v, Vector } from "@vivalence/typology";
import { reached, register, specs, standing } from "../../../gestalten/belt/instance.js";

const GROUPS = (rows) => {
  const order = [];
  const held = new Map();
  for (const row of rows) {
    const title = row.group ?? "unset";
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
          : paladin.envfile.fallback(schema[row.key]),
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

const ADMIN = {
  title: "admin",
  fields: [
    { name: "username", label: "username", kind: "text", initial: "" },
    { name: "password", label: "password", kind: "password", initial: "" },
  ],
};

const preset = (row) => (row.default === undefined || row.default === null ? "" : String(row.default));

const page = (group) => ({
  title: group.title,
  fields: group.fields.map((row) => ({
    name: row.key,
    label: row.key,
    kind: row.key.startsWith("SECRET_") ? "password" : "text",
    initial: preset(row),
    ...(row.describe === null ? {} : { hint: row.describe }),
  })),
});

const enroll = async () => {
  try {
    return { instance: await register(), note: null };
  } catch (error) {
    return { instance: null, note: error.message };
  }
};

const remote = () => new Connection(paladin.instance.runtime.statics.remote);

const signup = async (values) => {
  try {
    return await remote().call("/lighthouse/signup", values);
  } catch (error) {
    if (error.context?.response?.body?.error?.code !== "USERNAME_EXISTS") throw error;
    return await remote().call("/lighthouse/login", values);
  }
};

async function effect(ctx) {
  const mount = paladin.instance.home.absolute;
  const file = paladin.instance.home.branch(".env");
  // a fresh instance, not the memoized mount: init is the verb that must see current truth.
  await lifecycle.mount(lifecycle.populate.instance(paladin));

  // first run: author the .env from the schema — prose, groups and defaults — then only what is
  // still blank is worth asking a human. same move as ledger/init.
  const absent = !(await paladin.read.text(file).catch(() => null));
  const owing = () =>
    owed(paladin.check.environment(paladin.instance)).some((group) =>
      group.fields.some((row) => paladin.check.wrong.includes(row.verdict)),
    );
  const scaffolded = absent && Object.keys(paladin.instance.environment?.properties ?? {}).length > 0 && owing();
  if (scaffolded) {
    await paladin.state.text(file, paladin.envfile.scaffold(paladin.instance.environment));
    await lifecycle.mount(lifecycle.populate.instance(paladin));
  }
  const minted = paladin.envfile.mint(paladin.instance.environment, await dotenv.load({ envPath: file.absolute }));
  if (Object.keys(minted).length) {
    await paladin.state.env(file, minted);
    await lifecycle.mount(lifecycle.populate.instance(paladin));
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
    next: `fill ${file.absolute}, then: viva instance/install`,
  });

  // written .env → fresh hydration, so the boot below sees the addresses just answered.
  const commit = async (values) => {
    await paladin.state.env(file, values);
    await lifecycle.mount(lifecycle.populate.instance(paladin));
    return { env: "written", filled: Object.keys(values) };
  };

  const [username, password] = ctx.signal.body;
  if (username && password) {
    if (fill.length) return incomplete("incomplete");
    const alive = await reached(paladin.instance.runtime.statics.remote);
    const enrolled = alive ? { instance: null, note: null } : await enroll();
    const die = alive ? standing : await paladin.ledger.boot(specs("all"), { instance: enrolled.instance, attachment: "piped" });
    try {
      await die.integrate();
      return {
        mount,
        lighthouse: alive ? "reached" : "booted",
        ...(enrolled.note ? { note: enrolled.note } : {}),
        signup: await signup({ username, password }),
      };
    } finally {
      await die.disintegrate();
    }
  }

  if (!ctx.view.interactive) {
    return fill.length
      ? incomplete(scaffolded ? "scaffolded" : "incomplete")
      : { mount, env: "present", next: "viva instance/install <username> <password>" };
  }

  let die = null;
  const boot = async () => {
    if (await reached(paladin.instance.runtime.statics.remote)) return (die = standing);
    const enrolled = await enroll();
    die = await paladin.ledger.boot(specs("all"), { instance: enrolled.instance, attachment: "piped" });
    await die.integrate();
    return die;
  };
  const teardown = () => (die === null ? Promise.resolve() : die.disintegrate());

  const env = pages.length
    ? await ctx.view.hold("form", { title: "environment", pages: pages.map(page), actions: ["commit", "skip"] })
    : { action: "skip" };
  if (Object.hasOwn(env, "aborted")) return { mount, aborted: true };
  const written = env.action === "commit" ? await commit(env.values) : null;

  const booted = await ctx.view.hold("pending", { label: "booting the instance", work: boot() });
  if (booted.status === "rejected") {
    await teardown();
    return { mount, status: "failed", error: booted.reason.message, pids: [] };
  }
  const pids = booted.value.good.processes.map((process) => process.child.pid);
  await ctx.view.emit("report", {
    blocks: [{ table: booted.value.good.processes.map((process) => ({ process: process.slug, pid: process.child.pid })), depth: 1 }],
  });

  const admin = await ctx.view.hold("form", { title: "create admin", pages: [ADMIN], actions: ["commit", "skip"] });
  const enlisted = admin.action === "commit"
    ? await ctx.view.hold("pending", { label: `auth/signup ${admin.values.username}`, work: signup(admin.values) })
    : null;

  await ctx.view.hold("report", {
    blocks: [
      { heading: "instance up", note: `${pids.length} processes · admin ${enlisted === null ? "(skipped)" : admin.values.username}` },
      ...(enlisted !== null && enlisted.status === "rejected" ? [{ spans: [{ text: `✕ ${enlisted.reason.message}`, tone: "negative" }], depth: 1 }] : []),
      { spans: [{ text: "enter → stop + exit", tone: "muted" }], depth: 1 },
    ],
  });
  await teardown();
  return {
    mount,
    status: "installed",
    ...(written === null ? {} : written),
    ...(enlisted === null ? {} : { signup: enlisted.status === "fulfilled" ? enlisted.value : { error: enlisted.reason.message } }),
    pids,
  };
}

export const install = new Vector().open(
  {
    nature: "/instance/install",
    valence: "first run of the mounted instance — seed .env; then the wizard (or <user> <pass>) boots, signs up the admin, tears down. Example: viva instance/install beef hunter2",
    schema: v.object({
      username: v.string().desc("the admin's username. Example: beef").optional(),
      password: v.string().desc("the admin's password. Example: hunter2").optional(),
    }),
  },
  effect,
);
