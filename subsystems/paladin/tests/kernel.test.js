import { describe, it } from "@std/testing/bdd";
import { expect } from "@std/expect";
import { App, Path, svelte, v } from "@vivalence/typology";
import { Variant } from "../prototypes/variant.js";
import { Vip } from "../prototypes/vip.js";

const HOME = new Path("/fixtures/probe/test.viva.js");

const inline = {
  manifest: { type: "game", slug: "hello", version: "0.0.1", traits: [] },
  statics: { probe: () => "thunks-fire-in-declarations-never-in-modules" },
  app: new App(svelte`<h1>hello</h1>`, v.buffer({ data: {} })),
};

const pinned = { ...inline, manifest: { ...inline.manifest, slug: "pinned" }, mount: new Path("/pinned/pinned.viva.js") };

const module = {
  manifest: { type: "variant", slug: "probe", version: "0.0.1" },
  source: HOME,
  daemons: [
    {
      manifest: { type: "daemon", slug: "probe", version: "0.0.1" },
      statics: {},
      kernel: [
        "@playground/playground/spawner",
        "/elsewhere/greeter.viva.js",
        "./greeter/greeter.viva.js",
        inline,
        pinned,
      ],
      lighthouse: { module: "@viva/lighthouse/multiplayer", statics: {} },
      datamap: { module: "@viva/datamap/libsql", statics: {} },
      hallucinators: [],
      consume: {},
    },
  ],
};

const fakePaladin = (mod) => ({
  scope: { variant: mod.source, mountpoint: new Path("/mountpoint") },
  state: { dir: async () => {} },
  find: { type: async () => [mod] },
  publish: () => {},
});

describe("variant kernel references", () => {
  it("the four kernel forms resolve: bare kept, absolute kept, relative vs the variant file, inline stamped with the variant mount", async () => {
    const variant = await new Variant(fakePaladin(module)).mount();
    const [daemon] = variant.daemons;
    expect(daemon.kernel[0]).toBe("@playground/playground/spawner");
    expect(daemon.kernel[1]).toBe("/elsewhere/greeter.viva.js");
    expect(daemon.kernel[2]).toBe("/fixtures/probe/greeter/greeter.viva.js");
    expect(daemon.kernel[3].manifest.slug).toBe("hello");
    expect(daemon.kernel[3].mount).toBe(HOME);
  });

  it("an inline entry carrying its own mount keeps it", async () => {
    const variant = await new Variant(fakePaladin(module)).mount();
    const [daemon] = variant.daemons;
    expect(String(daemon.kernel[4].mount)).toBe(String(pinned.mount));
  });

  it("an inline module is module-shaped: hydrate never fires inside it — thunks and App survive resolve", async () => {
    const variant = await new Variant(fakePaladin(module)).mount();
    const [daemon] = variant.daemons;
    expect(typeof daemon.kernel[3].statics.probe).toBe("function");
    expect(daemon.kernel[3].app.source).toContain("hello");
  });
});

describe("Vip.accioOne", () => {
  const fake = (modules) => ({ read: { viva: async (path) => modules[path.absolute ?? String(path)] } });

  it("an absolute path reads the module and stamps its mount", async () => {
    const vip = new Vip(fake({ "/elsewhere/greeter.viva.js": { manifest: { type: "game", slug: "greeter", version: "0.0.1" } } }));
    const resolved = await vip.accioOne("/elsewhere/greeter.viva.js");
    expect(resolved.manifest.slug).toBe("greeter");
    expect(resolved.mount).toBeInstanceOf(Path);
    expect(resolved.mount.absolute).toBe("/elsewhere/greeter.viva.js");
  });

  it("an inline module (manifest, no module key) passes through verbatim", async () => {
    const vip = new Vip(fake({}));
    const entry = { manifest: { type: "game", slug: "hello", version: "0.0.1" }, mount: HOME };
    expect(await vip.accioOne(entry)).toBe(entry);
  });
});
