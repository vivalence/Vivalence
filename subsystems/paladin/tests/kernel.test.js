import { describe, it } from "@std/testing/bdd";
import { expect } from "@std/expect";
import { App, Path, svelte, v } from "@vivalence/typology";
import { Paladin } from "../prototypes/paladin.js";
import * as lifecycle from "../lifecycle/index.js";
import { Registry } from "../prototypes/ledger/registry.js";

const HOME = new Path("/fixtures/probe/test.viva.js");

const inline = {
  manifest: { type: "game", slug: "hello", version: "0.0.1", traits: [] },
  statics: { probe: () => "thunks-fire-in-declarations-never-in-modules" },
  application: new App(svelte`<h1>hello</h1>`, v.buffer({ data: {} })),
};

const pinned = { ...inline, manifest: { ...inline.manifest, slug: "pinned" }, source: new Path("/pinned/pinned.viva.js") };

const module = {
  manifest: { type: "instance", slug: "probe", version: "0.0.1" },
  source: HOME,
  daemons: [
    {
      manifest: { type: "daemon", slug: "probe", version: "0.0.1" },
      statics: {},
      kernel: [
        "@commons/playground/spawner",
        "/elsewhere/greeter.viva.js",
        "./greeter/greeter.viva.js",
        inline,
        pinned,
      ],
      lighthouse: { module: "@commons/lighthouse/multiplayer", statics: { remote: "http://lighthouse/" } },
      datamap: { module: "@commons/datamap/libsql", statics: {} },
      hallucinators: [],
      consume: {},
    },
  ],
};

const mount = (mod) => {
  const paladin = new Paladin();
  paladin.scopes([
    ["instance", () => true, () => new Path(mod.source.absolute)],
    ["mountpoint", () => true, () => new Path("/mountpoint")],
  ]);
  paladin.find.type = async () => [mod];
  return lifecycle.mount(lifecycle.populate.instance(paladin));
};

describe("instance kernel identifiers", () => {
  it("the four kernel forms resolve: bare kept, absolute kept, relative vs the instance file, inline stamped with the instance mount — each seated with its mountpoint", async () => {
    const instance = await mount(module);
    const [daemon] = instance.daemons;
    expect(daemon.kernel[0].module).toBe("@commons/playground/spawner");
    expect(daemon.kernel[1].module).toBe("/elsewhere/greeter.viva.js");
    expect(daemon.kernel[2].module).toBe("/fixtures/probe/greeter/greeter.viva.js");
    expect(daemon.kernel[3].manifest.slug).toBe("hello");
    expect(daemon.kernel[3].source).toBe(HOME);
    expect(instance.faults).toEqual([]);
  });

  it("every mode has a ground without the recipe saying one: <daemon mountpoint>/mode_<type>_<slug>; an identifier names both, a path names what it can, a declared mountpoint wins", async () => {
    const instance = await mount({
      ...module,
      daemons: [{ ...module.daemons[0], kernel: [...module.daemons[0].kernel, "/pkg/modes/editor/import/import.viva.js", { module: "@commons/editor/media", mountpoint: "/Users/op/media" }] }],
    });
    const [daemon] = instance.daemons;
    expect(daemon.mountpoint.absolute).toBe("/mountpoint/daemon_probe");
    expect(daemon.kernel[0].mountpoint).toBeInstanceOf(Path);
    expect(daemon.kernel[0].mountpoint.absolute).toBe("/mountpoint/daemon_probe/mode_playground_spawner");
    expect(daemon.kernel[1].mountpoint.absolute).toBe("/mountpoint/daemon_probe/mode_greeter");
    expect(daemon.kernel[2].mountpoint.absolute).toBe("/mountpoint/daemon_probe/mode_greeter");
    // an inline module carries the seat as a key — a string, since the Module schematic casts no Mountpoint; nothing reads it
    expect(daemon.kernel[3].mountpoint).toBe("/mountpoint/daemon_probe/mode_game_hello");
    expect(daemon.kernel[5].mountpoint.absolute).toBe("/mountpoint/daemon_probe/mode_editor_import");
    expect(daemon.kernel[6].mountpoint.absolute).toBe("/Users/op/media");
    expect(instance.faults).toEqual([]);
  });

  it("an inline entry carrying its own source keeps it", async () => {
    const instance = await mount(module);
    const [daemon] = instance.daemons;
    expect(String(daemon.kernel[4].source)).toBe(String(pinned.source));
  });

  it("an inline module is module-shaped: hydrate never fires inside it — thunks and App survive settle", async () => {
    const instance = await mount(module);
    const [daemon] = instance.daemons;
    expect(typeof daemon.kernel[3].statics.probe).toBe("function");
    expect(daemon.kernel[3].application.source).toContain("hello");
  });
});

describe("registry.accio — the citizen", () => {
  const fake = (modules) => ({ read: { viva: async (path) => modules[path.absolute ?? String(path)] } });

  it("an absolute path reads the module and stamps its source", async () => {
    const registry = new Registry(fake({ "/elsewhere/greeter.viva.js": { manifest: { type: "game", slug: "greeter", version: "0.0.1" } } }));
    const resolved = await registry.accio("/elsewhere/greeter.viva.js");
    expect(resolved.manifest.slug).toBe("greeter");
    expect(resolved.source).toBeInstanceOf(Path);
    expect(resolved.source.absolute).toBe("/elsewhere/greeter.viva.js");
  });

  it("an inline module (manifest, no module key) is its own citizen", async () => {
    const registry = new Registry(fake({}));
    const entry = { manifest: { type: "game", slug: "hello", version: "0.0.1" }, source: HOME };
    const citizen = await registry.accio(entry);
    expect(citizen.module).toBe(entry);
    expect(citizen.identifier).toBe(null);
    expect(citizen.manifest.slug).toBe("hello");
  });

  it("a mask folds over what it names — the module's statics sit under the mask's, key by key; module is the object, identifier the string", async () => {
    const registry = new Registry(fake({}));
    registry.lookup = async () => ({ manifest: { type: "office", slug: "vdex", version: "0.0.1" }, statics: { formats: ["md"], ignore: ["bak"] }, source: new Path("/pensieve/vdex.viva.js") });
    const citizen = await registry.accio({ module: "@vcompany/office/vdex", statics: { formats: ["md", "org"] } });
    expect(citizen.module.manifest.slug).toBe("vdex");
    expect(citizen.statics).toEqual({ formats: ["md", "org"], ignore: ["bak"] });
    expect(citizen.identifier).toBe("@vcompany/office/vdex");
  });
});
