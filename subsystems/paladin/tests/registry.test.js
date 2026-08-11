import { describe, it } from "@std/testing/bdd";
import { expect } from "@std/expect";
import { Path } from "@vivalence/typology";
import { Paladin } from "../prototypes/paladin.js";
import { Registry } from "../prototypes/ledger/registry.js";

const scaffold = async () => {
  const ledger = await Deno.makeTempDir({ prefix: "registry_test_ledger_" });
  const store = await Deno.makeTempDir({ prefix: "registry_test_store_" });
  const paladin = new Paladin();
  paladin.scopes([
    ["ledger", () => true, () => new Path(ledger)],
    ["registry", () => true, () => new Path(store)],
  ]);
  const registry = new Registry(paladin, new Path(`${ledger}/registry.json`));
  return { paladin, registry, ledger, store };
};

const author = async (dir, filename, manifest) => {
  await Deno.mkdir(dir, { recursive: true });
  await Deno.writeTextFile(`${dir}/${filename}`, `export const manifest = ${JSON.stringify(manifest)};`);
};

describe("Registry — reference algebra", () => {
  it("add is idempotent", async () => {
    const { registry } = await scaffold();
    await registry.add("/external/checkout");
    await registry.add("/external/checkout");
    expect(await registry.list()).toEqual(["/external/checkout"]);
  });

  it("'./pack' and 'pack' are the same reference", async () => {
    const { registry } = await scaffold();
    await registry.add("./pack");
    expect(await registry.has("pack")).toBe(true);
    await registry.add("pack");
    expect(await registry.list()).toEqual(["pack"]);
  });

  it("remove drops exactly the named reference", async () => {
    const { registry } = await scaffold();
    await registry.add("/external/checkout");
    await registry.add("pack");
    await registry.remove("./pack");
    expect(await registry.list()).toEqual(["/external/checkout"]);
  });

  it("remove of an unrecorded reference is a no-op", async () => {
    const { registry } = await scaffold();
    await registry.add("pack");
    expect(await registry.remove("never")).toEqual(["pack"]);
    expect(await registry.list()).toEqual(["pack"]);
  });

  it("resolve — absolute verbatim, relative against the store root", async () => {
    const { registry, store } = await scaffold();
    expect(registry.resolve("/external/checkout").absolute).toBe("/external/checkout");
    expect(registry.resolve("pack").absolute).toBe(`${store}/pack`);
    expect(registry.resolve("./pack").absolute).toBe(`${store}/pack`);
  });

  it("resolve of a relative reference without a store scope throws", async () => {
    const ledger = await Deno.makeTempDir({ prefix: "registry_test_ledger_" });
    const paladin = new Paladin();
    paladin.scopes([["ledger", () => true, () => new Path(ledger)]]);
    const registry = new Registry(paladin, new Path(`${ledger}/registry.json`));
    expect(registry.resolve("/external/checkout").absolute).toBe("/external/checkout");
    expect(() => registry.resolve("pack")).toThrow("no package store");
  });

  it("the file shape stays a plain JSON array of strings", async () => {
    const { paladin, registry } = await scaffold();
    await registry.add("/external/checkout");
    await registry.add("pack");
    const raw = await paladin.read.json(registry.path, null);
    expect(raw).toEqual(["/external/checkout", "pack"]);
  });
});

describe("Registry.seed — discovery keeps only package declarations", () => {
  it("a child without a package manifest never becomes a location", async () => {
    const { paladin, registry, store } = await scaffold();
    await author(`${store}/real`, "real.viva.js", { owner: "@real", type: "package", slug: "real", version: "0.0.1" });
    await author(`${store}/modules-only`, "game.viva.js", { type: "game", slug: "loose", version: "0.0.1" });
    await Deno.mkdir(`${store}/stray`, { recursive: true });
    await Deno.writeTextFile(`${store}/stray/notes.txt`, "not a package");

    const locations = await registry.seed(paladin.scope.registry);
    expect(locations).toEqual([`${store}/real`]);
    expect(await registry.list()).toEqual([`${store}/real`]);
  });
});
