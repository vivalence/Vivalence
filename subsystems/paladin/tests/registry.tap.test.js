import { describe, it } from "@std/testing/bdd";
import { expect } from "@std/expect";
import { Path } from "@vivalence/typology";
import { Paladin } from "../paladin/prototype.js";

const scaffold = async () => {
  const ledger = await Deno.makeTempDir({ prefix: "registry_tap_test_ledger_" });
  const store = `${ledger}/registry`;
  await Deno.mkdir(store);
  const boot = () => {
    const paladin = new Paladin();
    paladin.scopes([
      ["ledger", () => true, () => new Path(ledger)],
      ["registry", () => true, () => new Path(store)],
    ]);
    return paladin;
  };
  return { boot, ledger, store };
};

const author = async (dir, modules) => {
  await Deno.mkdir(dir, { recursive: true });
  for (const [filename, manifest] of Object.entries(modules)) {
    await Deno.writeTextFile(`${dir}/${filename}`, `export const manifest = ${JSON.stringify(manifest)};`);
  }
};

const external = async (owner) => {
  const dir = await Deno.makeTempDir({ prefix: "registry_tap_test_external_" });
  await author(dir, {
    "package.viva.js": { owner, type: "package", slug: owner.slice(1), version: "0.0.1" },
    "write.viva.js": { type: "game", slug: "write", version: "0.0.1" },
  });
  return dir;
};

