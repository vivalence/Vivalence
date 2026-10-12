import { describe, it } from "@std/testing/bdd";
import { expect } from "@std/expect";
import { Path } from "@vivalence/typology";
import { Paladin } from "../paladin/prototype.js";
import { Registry } from "../prototypes/registry.js";

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

const EXTERNAL = { slug: "external", mount: "/external/checkout" };
const PACK = { slug: "pack", mount: "./registry/pack" };

describe("Registry — the record, owner → { slug, mount, remote? }", () => {
  it("add is idempotent", async () => {
    const { registry } = await scaffold();
    await registry.add("@external", EXTERNAL);
    await registry.add("@external", EXTERNAL);
    expect(await registry.tapped()).toEqual({ "@external": EXTERNAL });
  });

  it("add of an owner tapped at another mount throws and leaves the record", async () => {
    const { registry } = await scaffold();
    await registry.add("@pack", PACK);
    await expect(registry.add("@pack", { slug: "pack", mount: "/elsewhere/pack" })).rejects.toThrow("@pack is tapped at ./registry/pack — untap it");
    expect(await registry.tapped()).toEqual({ "@pack": PACK });
  });

  it("remove drops exactly the named owner; an unrecorded owner is a no-op", async () => {
    const { registry } = await scaffold();
    await registry.add("@external", EXTERNAL);
    await registry.add("@pack", PACK);
    expect(await registry.remove("@never")).toEqual({ "@external": EXTERNAL, "@pack": PACK });
    await registry.remove("@pack");
    expect(await registry.tapped()).toEqual({ "@external": EXTERNAL });
    expect(await registry.has("@pack")).toBe(false);
  });

  it("resolve — absolute verbatim, relative against the record file", async () => {
    const { registry, ledger } = await scaffold();
    expect(registry.resolve("/external/checkout").absolute).toBe("/external/checkout");
    expect(registry.resolve("./registry/pack").absolute).toBe(`${ledger}/registry/pack`);
  });

  it("locate — beside the record file is relative, anywhere else absolute", async () => {
    const { registry, ledger } = await scaffold();
    expect(registry.locate(`${ledger}/registry/pack`)).toBe("./registry/pack");
    expect(registry.locate("/external/checkout")).toBe("/external/checkout");
  });

  it("a tap location without a store scope throws", async () => {
    const ledger = await Deno.makeTempDir({ prefix: "registry_test_ledger_" });
    const paladin = new Paladin();
    paladin.scopes([["ledger", () => true, () => new Path(ledger)]]);
    const registry = new Registry(paladin, new Path(`${ledger}/registry.json`));
    expect(registry.stored("/external/checkout").absolute).toBe("/external/checkout");
    expect(() => registry.stored("pack")).toThrow("no package store");
  });

  it("the file is a plain JSON object keyed by owner", async () => {
    const { paladin, registry } = await scaffold();
    await registry.add("@external", EXTERNAL);
    await registry.add("@pack", { ...PACK, remote: "git@github.com:vivalence/registry-pack.git" });
    expect(await paladin.read.json(registry.path, null)).toEqual({
      "@external": EXTERNAL,
      "@pack": { ...PACK, remote: "git@github.com:vivalence/registry-pack.git" },
    });
  });

  it("a record in the list shape throws naming the file — no dual read", async () => {
    const { registry, ledger } = await scaffold();
    await Deno.writeTextFile(`${ledger}/registry.json`, JSON.stringify(["pack"]));
    await expect(registry.tapped()).rejects.toThrow(`registry: ${ledger}/registry.json — not a registry record: / must be object`);
  });
});

