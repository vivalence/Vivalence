import { describe, it } from "@std/testing/bdd";
import { expect } from "@std/expect";
import { Path } from "@vivalence/typology";
import { Paladin } from "../prototypes/paladin.js";

const scaffold = async () => {
  const ledger = await Deno.makeTempDir({ prefix: "vip_tap_test_ledger_" });
  const store = await Deno.makeTempDir({ prefix: "vip_tap_test_store_" });
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
  const dir = await Deno.makeTempDir({ prefix: "vip_tap_test_external_" });
  await author(dir, {
    "package.viva.js": { owner, type: "package", slug: owner.slice(1), version: "0.0.1" },
    "write.viva.js": { type: "game", slug: "write", version: "0.0.1" },
  });
  return dir;
};

describe("Vip.tap — materialize + record, never mount", () => {
  it("tap of an absolute external checkout records it verbatim", async () => {
    const { boot } = await scaffold();
    const paladin = boot();
    const checkout = await external("@external");
    await paladin.vip.tap(checkout);
    expect(await paladin.ledger.registry.list()).toEqual([checkout]);
    expect(paladin.vip.pensieve.size).toBe(0);
  });

  it("tap of a store-relative reference records the bare segment", async () => {
    const { boot, store } = await scaffold();
    const paladin = boot();
    await author(`${store}/pack`, {
      "pack.viva.js": { owner: "@pack", type: "package", slug: "pack", version: "0.0.1" },
    });
    await paladin.vip.tap("./pack");
    expect(await paladin.ledger.registry.list()).toEqual(["pack"]);
  });

  it("tap of a directory without a package declaration throws", async () => {
    const { boot, store } = await scaffold();
    const paladin = boot();
    await author(`${store}/loose`, { "game.viva.js": { type: "game", slug: "loose", version: "0.0.1" } });
    await expect(paladin.vip.tap("loose")).rejects.toThrow("no package declaration");
  });

  it("remote tap without a store scope throws before any clone", async () => {
    const ledger = await Deno.makeTempDir({ prefix: "vip_tap_test_ledger_" });
    const paladin = new Paladin();
    paladin.scopes([["ledger", () => true, () => new Path(ledger)]]);
    await expect(paladin.vip.tap("https://example.com/pack.git")).rejects.toThrow("no package store");
  });

  it("untap removes the record and leaves the store untouched", async () => {
    const { boot, store } = await scaffold();
    const paladin = boot();
    await author(`${store}/pack`, {
      "pack.viva.js": { owner: "@pack", type: "package", slug: "pack", version: "0.0.1" },
    });
    await paladin.vip.tap("pack");
    await paladin.vip.untap("pack");
    expect(await paladin.ledger.registry.list()).toEqual([]);
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
    await first.vip.tap(checkout);
    await first.vip.tap("pack");

    const runtime = boot();
    await runtime.vip.supply();
    expect((await runtime.vip.accio("@external/game/write")).manifest.owner).toBe("@external");
    expect((await runtime.vip.accio("@pack/game/judge")).manifest.owner).toBe("@pack");

    await runtime.vip.untap(checkout);
    const next = boot();
    await next.vip.supply();
    await expect(next.vip.accio("@external/game/write")).rejects.toThrow("not supplied");
    expect((await next.vip.accio("@pack/game/judge")).manifest.slug).toBe("judge");
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
    await paladin.vip.tap(`${checkout}/package.viva.js`);
    expect(await paladin.ledger.registry.list()).toEqual([checkout]);
  });

  it("tap of a directory above the declaration records the declaration's dirname, store-relative", async () => {
    const { boot, store } = await scaffold();
    const paladin = boot();
    await author(`${store}/deep/nested`, {
      "pack.viva.js": { owner: "@pack", type: "package", slug: "pack", version: "0.0.1" },
    });
    await paladin.vip.tap("deep");
    expect(await paladin.ledger.registry.list()).toEqual(["deep/nested"]);
  });

  it("tap of a reference with nothing behind it names what it looked for", async () => {
    const { boot, store } = await scaffold();
    const paladin = boot();
    const thrown = await paladin.vip.tap("absent").then(() => null, (error) => error);
    expect(String(thrown)).toContain(`nothing at ${store}/absent`);
  });
});
