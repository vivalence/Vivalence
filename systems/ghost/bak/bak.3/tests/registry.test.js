import paladin from "@vivalence/paladin";
import { Path, specimen } from "@vivalence/typology";
import { path } from "../gestalten/belt/index.js";
import { drive } from "./verb.js";

const { describe, it, beforeAll, expect } = specimen;

async function author(root, slug, owner) {
  await Deno.mkdir(`${root}/${slug}`, { recursive: true });
  await Deno.writeTextFile(
    `${root}/${slug}/${slug}.viva.js`,
    `export const manifest = { owner: "${owner}", type: "package", slug: "${slug}", version: "0.4.2" };`,
  );
}

describe("viva registry/{tap,untap,doctor}", () => {
  let ledger;
  let store;

  beforeAll(async () => {
    ledger = await Deno.makeTempDir({ prefix: "ghost-registry-ledger-" });
    store = await Deno.makeTempDir({ prefix: "ghost-registry-store-" });
    paladin.env.delete("VIVA_INSTANCE_MOUNT");
    paladin.scopes([
      ["ledger", () => true, () => new Path(ledger)],
      ["registry", () => true, () => new Path(store)],
    ]);
    await author(store, "alpha", "@alpha");
    await author(store, "beta", "@beta");
    await Deno.writeTextFile(`${store}/alpha/extra.js`, "export const kept = true;\n");
    await Deno.mkdir(`${store}/alpha/nested`, { recursive: true });
    await Deno.writeTextFile(`${store}/alpha/nested/deep.js`, "export const deep = true;\n");
    await drive(["registry/tap", "alpha"]);
    await drive(["registry/tap", "beta"]);
  });

  it("tap and untap answer under /registry — an unknown location refuses and leaves the record", async () => {
    const tapped = await drive(["registry/tap", "alpha"]);
    expect(tapped.record).toEqual({ "@alpha": { slug: "alpha", mount: `${store}/alpha` }, "@beta": { slug: "beta", mount: `${store}/beta` } });
    await expect(drive(["registry/untap", "never-tapped"])).rejects.toThrow("no tapped package 'never-tapped'");
    expect(await drive(["registry/doctor"]).then((output) => output.record.entries.map((entry) => entry.root))).toEqual([
      `${store}/alpha`,
      `${store}/beta`,
    ]);
  });

  it("untap finds a package by its slug when the slug is not the owner's name", async () => {
    await Deno.mkdir(`${store}/uno`, { recursive: true });
    await Deno.writeTextFile(`${store}/uno/uno.viva.js`, `export const manifest = { owner: "@one", type: "package", slug: "uno", version: "0.0.1" };`);
    await drive(["registry/tap", "uno"]);
    expect((await drive(["registry/untap", "uno"])).untapped).toBe("@one");
    expect(await paladin.ledger.registry.has("@one")).toBe(false);
    await Deno.remove(`${store}/uno`, { recursive: true });
  });

  it("doctor reads the record against the store — tapped roots, an untapped resident, the census by owner", async () => {
    await author(store, "gamma", "@gamma");
    const output = await drive(["registry/doctor"]);
    expect(output.record.tapped).toBe(Object.keys(await paladin.ledger.registry.tapped()).length);
    expect(output.record.stale).toEqual([]);
    expect(output.store.path).toBe(new Path(store).absolute);
    expect(output.store.untapped).toEqual([`${store}/gamma`]);
    const alpha = output.packages.find((held) => held.owner === "@alpha");
    expect(alpha.mount).toBe(`${store}/alpha`);
    expect(alpha.root).toBe(`${store}/alpha`);
    expect(alpha.types.package).toEqual(["alpha"]);
    expect(alpha.modes).toBe(1);
    expect(output.pensieve.owners >= 2).toBe(true);
    expect(output.pensieve.modes >= output.pensieve.owners).toBe(true);
    await Deno.remove(`${store}/gamma`, { recursive: true });
  });

  it("doctor: integrity lists a faulted module with the schematic's sentence", async () => {
    await Deno.writeTextFile(`${store}/alpha/bare.viva.js`, `export const manifest = { type: "game", slug: "bare", version: "0.0.1", traits: ["BOOTED"] };`);
    const output = await drive(["registry/doctor"]);
    const row = output.integrity.find((held) => held.path.endsWith("/alpha/bare.viva.js"));
    expect(row.faults).toEqual(["BOOTED: no boot export"]);
    await Deno.remove(`${store}/alpha/bare.viva.js`);
  });

  it("doctor: a tap of a wrapping dir records the declaration inside it, never untapped", async () => {
    await Deno.mkdir(`${store}/wrap`, { recursive: true });
    await author(`${store}/wrap`, "deep", "@deep");
    await drive(["registry/tap", "wrap"]);
    const output = await drive(["registry/doctor"]);
    expect(output.store.resident.includes(`${store}/wrap/deep`)).toBe(true);
    expect(output.store.untapped).toEqual([]);
    expect(output.packages.find((held) => held.owner === "@deep").mount).toBe(`${store}/wrap/deep`);
    await drive(["registry/untap", "@deep"]);
    await Deno.remove(`${store}/wrap`, { recursive: true });
  });

  it("doctor: a rotten entry outside the repository is stale and stays in the record", async () => {
    await author(store, "rot", "@rot");
    await drive(["registry/tap", "rot"]);
    await Deno.remove(`${store}/rot`, { recursive: true });
    const output = await drive(["registry/doctor"]);
    expect(output.record.stale).toEqual(["@rot"]);
    expect(await paladin.ledger.registry.has("@rot")).toBe(true);
    expect(output.packages.find((held) => held.owner === "@rot")).toBe(undefined);
    await drive(["registry/untap", "rot"]);
  });

  it("a remote source survives the cwd frame verbatim", () => {
    const scp = "git@github.com:vivalence/registry-standalone.git";
    expect(path.source(scp)).toBe(scp);
    expect(path.source("https://github.com/vivalence/registry-standalone")).toBe(
      "https://github.com/vivalence/registry-standalone",
    );
    expect(path.source("./local").startsWith("/")).toBe(true);
  });
});
