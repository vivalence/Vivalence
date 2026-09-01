import { describe, it } from "@std/testing/bdd";
import { expect } from "@std/expect";
import { Path } from "@vivalence/typology";
import { Paladin } from "../prototypes/paladin.js";
import { Registry } from "../prototypes/ledger/registry.js";
import { Vip } from "../prototypes/vip.js";

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

// a recorded location can die under the record: the checkout moved, a package dir was renamed, a
// tapped clone was deleted. supply() used to throw on the first one and the whole boot went with it.
const homed = async () => {
  const held = await scaffold();
  const repository = await Deno.makeTempDir({ prefix: "registry_test_repository_" });
  const checkout = new Path(repository);
  held.paladin.scopes([["repository", () => true, () => checkout]]);
  return { ...held, repository, checkout, commons: checkout.branch("commons") };
};

const declare = (repository) =>
  author(`${repository}/commons`, "package.viva.js", { owner: "@commons", type: "package", slug: "commons", version: "0.0.1" });

describe("Registry.reconcile — a dead location never breaks supply", () => {
  it("a dead location anywhere under the checkout is replaced by rediscovering <checkout>/commons", async () => {
    const { registry, repository, checkout, commons } = await homed();
    await declare(repository);
    await registry.write([`${repository}/registry/viva`, `${repository}/registry/testing`]);

    const { locations, stale } = await registry.reconcile(checkout, commons);
    expect(locations).toEqual([`${repository}/commons`]);
    expect(stale).toEqual([]);
    expect(await registry.list()).toEqual([`${repository}/commons`]);
  });

  it("a dead location outside the checkout is skipped, kept recorded, and reported stale", async () => {
    const { registry, store, checkout, commons } = await homed();
    await author(`${store}/real`, "package.viva.js", { owner: "@real", type: "package", slug: "real", version: "0.0.1" });
    await registry.write(["/nowhere/checkout", "real"]);

    const { locations, stale } = await registry.reconcile(checkout, commons);
    expect(locations).toEqual(["real"]);
    expect(stale).toEqual(["/nowhere/checkout"]);
    expect(await registry.list()).toEqual(["/nowhere/checkout", "real"]);
  });

  it("a record with every location present is returned as-is and not rewritten", async () => {
    const { registry, store, checkout, commons } = await homed();
    await author(`${store}/real`, "package.viva.js", { owner: "@real", type: "package", slug: "real", version: "0.0.1" });
    await registry.write(["real"]);
    const before = (await Deno.stat(registry.path.absolute)).mtime;

    const { locations, stale } = await registry.reconcile(checkout, commons);
    expect(locations).toEqual(["real"]);
    expect(stale).toEqual([]);
    expect((await Deno.stat(registry.path.absolute)).mtime).toEqual(before);
  });

  it("no record at all returns null — supply seeds instead", async () => {
    const { registry, repository, checkout, commons } = await homed();
    await declare(repository);
    expect(await registry.reconcile(checkout, commons)).toBe(null);
  });

  it("discovery over a missing root yields nothing, never a stack trace", async () => {
    const { registry, commons } = await homed();
    expect(await registry.discover(commons)).toEqual([]);
  });
});

describe("Vip.supply — boots over a stale record", () => {
  it("mounts the healed checkout package and skips the dead external one", async () => {
    const { paladin, repository, store } = await homed();
    await declare(repository);
    await author(`${store}/real`, "package.viva.js", { owner: "@real", type: "package", slug: "real", version: "0.0.1" });
    await paladin.ledger.registry.write([`${repository}/registry/viva`, "/nowhere/checkout", "real"]);

    const vip = new Vip(paladin);
    await vip.supply();
    expect(vip.pensieve.has("@commons")).toBe(true);
    expect(vip.pensieve.has("@real")).toBe(true);
    expect(vip.stale).toEqual(["/nowhere/checkout"]);
    expect(await paladin.ledger.registry.list()).toEqual(["/nowhere/checkout", "real", `${repository}/commons`]);
  });

  it("no record seeds from <checkout>/commons", async () => {
    const { paladin, repository } = await homed();
    await declare(repository);

    const vip = new Vip(paladin);
    await vip.supply();
    expect(vip.pensieve.has("@commons")).toBe(true);
    expect(await paladin.ledger.registry.list()).toEqual([`${repository}/commons`]);
  });

  it("a checkout without commons/ supplies nothing and names the absence at accio", async () => {
    const { paladin } = await homed();

    const vip = new Vip(paladin);
    await vip.supply();
    expect(vip.pensieve.has("@commons")).toBe(false);
    await expect(vip.accio("@commons/datamap/libsql")).rejects.toThrow("not supplied");
  });
});
