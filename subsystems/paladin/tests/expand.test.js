import { Path, specimen } from "@vivalence/typology";
import { factories, lifecycle, Paladin } from "@vivalence/paladin/typology";

const { describe, it, expect } = specimen;

const HELLO = new URL("../../../commons/instances/hello-world", import.meta.url).pathname;
const SHIPPED = new URL("../../../commons/ledger", import.meta.url).pathname;

const RECIPE = {
  manifest: { type: "instance", slug: "probe", version: "0.0.1" },
  runtime: {
    manifest: { slug: "runtime" },
    statics: { serve: "${VIVA_PROBE_SERVE}", remote: "${PUBLIC_VIVA_PROBE_REMOTE}", port: 2501 },
    secrets: { jwt: "${SECRET_VIVA_PROBE_JWT}" },
  },
  datamap: { module: "@commons/datamap/libsql" },
  hallucinators: [
    { module: "@commons/hallucinator/anthropic", secrets: { key: "${SECRET_VIVA_PROBE_A}" } },
    { module: "@commons/hallucinator/openrouter", secrets: { key: "${SECRET_VIVA_PROBE_B}" } },
  ],
  clients: [{ manifest: { type: "client", slug: "anima" }, statics: { serve: "${VIVA_PROBE_CLIENT}" } }],
  daemons: [
    {
      manifest: { type: "daemon", slug: "probe", version: "0.0.1" },
      modes: ["@commons/demo/hello-world", { module: "@commons/editor/media", statics: { root: "${VIVA_PROBE_ROOT}" } }],
      consume: { reader: { module: "@commons/service/reader", statics: { remote: "${VIVA_PROBE_SERVE}" } } },
    },
  ],
  environment: {
    type: "object",
    required: ["VIVA_PROBE_SERVE"],
    properties: {
      VIVA_PROBE_SERVE: { type: "string", description: "serve" },
      PUBLIC_VIVA_PROBE_REMOTE: { type: "string", description: "remote", default: "${VIVA_PROBE_SERVE}" },
      SECRET_VIVA_PROBE_JWT: { type: "string", description: "jwt" },
      SECRET_VIVA_PROBE_A: { type: "string", description: "a" },
      SECRET_VIVA_PROBE_B: { type: "string", description: "b" },
      VIVA_PROBE_CLIENT: { type: "string", description: "client" },
      VIVA_PROBE_ROOT: { type: "string", description: "root" },
    },
  },
};

const mk = (pairs = {}, secrets = {}) => {
  const paladin = new Paladin();
  for (const [key, value] of Object.entries(pairs)) paladin.env.set(key, value, "flag");
  for (const [key, value] of Object.entries(secrets)) paladin.secret.set(key, value, "flag");
  return paladin;
};

const mount = async (paladin, home, recipe = null) => {
  const ledger = await Deno.makeTempDir({ prefix: "expand-ledger-" });
  if (recipe) for await (const entry of Deno.readDir(recipe)) await Deno.copyFile(`${recipe}/${entry.name}`, `${ledger}/${entry.name}`);
  paladin.scopes([
    ["ledger", () => true, () => new Path(ledger)],
    ["instance", () => true, () => new Path(home)],
    ["mountpoint", () => true, () => new Path("/mountpoint")],
  ]);
  return await factories.instance(lifecycle.paladin.instance(paladin));
};

const shelf = async (recipe) => {
  const home = await Deno.makeTempDir({ prefix: "expand-instance-" });
  await Deno.writeTextFile(`${home}/instance.viva.json`, JSON.stringify(recipe, null, 2));
  return home;
};

const keys = (rows) => rows.flatMap((row) => row.read ?? [row.key]).sort();
const body = ({ environment, manifest, source, ...rest }) => rest;