describe("Registry.tap — materialize + record, never mount", () => {
  it("tap of an external checkout records owner → slug and the absolute mount", async () => {
    const { boot } = await scaffold();
    const paladin = boot();
    const checkout = await external("@external");
    expect(await paladin.ledger.registry.tap(checkout)).toBe("@external");
    expect(await paladin.ledger.registry.tapped()).toEqual({ "@external": { slug: "external", mount: checkout } });
    expect(paladin.ledger.registry.pensieve.size).toBe(0);
  });

  it("tap of a store location beside the record records the mount relative to the record file", async () => {
    const { boot, store } = await scaffold();
    const paladin = boot();
    await author(`${store}/pack`, {
      "pack.viva.js": { owner: "@pack", type: "package", slug: "pack", version: "0.0.1" },
    });
    await paladin.ledger.registry.tap("./pack");
    expect(await paladin.ledger.registry.tapped()).toEqual({ "@pack": { slug: "pack", mount: "./registry/pack" } });
  });

  it("tap of a directory without a package declaration throws", async () => {
    const { boot, store } = await scaffold();
    const paladin = boot();
    await author(`${store}/loose`, { "game.viva.js": { type: "game", slug: "loose", version: "0.0.1" } });
    await expect(paladin.ledger.registry.tap("loose")).rejects.toThrow("no package declaration");
  });

  it("remote tap without a store scope throws before any clone", async () => {
    const ledger = await Deno.makeTempDir({ prefix: "registry_tap_test_ledger_" });
    const paladin = new Paladin();
    paladin.scopes([["ledger", () => true, () => new Path(ledger)]]);
    await expect(paladin.ledger.registry.tap("https://example.com/pack.git")).rejects.toThrow("no package store");
  });

  it("untap removes the record and leaves the store untouched", async () => {
    const { boot, store } = await scaffold();
    const paladin = boot();
    await author(`${store}/pack`, {
      "pack.viva.js": { owner: "@pack", type: "package", slug: "pack", version: "0.0.1" },
    });
    await paladin.ledger.registry.tap("pack");
    await paladin.ledger.registry.untap("@pack");
    expect(await paladin.ledger.registry.tapped()).toEqual({});
    expect((await Deno.stat(`${store}/pack`)).isDirectory).toBe(true);
  });

  it("tap → supply → accio: a mixed-kind record mounts at boot; untap starves the next boot", async () => {
    const { boot, store } = await scaffold();
    const checkout = await external("@external");
    const first = boot();
    await author(`${store}/pack`, {
      "pack.viva.js": { owner: "@pack", type: "package", slug: "pack", version: "0.0.1" },
      "judge.viva.js": { type: "game", slug: "judge", version: "0.0.1" },
    });
    await first.ledger.registry.tap(checkout);
    await first.ledger.registry.tap("pack");

    const runtime = boot();
    await runtime.ledger.registry.supply();
    expect((await runtime.ledger.registry.accio("@external/game/write")).manifest.owner).toBe("@external");
    expect((await runtime.ledger.registry.accio("@pack/game/judge")).manifest.owner).toBe("@pack");

    await runtime.ledger.registry.untap("@external");
    const next = boot();
    await next.ledger.registry.supply();
    await expect(next.ledger.registry.accio("@external/game/write")).rejects.toThrow("not supplied");
    expect((await next.ledger.registry.accio("@pack/game/judge")).manifest.slug).toBe("judge");
  });

  it("clone.remote classifies every remote spelling, so a caller can skip path resolution", async () => {
    const { boot } = await scaffold();
    const paladin = boot();
    for (const remote of ["https://host/r.git", "http://host/r", "git@github.com:vivalence/registry-standalone.git", "ssh://host/r.git"]) {
      expect(paladin.clone.remote(remote)).toBe(true);
    }
    for (const local of ["/abs/path", "./rel", "pack", "", null, undefined]) {
      expect(paladin.clone.remote(local)).toBe(false);
    }
  });

  it("tap of a declaration file records the declaration's dirname", async () => {
    const { boot } = await scaffold();
    const paladin = boot();
    const checkout = await external("@external");
    await paladin.ledger.registry.tap(`${checkout}/package.viva.js`);
    expect(await paladin.ledger.registry.tapped()).toEqual({ "@external": { slug: "external", mount: checkout } });
  });

  it("tap of a directory above the declaration records the declaration's dirname, store-relative", async () => {
    const { boot, store } = await scaffold();
    const paladin = boot();
    await author(`${store}/deep/nested`, {
      "pack.viva.js": { owner: "@pack", type: "package", slug: "pack", version: "0.0.1" },
    });
    await paladin.ledger.registry.tap("deep");
    expect(await paladin.ledger.registry.tapped()).toEqual({ "@pack": { slug: "pack", mount: "./registry/deep/nested" } });
  });

  it("tap of a directory holding two package declarations throws naming both", async () => {
    const { boot, store } = await scaffold();
    const paladin = boot();
    await author(`${store}/two/one`, { "one.viva.js": { owner: "@one", type: "package", slug: "one", version: "0.0.1" } });
    await author(`${store}/two/other`, { "other.viva.js": { owner: "@other", type: "package", slug: "other", version: "0.0.1" } });
    await expect(paladin.ledger.registry.tap("two")).rejects.toThrow("2 package declarations under");
    expect(await paladin.ledger.registry.tapped()).toEqual({});
  });

  it("tap of a directory whose root declares a package takes that one — a package nested under it is its own", async () => {
    const { boot, store } = await scaffold();
    const paladin = boot();
    await author(`${store}/outer`, { "package.viva.js": { owner: "@outer", type: "package", slug: "outer", version: "0.0.1" } });
    await author(`${store}/outer/fixtures/inner`, { "package.viva.js": { owner: "@inner", type: "package", slug: "inner", version: "0.0.1" } });
    await paladin.ledger.registry.tap("outer");
    await paladin.ledger.registry.tap("outer/fixtures/inner");
    expect(await paladin.ledger.registry.tapped()).toEqual({
      "@outer": { slug: "outer", mount: "./registry/outer" },
      "@inner": { slug: "inner", mount: "./registry/outer/fixtures/inner" },
    });
  });

  it("a second checkout of a tapped owner throws — one owner, one mount", async () => {
    const { boot } = await scaffold();
    const paladin = boot();
    const first = await external("@external");
    const second = await external("@external");
    await paladin.ledger.registry.tap(first);
    await expect(paladin.ledger.registry.tap(second)).rejects.toThrow(`@external is tapped at ${first} — untap it`);
  });

  it("tap of a location with nothing behind it names what it looked for", async () => {
    const { boot, store } = await scaffold();
    const paladin = boot();
    const thrown = await paladin.ledger.registry.tap("absent").then(() => null, (error) => error);
    expect(String(thrown)).toContain(`nothing at ${store}/absent`);
  });
});
