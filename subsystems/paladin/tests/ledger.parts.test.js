import { describe, it } from "@std/testing/bdd";
import { expect } from "@std/expect";
import { dirname, join } from "@std/path";
import { Path } from "@vivalence/typology";
import { Paladin } from "../paladin/prototype.js";
import { factories, lifecycle } from "../typology.js";

const ENVIRONMENT = { type: "object", properties: { VIVA_PROBE_A: { type: "string", description: "a" } } };
const DATAMAP = { module: "@commons/datamap/libsql" };
const daemon = { manifest: { type: "daemon", slug: "probe", version: "0.0.1" }, modes: [] };

const world = async (files, pairs = {}) => {
  const root = await Deno.makeTempDir({ prefix: "ledger-parts-" });
  for (const [name, body] of Object.entries(files)) {
    await Deno.mkdir(dirname(join(root, name)), { recursive: true });
    await Deno.writeTextFile(join(root, name), typeof body === "string" ? body : JSON.stringify(body, null, 2));
  }
  const paladin = new Paladin();
  paladin.scopes([
    ["ledger", () => true, () => new Path(join(root, "ledger"))],
    ["instance", () => true, () => new Path(join(root, "instance"))],
    ["mountpoint", () => true, () => new Path(join(root, "mountpoint"))],
  ]);
  for (const [key, value] of Object.entries(pairs)) paladin.env.set(key, value, "flag");
  return { root, paladin };
};

describe("ledger parts — a top-level slot is its content, or a path to it, or a ${KEY} naming either", () => {
  it("a relative path reads beside the recipe, an absolute one reads where it says", async () => {
    const { root, paladin } = await world({ "ledger/environment.json": ENVIRONMENT, "elsewhere/datamap.json": DATAMAP });
    await Deno.writeTextFile(join(root, "ledger/ledger.viva.json"), JSON.stringify({ environment: "./environment.json", datamap: join(root, "elsewhere/datamap.json") }));
    const declaration = await paladin.ledger.recipe();
    expect(declaration.environment).toEqual(ENVIRONMENT);
    expect(declaration.datamap).toEqual(DATAMAP);
  });

  it("${KEY} resolves before the parse — its value is a path, or the content itself", async () => {
    const { root, paladin } = await world(
      { "ledger/ledger.viva.json": { environment: "${VIVA_PROBE_ENVIRONMENT}", datamap: "${VIVA_PROBE_DATAMAP}" }, "parts/environment.json": ENVIRONMENT },
      { VIVA_PROBE_DATAMAP: JSON.stringify(DATAMAP) },
    );
    paladin.env.set("VIVA_PROBE_ENVIRONMENT", join(root, "parts/environment.json"), "flag");
    const declaration = await paladin.ledger.recipe();
    expect(declaration.environment).toEqual(ENVIRONMENT);
    expect(declaration.datamap).toEqual(DATAMAP);
  });

  it("an unset ${KEY} throws naming the key; a missing file throws naming the path", async () => {
    const unset = await world({ "ledger/ledger.viva.json": { environment: "${VIVA_PROBE_NOWHERE}" } });
    await expect(unset.paladin.ledger.recipe()).rejects.toThrow(/environment: VIVA_PROBE_NOWHERE unset/);
    const missing = await world({ "ledger/ledger.viva.json": { environment: "./gone.json" } });
    await expect(missing.paladin.ledger.recipe()).rejects.toThrow(/environment: "\.\/gone\.json" → .*\/ledger\/gone\.json — no such file/);
  });

  it("records: absent is the file beside the ledger; a declared path is written there; inline reads and refuses a write", async () => {
    const absent = await world({ "ledger/ledger.viva.json": {} });
    await absent.paladin.ledger.instances.write("probe", { mount: "/probe" });
    expect(JSON.parse(await Deno.readTextFile(join(absent.root, "ledger/instances.json"))).probe.mount).toBe("/probe");

    const declared = await world({ "ledger/ledger.viva.json": { instances: "../records/instances.json" }, "records/instances.json": {} });
    await declared.paladin.ledger.instances.write("probe", { mount: "/probe" });
    expect(JSON.parse(await Deno.readTextFile(join(declared.root, "records/instances.json"))).probe.mount).toBe("/probe");

    const inline = await world({ "ledger/ledger.viva.json": { instances: { held: { mount: "/held" } }, registry: "${VIVA_PROBE_REGISTRY}" } }, { VIVA_PROBE_REGISTRY: '{ "@tapped": { "slug": "tapped", "mount": "/tapped" } }' });
    expect((await inline.paladin.ledger.instances.read("held")).mount).toBe("/held");
    expect(await inline.paladin.ledger.registry.tapped()).toEqual({ "@tapped": { slug: "tapped", mount: "/tapped" } });
    await expect(inline.paladin.ledger.instances.write("probe", { mount: "/probe" })).rejects.toThrow(/instances: inline .* read-only/);
    await expect(inline.paladin.ledger.registry.write({})).rejects.toThrow(/registry: inline .*"\$\{VIVA_PROBE_REGISTRY\}".* read-only/);
  });

  it("a declared record whose file is gone throws naming it — no silent empty", async () => {
    const { paladin } = await world({ "ledger/ledger.viva.json": { instances: "./kept.json" } });
    await expect(paladin.ledger.instances.list()).rejects.toThrow(/instances: .*\/ledger\/kept\.json \("\.\/kept\.json"\) — no such file/);
  });

  it("the instance reads its parts the same way; a record never falls through to it", async () => {
    const { paladin } = await world({
      "ledger/ledger.viva.json": { instances: "./instances.json", datamap: "./datamap.json" },
      "ledger/datamap.json": DATAMAP,
      "ledger/instances.json": {},
      "instance/instance.viva.json": { manifest: { type: "instance", slug: "probe", version: "0.0.1" }, daemons: [daemon], environment: "./environment.json" },
      "instance/environment.json": ENVIRONMENT,
    });
    const instance = await factories.instance(lifecycle.paladin.instance(paladin));
    expect(Object.keys(instance.environment.properties)).toEqual(["VIVA_PROBE_A"]);
    expect(instance.datamap.module).toBe("@commons/datamap/libsql");
    expect(instance.inherited).toEqual(["datamap"]);
  });
});