describe("paladin.expand — a ${KEY} is read through the strata and recorded, no thunk fires", () => {
  it("a whole-string reference keeps the value's type; a blank one is null and named unset", () => {
    const paladin = mk({ VIVA_PROBE_SERVE: "http://localhost:2501/", VIVA_PROBE_PORT: 2501 }, { SECRET_VIVA_PROBE_A: "shh" });
    const record = [];
    const held = paladin.expand(
      { serve: "${VIVA_PROBE_SERVE}", port: "${VIVA_PROBE_PORT}", key: "${SECRET_VIVA_PROBE_A}", gone: "${SECRET_VIVA_PROBE_B}", plain: "kept", count: 3 },
      record,
      "runtime",
    );
    expect(held).toEqual({ serve: "http://localhost:2501/", port: 2501, key: "shh", gone: null, plain: "kept", count: 3 });
    expect(record).toEqual([
      { at: "runtime.serve", read: ["VIVA_PROBE_SERVE"], unset: [] },
      { at: "runtime.port", read: ["VIVA_PROBE_PORT"], unset: [] },
      { at: "runtime.key", read: ["SECRET_VIVA_PROBE_A"], unset: [] },
      { at: "runtime.gone", read: ["SECRET_VIVA_PROBE_B"], unset: ["SECRET_VIVA_PROBE_B"] },
    ]);
  });

  it("a reference inside a string interpolates as text, a blank one as empty, and every key it names is recorded", () => {
    const paladin = mk({ VIVA_PROBE_ORIGIN: "http://localhost:2501" });
    const record = [];
    const held = paladin.expand({ serve: "${VIVA_PROBE_ORIGIN}/${VIVA_PROBE_PATH}" }, record, "runtime.statics");
    expect(held.serve).toBe("http://localhost:2501/");
    expect(record).toEqual([{ at: "runtime.statics.serve", read: ["VIVA_PROBE_ORIGIN", "VIVA_PROBE_PATH"], unset: ["VIVA_PROBE_PATH"] }]);
  });

  it("arrays label by index, objects by key; without a record nothing is recorded and the value still expands", () => {
    const paladin = mk({ VIVA_PROBE_SERVE: "x" });
    const record = [];
    paladin.expand([{ statics: { serve: "${VIVA_PROBE_SERVE}" } }], record, "hallucinators");
    expect(record.map((row) => row.at)).toEqual(["hallucinators[0].statics.serve"]);
    expect(paladin.expand({ serve: "${VIVA_PROBE_SERVE}" })).toEqual({ serve: "x" });
  });

  it("expand has no scan — the mount's record is the only reading of a recipe", () => {
    expect(mk().expand.scan).toBeUndefined();
  });
});

describe("the read — one recipe fixture, the mount's record", () => {
  it("the file stays as authored — instance.raw keeps every ${KEY}, the record holds what was read", async () => {
    const paladin = mk({ VIVA_PROBE_SERVE: "http://localhost:2501/" }, { SECRET_VIVA_PROBE_A: "shh" });
    const instance = await mount(paladin, await shelf(RECIPE));
    expect(instance.raw.runtime.statics.serve).toBe("${VIVA_PROBE_SERVE}");
    expect(instance.raw.hallucinators[0].secrets.key).toBe("${SECRET_VIVA_PROBE_A}");
    expect(instance.requirements[0]).toEqual({ at: "runtime.statics.serve", read: ["VIVA_PROBE_SERVE"], unset: [] });
    expect(instance.raw.daemons[0].mountpoint).toBeUndefined();
    expect(JSON.stringify(body(instance.raw))).not.toContain("shh");
  });

  it("an unset reference the schema requires is a REQUIRED row at its path; one outside required is not owed", async () => {
    const paladin = mk();
    const instance = await mount(paladin, await shelf(RECIPE));
    const rows = Object.fromEntries(paladin.check.environment(instance).map((row) => [`${row.key}@${row.at}`, row.verdict]));
    expect(rows["VIVA_PROBE_SERVE@runtime.statics.serve"]).toBe("REQUIRED");
    expect(rows["VIVA_PROBE_SERVE@daemon[probe].consume.reader.statics.remote"]).toBe("REQUIRED");
    expect(rows["VIVA_PROBE_CLIENT@client[anima].statics.serve"]).toBe("optional");
    expect(rows["SECRET_VIVA_PROBE_A@hallucinators[0].secrets.key"]).toBe("optional");
  });
});

