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

describe("viva ledger/{tap,taps,untap,root}", () => {
  let store;

  beforeAll(async () => {
    const ledger = await Deno.makeTempDir({ prefix: "ghost-ledger-" });
    store = await Deno.makeTempDir({ prefix: "ghost-store-" });
    paladin.scopes([
      ["ledger", () => true, () => new Path(ledger)],
      ["registry", () => true, () => new Path(store)],
    ]);
    await paladin.ledger.mount();
    await author(store, "pack", "@pack");
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

  it("taps lists reference + root + declared owners", async () => {
    const [entry] = await drive(["ledger/taps"]);
    expect(entry.reference).toBe("pack");
    expect(entry.root).toBe(`${store}/pack`);
    expect(entry.declared).toEqual(["@pack"]);
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

  it("taps tolerates a rotten record entry — declared goes empty", async () => {
    await author(store, "rot", "@rot");
    await drive(["ledger/tap", "rot"]);
    await Deno.remove(`${store}/rot`, { recursive: true });
    const entries = await drive(["ledger/taps"]);
    const rotten = entries.find((entry) => entry.reference === "rot");
    expect(rotten.declared).toEqual([]);
    await drive(["ledger/untap", "rot"]);
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

  it("root shows ledger + store roots and the record path", async () => {
    const effect = await drive(["ledger/root"]);
    expect(effect.registry).toBe(new Path(store).absolute);
    expect(effect.ledger).toBe(paladin.scope.ledger.absolute);
    expect(effect.record.endsWith("registry.json")).toBe(true);
  });
});
