import * as dotenv from "@std/dotenv";
import { Connection, v, Vector } from "@vivalence/typology";
import paladin from "../../../mod.js";
import { factory as mount } from "../../../instance/factory.js";
import { instance as populate } from "../../../paladin/lifecycle.js";
import { instance } from "../belt/index.js";
import * as views from "../views/index.js";

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

const owed = (rows) => {
  const held = new Map();
  const wrong = (row) => paladin.check.wrong.includes(row.verdict);
  for (const row of rows) {
    if (row.value && row.verdict !== "INVALID") continue;
    const prior = held.get(row.key);
    if (!prior || (wrong(row) && !wrong(prior))) held.set(row.key, row);
  }
  const schema = paladin.instance.environment?.properties ?? {};
  return GROUPS(
    [...held.values()].map((row) => ({
      ...row,
      default: row.verdict === "INVALID" && !row.key.startsWith("SECRET_") ? row.value : paladin.envfile.fallback(schema[row.key]),
    })),
  );
};

const invalidated = (rows) => {
  const held = new Map();
  for (const row of rows) if (row.verdict === "INVALID" && !held.has(row.key)) held.set(row.key, { key: row.key, reason: row.reason });
  return [...held.values()];
};

const ADMIN = {
  title: "create admin",
  pages: [{
    title: "admin",
    fields: [
      { name: "username", label: "username", kind: "text", initial: "" },
      { name: "password", label: "password", kind: "password", initial: "" },
    ],
  }],
  actions: ["commit", "skip"],
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
    return { instance: await instance.register(), note: null };
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

const settled = (work) => work.then((value) => ({ status: "fulfilled", value }), (reason) => ({ status: "rejected", reason }));

async function effect(ctx) {
  const home = paladin.instance.home.absolute;
  const file = paladin.instance.home.branch(".env");
  await mount(populate(paladin));

  const absent = !(await paladin.read.text(file).catch(() => null));
  const owing = () =>
    owed(paladin.check.environment(paladin.instance)).some((group) => group.fields.some((row) => paladin.check.wrong.includes(row.verdict)));
  const scaffolded = absent && Object.keys(paladin.instance.environment?.properties ?? {}).length > 0 && owing();
  if (scaffolded) {
    await paladin.state.text(file, paladin.envfile.scaffold(paladin.instance.environment));
    await mount(populate(paladin));
  }
  const minted = paladin.envfile.mint(paladin.instance.environment, await dotenv.load({ envPath: file.absolute }));
  if (Object.keys(minted).length) {
    await paladin.state.env(file, minted);
    await mount(populate(paladin));
  }

  const rows = paladin.check.environment(paladin.instance);
  const pages = owed(rows);
  const fill = pages.flatMap((group) => group.fields.filter((row) => paladin.check.wrong.includes(row.verdict)).map((row) => row.key));
  const invalid = invalidated(rows);
  const incomplete = (env) => ({ mount: home, env, fill, ...(invalid.length ? { invalid } : {}), next: `fill ${file.absolute}, then: viva instance/install` });

  const commit = async (values) => {
    await paladin.state.env(file, values);
    await mount(populate(paladin));
    return { env: "written", filled: Object.keys(values) };
  };

  const [username, password] = ctx.signal.body;
  if (username && password) {
    if (fill.length) return incomplete("incomplete");
    const alive = await instance.reached(paladin.instance.runtime.statics.remote);
    const enrolled = alive ? { instance: null, note: null } : await enroll();
    const die = alive ? instance.standing : await paladin.ledger.boot(instance.specs("all"), { instance: enrolled.instance, attachment: "piped" });
    try {
      await die.integrate();
      return {
        mount: home,
        lighthouse: alive ? "reached" : "booted",
        ...(enrolled.note ? { note: enrolled.note } : {}),
        signup: await signup({ username, password }),
      };
    } finally {
      await die.disintegrate();
    }
  }

  if (!ctx.hold) {
    return fill.length ? incomplete(scaffolded ? "scaffolded" : "incomplete") : { mount: home, env: "present", next: "viva instance/install <username> <password>" };
  }

  let die = null;
  const boot = async () => {
    if (await instance.reached(paladin.instance.runtime.statics.remote)) return (die = instance.standing);
    const enrolled = await enroll();
    die = await paladin.ledger.boot(instance.specs("all"), { instance: enrolled.instance, attachment: "piped" });
    await die.integrate();
    return die;
  };
  const teardown = () => (die === null ? Promise.resolve() : die.disintegrate());

  const env = pages.length ? await ctx.hold(views.form, { title: "environment", pages: pages.map(page), actions: ["commit", "skip"] }) : { action: "skip" };
  if (env.aborted) return { mount: home, aborted: true };
  const written = env.action === "commit" ? await commit(env.values) : null;

  const booted = await settled(boot());
  if (booted.status === "rejected") {
    await teardown();
    return { mount: home, status: "failed", error: booted.reason.message, pids: [] };
  }
  const pids = booted.value.good.processes.map((process) => process.child.pid);

  const admin = await ctx.hold(views.form, ADMIN);
  const enlisted = admin.aborted ? null : await settled(signup(admin.values));

  await ctx.hold(views.confirm, {
    label: `instance up — ${pids.length} processes · admin ${enlisted === null ? "(skipped)" : admin.values.username}${enlisted?.status === "rejected" ? ` ✕ ${enlisted.reason.message}` : ""} — stop and exit?`,
    initial: true,
  });
  await teardown();
  return {
    mount: home,
    status: "installed",
    ...(written === null ? {} : written),
    ...(enlisted === null ? {} : { signup: enlisted.status === "fulfilled" ? enlisted.value : { error: enlisted.reason.message } }),
    pids,
  };
}

export const install = new Vector().open(
  {
    nature: "/instance/install",
    valence: "first run of the mounted instance — seed .env; then the form (or <user> <pass>) boots, signs up the admin, tears down. Example: viva instance/install beef hunter2",
    input: v.object({
      username: v.string().desc("the admin's username. Example: beef").optional(),
      password: v.string().desc("the admin's password. Example: hunter2").optional(),
    }),
  },
  effect,
);
