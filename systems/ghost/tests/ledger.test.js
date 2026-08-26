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

describe("viva ledger/{init,tap,untap,doctor} + variant/create", () => {
  let ledger;
  let store;

  beforeAll(async () => {
    ledger = await Deno.makeTempDir({ prefix: "ghost-ledger-" });
    store = await Deno.makeTempDir({ prefix: "ghost-store-" });
    paladin.scopes([
      ["ledger", () => true, () => new Path(ledger)],
      ["registry", () => true, () => new Path(store)],
    ]);
    await paladin.ledger.mount();
    await author(store, "pack", "@pack");
  });

  it("init scaffolds locks/logs/registry/variants + instances.json", async () => {
    const effect = await drive(["ledger/init", ledger]);
    expect(effect.scaffolded).toEqual(["locks", "logs", "registry", "variants"]);
    for (const sub of effect.scaffolded) {
      expect((await Deno.stat(`${ledger}/${sub}`)).isDirectory).toBe(true);
    }
    expect(await paladin.read.json(new Path(`${ledger}/instances.json`))).toEqual({});
  });

  it("tap records a store-relative reference", async () => {
    const effect = await drive(["ledger/tap", "pack"]);
    expect(effect.reference).toBe("pack");
    expect(effect.record).toEqual(["pack"]);
    expect(effect.root).toBe(`${store}/pack`);
  });

  it("re-tap is idempotent", async () => {
    const effect = await drive(["ledger/tap", "pack"]);
    expect(effect.record).toEqual(["pack"]);
  });

  it("tap of a local source with a target throws", async () => {
    const error = await drive(["ledger/tap", "pack", `${store}/elsewhere`])
      .then(() => null, (thrown) => thrown);
    expect(String(error).includes("target only applies to a remote source")).toBe(true);
  });

  it("tap throws on a dir with no package declaration", async () => {
    await Deno.mkdir(`${store}/hollow`);
    const error = await drive(["ledger/tap", "hollow"]).then(() => null, (thrown) => thrown);
    expect(String(error).includes("no package declaration")).toBe(true);
    expect(await paladin.ledger.registry.list()).toEqual(["pack"]);
  });

  it("tap throws on a missing absolute path, record untouched", async () => {
    const error = await drive(["ledger/tap", `${store}/vanished/nowhere`])
      .then(() => null, (thrown) => thrown);
    expect(error).not.toBe(null);
    expect(await paladin.ledger.registry.list()).toEqual(["pack"]);
  });

  it("doctor reports homes + the record with roots and declared owners", async () => {
    const effect = await drive(["ledger/doctor"]);
    expect(effect.homes.ledger).toBe(paladin.scope.ledger.absolute);
    expect(effect.homes.store).toBe(new Path(store).absolute);
    expect(effect.homes.variants).toBe(`${ledger}/variants`);
    expect(effect.homes.record.endsWith("registry.json")).toBe(true);
    const entry = effect.record.find((held) => held.reference === "pack");
    expect(entry.root).toBe(`${store}/pack`);
    expect(entry.declared).toEqual(["@pack"]);
  });

  it("doctor tolerates a rotten record entry — declared goes empty", async () => {
    await author(store, "rot", "@rot");
    await drive(["ledger/tap", "rot"]);
    await Deno.remove(`${store}/rot`, { recursive: true });
    const effect = await drive(["ledger/doctor"]);
    const rotten = effect.record.find((held) => held.reference === "rot");
    expect(rotten.declared).toEqual([]);
    await drive(["ledger/untap", "rot"]);
  });

  it("variant create without a target shelves under <ledger>/variants/<slug>", async () => {
    await Deno.writeTextFile(
      `${store}/pack/probe.viva.js`,
      `export const manifest = { type: "variant", slug: "probe", version: "0.0.1" };`,
    );
    const effect = await drive(["variant/create", "@pack/variant/probe"]);
    expect(effect.target).toBe(`${ledger}/variants/probe`);
    expect(effect.env).toBe("VIVA_VARIANT_MOUNT=probe");
    expect((await Deno.stat(`${ledger}/variants/probe/probe.viva.js`)).isFile).toBe(true);
  });

  it("variant init seeds .env from .env.example, idempotent, names the fill", async () => {
    const home = `${ledger}/variants/probe`;
    await Deno.writeTextFile(`${home}/.env.example`, "VIVA_SYSTEM_MODE=\nSECRET_VIVA_JWT=\n");
    paladin.scopes([["variant", () => true, () => new Path(home)]]);
    const first = await drive(["variant/init"]);
    expect(first.env).toBe("created");
    expect(first.fill).toEqual(["VIVA_SYSTEM_MODE", "SECRET_VIVA_JWT"]);
    expect(first.next.includes("fill .env")).toBe(true);
  });

  it("untap of an unrecorded reference is a no-op", async () => {
    const effect = await drive(["ledger/untap", "never-tapped"]);
    expect(effect.record).toEqual(["pack"]);
  });

  it("untap removes the record, store keeps the working copy", async () => {
    const effect = await drive(["ledger/untap", "pack"]);
    expect(effect.record).toEqual([]);
    expect((await Deno.stat(`${store}/pack`)).isDirectory).toBe(true);
  });
});