describe("Registry.seed — discovery keeps only package declarations", () => {
  it("a child without a package manifest never becomes a location", async () => {
    const { paladin, registry, store } = await scaffold();
    await author(`${store}/real`, "real.viva.js", { owner: "@real", type: "package", slug: "real", version: "0.0.1" });
    await author(`${store}/modules-only`, "game.viva.js", { type: "game", slug: "loose", version: "0.0.1" });
    await Deno.mkdir(`${store}/stray`, { recursive: true });
    await Deno.writeTextFile(`${store}/stray/notes.txt`, "not a package");

    const record = await registry.seed(paladin.scope.registry);
    expect(record).toEqual({ "@real": { slug: "real", mount: `${store}/real` } });
    expect(await registry.tapped()).toEqual(record);
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
    await registry.write({ "@viva": { slug: "viva", mount: `${repository}/registry/viva` }, "@testing": { slug: "testing", mount: `${repository}/registry/testing` } });

    const { record, stale } = await registry.reconcile(checkout, commons);
    expect(record).toEqual({ "@commons": { slug: "commons", mount: `${repository}/commons` } });
    expect(stale).toEqual([]);
    expect(await registry.tapped()).toEqual(record);
  });

  it("a dead location outside the checkout is skipped, kept recorded, and reported stale", async () => {
    const { registry, store, checkout, commons } = await homed();
    await author(`${store}/real`, "package.viva.js", { owner: "@real", type: "package", slug: "real", version: "0.0.1" });
    const held = { "@gone": { slug: "gone", mount: "/nowhere/checkout" }, "@real": { slug: "real", mount: `${store}/real` } };
    await registry.write(held);

    const { record, stale } = await registry.reconcile(checkout, commons);
    expect(record).toEqual({ "@real": held["@real"] });
    expect(stale).toEqual(["@gone"]);
    expect(await registry.tapped()).toEqual(held);
  });

  it("a record with every location present is returned as-is and not rewritten", async () => {
    const { registry, store, checkout, commons } = await homed();
    await author(`${store}/real`, "package.viva.js", { owner: "@real", type: "package", slug: "real", version: "0.0.1" });
    const held = { "@real": { slug: "real", mount: `${store}/real` } };
    await registry.write(held);
    const before = (await Deno.stat(registry.path.absolute)).mtime;

    const { record, stale } = await registry.reconcile(checkout, commons);
    expect(record).toEqual(held);
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

describe("Registry.supply — boots over a stale record", () => {
  it("mounts the healed checkout package and skips the dead external one", async () => {
    const { paladin, repository, store } = await homed();
    await declare(repository);
    await author(`${store}/real`, "package.viva.js", { owner: "@real", type: "package", slug: "real", version: "0.0.1" });
    await paladin.ledger.registry.write({
      "@viva": { slug: "viva", mount: `${repository}/registry/viva` },
      "@gone": { slug: "gone", mount: "/nowhere/checkout" },
      "@real": { slug: "real", mount: `${store}/real` },
    });

    const registry = paladin.ledger.registry;
    await registry.supply();
    expect(registry.pensieve.has("@commons")).toBe(true);
    expect(registry.pensieve.has("@real")).toBe(true);
    expect(registry.stale).toEqual(["@gone"]);
    expect(Object.keys(await paladin.ledger.registry.tapped())).toEqual(["@gone", "@real", "@commons"]);
  });

  it("a record the package's own declaration contradicts throws at mount, naming both", async () => {
    const { paladin, store } = await homed();
    await author(`${store}/real`, "package.viva.js", { owner: "@real", type: "package", slug: "real", version: "0.0.1" });
    await paladin.ledger.registry.write({ "@other": { slug: "real", mount: `${store}/real` } });
    await expect(paladin.ledger.registry.supply()).rejects.toThrow("the record names @other/package/real, the package declares @real/package/real");
  });

  it("no record seeds from <checkout>/commons", async () => {
    const { paladin, repository } = await homed();
    await declare(repository);

    const registry = paladin.ledger.registry;
    await registry.supply();
    expect(registry.pensieve.has("@commons")).toBe(true);
    expect(await paladin.ledger.registry.tapped()).toEqual({ "@commons": { slug: "commons", mount: `${repository}/commons` } });
  });

  it("a checkout without commons/ supplies nothing and names the absence at accio", async () => {
    const { paladin } = await homed();

    const registry = paladin.ledger.registry;
    await registry.supply();
    expect(registry.pensieve.has("@commons")).toBe(false);
    await expect(registry.accio("@commons/datamap/libsql")).rejects.toThrow("not supplied");
  });
});