// captured 10-07 from today's thunk recipe (commons/instances/hello-world/instance.viva.js) mounted through
// populate.recipe + hydrate under the same flags as below — the record and the doctor's rows, verbatim
const THUNKED = [
  { at: "runtime.statics.serve", read: ["VIVA_RUNTIME_SERVE"], unset: [] },
  { at: "runtime.statics.remote", read: ["PUBLIC_VIVA_RUNTIME_REMOTE"], unset: [] },
  { at: "lighthouse.statics.remote", read: ["PUBLIC_VIVA_LIGHTHOUSE_REMOTE"], unset: ["PUBLIC_VIVA_LIGHTHOUSE_REMOTE"] },
  { at: "hallucinators[0].secrets.key", read: ["SECRET_VIVA_ANTHROPIC_API_KEY"], unset: [] },
  { at: "hallucinators[1].secrets.key", read: ["SECRET_VIVA_OPENROUTER_API_KEY"], unset: ["SECRET_VIVA_OPENROUTER_API_KEY"] },
  { at: "client[anima].statics.serve", read: ["VIVA_CLIENT_ANIMA_SERVE"], unset: ["VIVA_CLIENT_ANIMA_SERVE"] },
  { at: "service[multiplayer].secrets.jwt", read: ["SECRET_VIVA_JWT"], unset: ["SECRET_VIVA_JWT"] },
];
const DOCTORED = [
  { key: "PUBLIC_VIVA_LIGHTHOUSE_REMOTE", at: "lighthouse.statics.remote", verdict: "REQUIRED", required: true },
  { key: "PUBLIC_VIVA_RUNTIME_REMOTE", at: "runtime.statics.remote", verdict: "ok", required: true },
  { key: "SECRET_VIVA_ANTHROPIC_API_KEY", at: "hallucinators[0].secrets.key", verdict: "ok", required: false },
  { key: "SECRET_VIVA_JWT", at: "service[multiplayer].secrets.jwt", verdict: "REQUIRED", required: true },
  { key: "SECRET_VIVA_OPENROUTER_API_KEY", at: "hallucinators[1].secrets.key", verdict: "optional", required: false },
  { key: "VIVA_CLIENT_ANIMA_ORIGIN", at: null, verdict: "REQUIRED", required: true },
  { key: "VIVA_CLIENT_ANIMA_SERVE", at: "client[anima].statics.serve", verdict: "REQUIRED", required: true },
  { key: "VIVA_RUNTIME_ORIGIN", at: null, verdict: "REQUIRED", required: true },
  { key: "VIVA_RUNTIME_SERVE", at: "runtime.statics.serve", verdict: "ok", required: true },
];
const LEDGERED = [
  { key: "SECRET_VIVA_DEEPGRAM_API_KEY", at: null, verdict: "documented", required: false },
  { key: "SECRET_VIVA_ELEVENLABS_API_KEY", at: null, verdict: "documented", required: false },
  { key: "VIVA_REPOSITORY_MOUNT", at: null, verdict: "REQUIRED", required: true },
];
const FLAGS = { VIVA_RUNTIME_SERVE: "http://localhost:2501/", PUBLIC_VIVA_RUNTIME_REMOTE: "${VIVA_RUNTIME_SERVE}" };
const SECRETS = { SECRET_VIVA_ANTHROPIC_API_KEY: "sk-probe" };
const DYING = /^(lighthouse|service\[multiplayer\])\./;
const MOVED = (row) => (row.at === "service[multiplayer].secrets.jwt" ? { ...row, at: "lighthouse.secrets.jwt" } : row);

describe("doctor parity — hello-world's thunk record against its instance.viva.json", () => {
  it("the requirements rows are today's, less the lighthouse service, the jwt moved from it to the lighthouse slot", async () => {
    const instance = await mount(mk(FLAGS, SECRETS), HELLO, SHIPPED);
    const kept = THUNKED.filter((row) => !DYING.test(row.at));
    const jwt = MOVED(THUNKED.find((row) => row.at === "service[multiplayer].secrets.jwt"));
    expect(instance.requirements).toEqual([...kept.slice(0, 2), jwt, ...kept.slice(2)]);
  });

  it("the doctor's env rows carry today's verdicts, key by key", async () => {
    const paladin = mk(FLAGS, SECRETS);
    const instance = await mount(paladin, HELLO, SHIPPED);
    const rows = paladin.check.environment(instance).map(({ key, at, verdict, required }) => ({ key, at, verdict, required }));
    const kept = DOCTORED.filter((row) => row.key !== "PUBLIC_VIVA_LIGHTHOUSE_REMOTE").map(MOVED);
    expect(rows).toEqual([...kept, ...LEDGERED].sort((a, b) => (a.key < b.key ? -1 : 1)));
  });
});
