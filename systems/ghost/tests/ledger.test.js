import paladin from "@vivalence/paladin";
import { Path, specimen, steer, Vector } from "@vivalence/typology";
import { ShellContext, ShellSignal } from "../typology.js";
import trajectories from "../trajectories/index.js";

const { describe, it, beforeAll, expect } = specimen;

const strategy = (carry, effect) => async (context) => {
  await carry(context, async (ctx) => {
    const result = await effect(ctx);
    ctx.effect ??= result;
  });
  return context.effect;
};

const trajectory = new Vector();
trajectories(trajectory);

const drive = (args) => {
  const signal = new ShellSignal(args);
  return steer.dispatch.invoke(trajectory, signal, strategy)(new ShellContext({ signal }));
};

async function author(root, slug, owner) {
  await Deno.mkdir(`${root}/${slug}`, { recursive: true });
  await Deno.writeTextFile(
    `${root}/${slug}/${slug}.viva.js`,
    `export const manifest = { owner: "${owner}", type: "package", slug: "${slug}", version: "0.0.1" };`,
  );
}

describe("viva ledger/{init,doctor} + registry/{tap,untap} + instance/create", () => {
  let ledger;
  let store;

  beforeAll(async () => {
    ledger = await Deno.makeTempDir({ prefix: "ghost-ledger-" });
    store = await Deno.makeTempDir({ prefix: "ghost-store-" });
    Deno.env.set("XDG_CONFIG_HOME", await Deno.makeTempDir({ prefix: "ghost-config-" }));
    paladin.env.delete("VIVA_INSTANCE_MOUNT");
    paladin.scopes([
      ["ledger", () => true, () => new Path(ledger)],
      ["registry", () => true, () => new Path(store)],
    ]);
    await author(store, "pack", "@pack");
  });

  it("init scaffolds locks/logs/registry/instances/sessions + instances.json + the shell line", async () => {
    const effect = await drive(["ledger/init", ledger]);
    expect(effect.scaffolded).toEqual(["locks", "logs", "registry", "instances", "sessions"]);
    for (const sub of effect.scaffolded) {
      expect((await Deno.stat(`${ledger}/${sub}`)).isDirectory).toBe(true);
    }
    expect(await paladin.read.json(new Path(`${ledger}/instances.json`))).toEqual({});
    // VIVA_PROCESS_ID is NOT written here — ghost.sh derives it from $PPID, the invoking shell.
    // a `$$` in this file would expand inside ghost.sh, minting a new id on every invocation.
    const config = await Deno.readTextFile(`${Deno.env.get("XDG_CONFIG_HOME")}/viva/env`).catch(() => "");
    expect(config).not.toContain("VIVA_PROCESS_ID");
  });

  it("tap records a store-relative reference", async () => {
    const effect = await drive(["registry/tap", "pack"]);
    expect(effect.reference).toBe("pack");
    expect(effect.record).toEqual(["pack"]);
    expect(effect.root).toBe(`${store}/pack`);
  });

  it("re-tap is idempotent", async () => {
    const effect = await drive(["registry/tap", "pack"]);
    expect(effect.record).toEqual(["pack"]);
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
    expect(await paladin.ledger.registry.list()).toEqual(["pack"]);
  });

  it("tap throws on a missing absolute path, record untouched", async () => {
    const error = await drive(["registry/tap", `${store}/vanished/nowhere`])
      .then(() => null, (thrown) => thrown);
    expect(error).not.toBe(null);
    expect(await paladin.ledger.registry.list()).toEqual(["pack"]);
  });

  it("doctor reports homes + the record with roots and declared owners", async () => {
    const effect = await drive(["ledger/doctor"]);
    expect(effect.homes.ledger).toBe(paladin.scope.ledger.absolute);
    expect(effect.homes.store).toBe(new Path(store).absolute);
    expect(effect.homes.instances).toBe(`${ledger}/instances`);
    expect(effect.homes.record.endsWith("registry.json")).toBe(true);
    const entry = effect.record.find((held) => held.reference === "pack");
    expect(entry.root).toBe(`${store}/pack`);
    expect(entry.declared).toEqual(["@pack"]);
  });

  it("doctor tolerates a rotten record entry — declared goes empty", async () => {
    await author(store, "rot", "@rot");
    await drive(["registry/tap", "rot"]);
    await Deno.remove(`${store}/rot`, { recursive: true });
    const effect = await drive(["ledger/doctor"]);
    const rotten = effect.record.find((held) => held.reference === "rot");
    expect(rotten.declared).toEqual([]);
    await drive(["registry/untap", "rot"]);
  });

  it("doctor flags a dangling record entry", async () => {
    await paladin.ledger.instances.write("gone", { mount: `${ledger}/instances/vanished` });
    const effect = await drive(["ledger/doctor"]);
    const row = effect.instances.find((held) => held.slug === "gone");
    expect(row.flags).toEqual(["dangling"]);
    await paladin.ledger.instances.remove("gone");
  });

  it("doctor flags an orphan shelf dir — tap it", async () => {
    await Deno.mkdir(`${ledger}/instances/stray`, { recursive: true });
    const effect = await drive(["ledger/doctor"]);
    const row = effect.instances.find((held) => held.slug === "stray");
    expect(row.flags[0].startsWith("orphan")).toBe(true);
    await Deno.remove(`${ledger}/instances/stray`);
  });

  it("doctor flags a shadowed slug — record points elsewhere while the shelf name exists", async () => {
    const elsewhere = await Deno.makeTempDir({ suffix: "-elsewhere" });
    await Deno.mkdir(`${ledger}/instances/shadow`, { recursive: true });
    await paladin.ledger.instances.write("shadow", { mount: elsewhere });
    const effect = await drive(["ledger/doctor"]);
    const row = effect.instances.find((held) => held.slug === "shadow");
    expect(row.flags).toEqual(["shadowed"]);
    await paladin.ledger.instances.remove("shadow");
    await Deno.remove(`${ledger}/instances/shadow`);
  });

  it("instance create without a target shelves under <ledger>/instances/<slug>", async () => {
    await Deno.writeTextFile(
      `${store}/pack/probe.viva.js`,
      `export const manifest = { type: "instance", slug: "probe", version: "0.0.1" };`,
    );
    const effect = await drive(["instance/create", "@pack/instance/probe"]);
    expect(effect.target).toBe(`${ledger}/instances/probe`);
    expect(effect.env).toBe(`VIVA_INSTANCE_MOUNT=${ledger}/instances/probe`);
    expect((await Deno.stat(`${ledger}/instances/probe/probe.viva.js`)).isFile).toBe(true);
  });

  it("instance init authors .env from the schema, then asks only for the blanks", async () => {
    const home = `${ledger}/instances/probe`;
    await Deno.remove(`${home}/.env`).catch(() => {});
    await Deno.writeTextFile(
      `${home}/probe.viva.js`,
      `export const manifest = { type: "instance", slug: "probe" };
export const environment = {
  VIVA_SYSTEM_MODE: { describe: "mode", group: "identity", default: "DEVELOPMENT" },
  SECRET_VIVA_JWT: { describe: "signing secret", group: "keys" },
};
`,
    );
    paladin.scopes([["instance", () => true, () => new Path(home)]]);

    const first = await drive(["instance/init"]);
    expect(first.env).toBe("scaffolded");
    // the key WITH a default is written, not asked for; only the blank one is owed
    expect(first.fill).toEqual(["SECRET_VIVA_JWT"]);
    const held = await Deno.readTextFile(`${home}/.env`);
    expect(held.includes('VIVA_SYSTEM_MODE="DEVELOPMENT"')).toBe(true);
    expect(held.includes("# signing secret")).toBe(true);
    expect(held.includes('SECRET_VIVA_JWT=""')).toBe(true);

    await Deno.writeTextFile(`${home}/.env`, held.replace('SECRET_VIVA_JWT=""', 'SECRET_VIVA_JWT="x"'));
    const second = await drive(["instance/init"]);
    expect(second.env).toBe("present");
  });

  it("untap of an unrecorded reference is a no-op", async () => {
    const effect = await drive(["registry/untap", "never-tapped"]);
    expect(effect.record).toEqual(["pack"]);
  });

  it("untap removes the record, store keeps the working copy", async () => {
    const effect = await drive(["registry/untap", "pack"]);
    expect(effect.record).toEqual([]);
    expect((await Deno.stat(`${store}/pack`)).isDirectory).toBe(true);
  });
});
