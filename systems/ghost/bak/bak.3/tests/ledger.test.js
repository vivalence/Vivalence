import paladin from "@vivalence/paladin";
import { Path, specimen, v } from "@vivalence/typology";
import { drive } from "./verb.js";

const { describe, it, beforeAll, expect } = specimen;

const COMMONS = new URL("../../../commons", import.meta.url).pathname;

async function author(root, slug, owner) {
  await Deno.mkdir(`${root}/${slug}`, { recursive: true });
  await Deno.writeTextFile(
    `${root}/${slug}/${slug}.viva.js`,
    `export const manifest = { owner: "${owner}", type: "package", slug: "${slug}", version: "0.0.1" };`,
  );
}

describe("viva ledger/{install,doctor} + registry/{tap,untap} + instance/clone", () => {
  let ledger;
  let store;
  const CHECKOUT = { "@commons": { slug: "commons", mount: COMMONS }, "@memo": { slug: "memo", mount: `${COMMONS}/fixtures/memo` } };
  const TAPPED = () => ({ ...CHECKOUT, "@pack": { slug: "pack", mount: "./registry/pack" } });

  beforeAll(async () => {
    ledger = await Deno.makeTempDir({ prefix: "ghost-ledger-" });
    store = `${ledger}/registry`;
    await Deno.mkdir(store);
    Deno.env.set("XDG_CONFIG_HOME", await Deno.makeTempDir({ prefix: "ghost-config-" }));
    paladin.env.delete("VIVA_INSTANCE_MOUNT");
    paladin.env.set("VIVA_REPOSITORY_MOUNT", new URL("../../..", import.meta.url).pathname.replace(/\/$/, ""), "flag");
    paladin.scopes([
      ["ledger", () => true, () => new Path(ledger)],
      ["registry", () => true, () => new Path(store)],
    ]);
    await author(store, "pack", "@pack");
  });

  it("install scaffolds locks/logs/registry/instances/sessions + instances.json + the shell line, and taps every package of commons", async () => {
    const output = await drive(["ledger/install", ledger]);
    expect(output.scaffolded).toEqual(["locks", "logs", "registry", "instances", "sessions"]);
    for (const sub of output.scaffolded) {
      expect((await Deno.stat(`${ledger}/${sub}`)).isDirectory).toBe(true);
    }
    expect(await paladin.read.json(new Path(`${ledger}/instances.json`))).toEqual({});
    expect(output.commons).toBe(COMMONS);
    expect(await paladin.ledger.registry.tapped()).toEqual(CHECKOUT);
    // VIVA_PROCESS_ID is NOT written here — ghost.sh derives it from $PPID, the invoking shell.
    // a `$$` in this file would expand inside ghost.sh, minting a new id on every invocation.
    const config = await Deno.readTextFile(`${Deno.env.get("XDG_CONFIG_HOME")}/viva/env`).catch(() => "");
    expect(config).not.toContain("VIVA_PROCESS_ID");
  });

  it("install clones the canonical ledger recipe beside .env; a second install keeps the one that is there", async () => {
    const recipe = `${ledger}/ledger.viva.json`;
    expect((await Deno.stat(recipe)).isFile).toBe(true);
    await Deno.writeTextFile(recipe, `{ "manifest": { "slug": "mine" } }\n`);
    await drive(["ledger/install", ledger]);
    expect(await Deno.readTextFile(recipe)).toContain(`"slug": "mine"`);
    // put the canonical one back — the rest of this suite reads a ledger that speaks
    await Deno.copyFile(paladin.scope.repository.branch("commons/ledger/ledger.viva.json").absolute, recipe);
    paladin.ledger.declaration = undefined;
  });

  it("install on a ledger whose .env exists appends only the recipe keys it lacks and keeps what is there", async () => {
    const env = `${ledger}/.env`;
    const before = await Deno.readTextFile(env);
    await Deno.writeTextFile(env, before.replace(/^# .*\nVIVA_CLIENT_ANIMA_ORIGIN=.*\n/m, "").replace(/^VIVA_RUNTIME_ORIGIN=.*$/m, 'VIVA_RUNTIME_ORIGIN="http://kept:1/"'));
    const output = await drive(["ledger/install", ledger]);
    expect(output.authored).toEqual(["VIVA_CLIENT_ANIMA_ORIGIN"]);
    const after = await Deno.readTextFile(env);
    expect(after).toContain('VIVA_RUNTIME_ORIGIN="http://kept:1/"');
    expect(after).toContain("# Scheme and authority the anima browser client is reachable at.");
    expect(after.match(/^VIVA_CLIENT_ANIMA_ORIGIN=/gm)).toHaveLength(1);
    expect((await drive(["ledger/install", ledger])).authored).toEqual([]);
    await Deno.writeTextFile(env, before);
  });

  it("doctor reports the recipe organ — present, manifest, the slots it speaks", async () => {
    const output = await drive(["ledger/doctor"]);
    expect(output.recipe.path).toBe(`${ledger}/ledger.viva.json`);
    expect(output.recipe.present).toBe(true);
    expect(output.recipe.manifest.type).toBe("ledger");
    expect(output.recipe.manifest.slug).toBe("ledger"); // derived from the scaffold's stem
    expect(output.recipe.slots).toEqual(["environment", "runtime", "lighthouse", "datamap", "hallucinators", "clients"]);
  });

  it("tap records the owner → slug and mount", async () => {
    const output = await drive(["registry/tap", "pack"]);
    expect(output.owner).toBe("@pack");
    expect(output.record).toEqual(TAPPED());
    expect(output.root).toBe(`${store}/pack`);
  });

  it("re-tap is idempotent", async () => {
    const output = await drive(["registry/tap", "pack"]);
    expect(output.record).toEqual(TAPPED());
  });

  it("tap of a local source with a target throws", async () => {
    const error = await drive(["registry/tap", "pack", `${store}/elsewhere`])
      .then(() => null, (thrown) => thrown);
    expect(String(error).includes("target only applies to a remote source")).toBe(true);
  });

  it("tap throws on a dir with no package declaration", async () => {
    await Deno.mkdir(`${store}/hollow`);
    const error = await drive(["registry/tap", "hollow"]).then(() => null, (thrown) => thrown);
    expect(String(error).includes("no package declaration")).toBe(true);
    expect(await paladin.ledger.registry.tapped()).toEqual(TAPPED());
  });

  it("tap throws on a missing absolute path, record untouched", async () => {
    const error = await drive(["registry/tap", `${store}/vanished/nowhere`])
      .then(() => null, (thrown) => thrown);
    expect(error).not.toBe(null);
    expect(await paladin.ledger.registry.tapped()).toEqual(TAPPED());
  });

  it("doctor reports homes, the .env organ, and the record with roots", async () => {
    const output = await drive(["ledger/doctor"]);
    expect(output.homes.ledger).toBe(paladin.scope.ledger.absolute);
    expect(output.homes.store).toBe(new Path(store).absolute);
    expect(output.homes.instances).toBe(`${ledger}/instances`);
    expect(output.homes.record.endsWith("registry.json")).toBe(true);
    expect(output.env.path).toBe(`${ledger}/.env`);
    expect(output.env.present).toBe(true);
    expect(output.record.path).toBe(output.homes.record);
    const entry = output.record.entries.find((held) => held.owner === "@pack");
    expect(entry.root).toBe(`${store}/pack`);
    expect(entry.pinned).toBe(false);
    expect(entry.present).toBe(true);
  });

  it("doctor marks a rotten record entry absent and names an untapped store resident", async () => {
    await author(store, "rot", "@rot");
    await drive(["registry/tap", "rot"]);
    await Deno.remove(`${store}/rot`, { recursive: true });
    await author(store, "loose", "@loose");
    const output = await drive(["ledger/doctor"]);
    const rotten = output.record.entries.find((held) => held.owner === "@rot");
    expect(rotten.present).toBe(false);
    expect(output.store.path).toBe(new Path(store).absolute);
    expect(output.store.untapped).toEqual([`${store}/loose`]);
    await drive(["registry/untap", "rot"]);
    await Deno.remove(`${store}/loose`, { recursive: true });
  });

  it("doctor flags a dangling record entry", async () => {
    await paladin.ledger.instances.write("gone", { mount: `${ledger}/instances/vanished` });
    const output = await drive(["ledger/doctor"]);
    const row = output.instances.find((held) => held.slug === "gone");
    expect(row.flags).toEqual(["dangling"]);
    await paladin.ledger.instances.remove("gone");
  });

  it("doctor flags an orphan shelf dir — tap it", async () => {
    await Deno.mkdir(`${ledger}/instances/stray`, { recursive: true });
    const output = await drive(["ledger/doctor"]);
    const row = output.instances.find((held) => held.slug === "stray");
    expect(row.flags[0].startsWith("orphan")).toBe(true);
    await Deno.remove(`${ledger}/instances/stray`);
  });

  it("doctor flags a shadowed slug — record points elsewhere while the shelf name exists", async () => {
    const elsewhere = await Deno.makeTempDir({ suffix: "-elsewhere" });
    await Deno.mkdir(`${ledger}/instances/shadow`, { recursive: true });
    await paladin.ledger.instances.write("shadow", { mount: elsewhere });
    const output = await drive(["ledger/doctor"]);
    const row = output.instances.find((held) => held.slug === "shadow");
    expect(row.flags).toEqual(["shadowed"]);
    await paladin.ledger.instances.remove("shadow");
    await Deno.remove(`${ledger}/instances/shadow`);
  });

  it("instance clone without a target shelves under <ledger>/instances/<slug>", async () => {
    await Deno.mkdir(`${store}/pack/probe`, { recursive: true });
    await Deno.writeTextFile(`${store}/pack/probe/instance.viva.json`, JSON.stringify({ manifest: { type: "instance", slug: "probe", version: "0.0.1" } }));
    const output = await drive(["instance/clone", "@pack/instance/probe"]);
    expect(output.target).toBe(`${ledger}/instances/probe`);
    expect(output.env).toBe(`VIVA_INSTANCE_MOUNT=${ledger}/instances/probe`);
    expect((await Deno.stat(`${ledger}/instances/probe/instance.viva.json`)).isFile).toBe(true);
  });

  it("instance install authors .env from the schema, then asks only for the blanks", async () => {
    const home = `${ledger}/instances/probe`;
    await Deno.remove(`${home}/.env`).catch(() => {});
    const environment = v.environment({
      VIVA_SYSTEM_MODE: v.string().desc("mode").group("identity").default("DEVELOPMENT"),
      VIVA_PROBE_SERVE: v.url().desc("serve").group("addresses").default("http://localhost:1"),
      SECRET_VIVA_JWT: v.string({ minLength: 24 }).desc("signing secret").group("keys"),
      SECRET_VIVA_PROBE_OPTIONAL: v.string().desc("optional, unset").group("keys").optional(),
    });
    await Deno.writeTextFile(`${home}/instance.viva.json`, JSON.stringify({ manifest: { type: "instance", slug: "probe" }, environment: JSON.parse(JSON.stringify(environment)) }));
    paladin.scopes([["instance", () => true, () => new Path(home)]]);

    const first = await drive(["instance/install"]);
    // the file is authored from the schema and the jwt MINTED by install (fork 7b): nothing is owed, the verdict is present
    expect(first.env).toBe("present");
    expect(first.fill).toBeUndefined();
    const held = await Deno.readTextFile(`${home}/.env`);
    expect(held.includes('VIVA_SYSTEM_MODE="DEVELOPMENT"')).toBe(true);
    expect(held.includes("# signing secret")).toBe(true);
    // an unset OPTIONAL key is written COMMENTED — it documents without claiming, so a ledger value shows through
    expect(/^# SECRET_VIVA_PROBE_OPTIONAL=""$/m.test(held)).toBe(true);
    expect(paladin.secret.strata.get("instance")?.SECRET_VIVA_PROBE_OPTIONAL).toBe(undefined);
    const minted = held.match(/^SECRET_VIVA_JWT="([A-Za-z0-9+/=]{32})"$/m)?.[1];
    expect(typeof minted).toBe("string");
    expect(paladin.secret.strata.get("instance")?.SECRET_VIVA_JWT).toBe(minted);

    // the writer fills the commented slot IN PLACE — under its description, inside its group, no twin
    await paladin.state.env(`${home}/.env`, { SECRET_VIVA_PROBE_OPTIONAL: "x" });
    const written = await Deno.readTextFile(`${home}/.env`);
    expect(written.includes('# optional, unset\nSECRET_VIVA_PROBE_OPTIONAL="x"\n')).toBe(true);
    expect(written.includes("# SECRET_VIVA_PROBE_OPTIONAL")).toBe(false);
    const second = await drive(["instance/install"]);
    expect(second.env).toBe("present");
    expect((await Deno.readTextFile(`${home}/.env`)).includes(`SECRET_VIVA_JWT="${minted}"`)).toBe(true);

    // a SET value that fails its type is owed like a blank one — named with its reason, never booted onto
    const filled = await Deno.readTextFile(`${home}/.env`);
    await Deno.writeTextFile(`${home}/.env`, filled.replace('VIVA_PROBE_SERVE="http://localhost:1"', 'VIVA_PROBE_SERVE="localhost:1"'));
    const third = await drive(["instance/install"]);
    expect(third.env).toBe("incomplete");
    expect(third.fill).toEqual(["VIVA_PROBE_SERVE"]);
    expect(third.invalid).toEqual([{ key: "VIVA_PROBE_SERVE", reason: "must be RFC 3986 URI with an authority (scheme://…)" }]);
  });

  it("untap of an unrecorded location refuses and names the doctor", async () => {
    await expect(drive(["registry/untap", "never-tapped"])).rejects.toThrow("no tapped package 'never-tapped' — viva registry/doctor");
  });

  it("untap removes the record, store keeps the working copy", async () => {
    const output = await drive(["registry/untap", "pack"]);
    expect(output.record).toEqual(CHECKOUT);
    expect((await Deno.stat(`${store}/pack`)).isDirectory).toBe(true);
  });
});
