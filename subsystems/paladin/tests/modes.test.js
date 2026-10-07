import { describe, it } from "@std/testing/bdd";
import { expect } from "@std/expect";
import { Path } from "@vivalence/typology";
import { Paladin } from "../prototypes/paladin.js";
import * as lifecycle from "../lifecycle/index.js";
import { Registry } from "../prototypes/ledger/registry.js";

const HOME = new Path("/fixtures/probe/instance.viva.json");

const module = {
  manifest: { type: "instance", slug: "probe", version: "0.0.1" },
  daemons: [
    {
      manifest: { type: "daemon", slug: "probe", version: "0.0.1" },
      statics: {},
      modes: [
        "@commons/playground/spawner",
        "/elsewhere/greeter.viva.js",
        "./greeter/greeter.viva.js",
      ],
      hallucinators: [],
      consume: {},
    },
  ],
};

const mount = (mod) => {
  const paladin = new Paladin();
  paladin.scopes([
    ["instance", () => true, () => new Path(HOME.dirname)],
    ["mountpoint", () => true, () => new Path("/mountpoint")],
  ]);
  paladin.read.json = async () => JSON.parse(JSON.stringify(mod));
  return lifecycle.mount(lifecycle.populate.instance(paladin));
};

describe("instance modes identifiers", () => {
  it("the three modes forms resolve: bare kept, absolute kept, relative vs the instance file — an inline module object is refused by the mask", async () => {
    const instance = await mount(module);
    const [daemon] = instance.daemons;
    expect(daemon.modes[0].module).toBe("@commons/playground/spawner");
    expect(daemon.modes[1].module).toBe("/elsewhere/greeter.viva.js");
    expect(daemon.modes[2].module).toBe("/fixtures/probe/greeter/greeter.viva.js");
    expect(instance.faults).toEqual([]);
    const inline = { ...module, daemons: [{ ...module.daemons[0], modes: [{ manifest: { type: "game", slug: "hello" }, statics: {} }] }] };
    await expect(mount(inline)).rejects.toThrow("/daemons/0/modes/0");
  });

  it("every mode has a ground without the recipe saying one: <daemon mountpoint>/mode_<type>_<slug>; an identifier names both, a path names what it can, a declared mountpoint wins", async () => {
    const instance = await mount({
      ...module,
      daemons: [{ ...module.daemons[0], modes: [...module.daemons[0].modes, "/pkg/modes/editor/import/import.viva.js", { module: "@commons/editor/media", mountpoint: "/Users/op/media" }] }],
    });
    const [daemon] = instance.daemons;
    expect(daemon.mountpoint.absolute).toBe("/mountpoint/daemon_probe");
    expect(daemon.modes[0].mountpoint).toBeInstanceOf(Path);
    expect(daemon.modes[0].mountpoint.absolute).toBe("/mountpoint/daemon_probe/mode_playground_spawner");
    expect(daemon.modes[1].mountpoint.absolute).toBe("/mountpoint/daemon_probe/mode_greeter");
    expect(daemon.modes[2].mountpoint.absolute).toBe("/mountpoint/daemon_probe/mode_greeter");
    expect(daemon.modes[3].mountpoint.absolute).toBe("/mountpoint/daemon_probe/mode_editor_import");
    expect(daemon.modes[4].mountpoint.absolute).toBe("/Users/op/media");
    expect(instance.faults).toEqual([]);
  });

  it("a reference entry { module, mountpoint } names its module — no source is stamped on it, so the module's own file stays the citizen's source", async () => {
    const instance = await mount({
      ...module,
      daemons: [{ ...module.daemons[0], modes: [{ module: "@commons/editor/media", mountpoint: "/Users/op/media" }] }],
    });
    const [daemon] = instance.daemons;
    expect(daemon.modes[0].module).toBe("@commons/editor/media");
    expect(daemon.modes[0].source).toBeUndefined();
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

  it("a mask folds over what it names — the module's statics sit under the mask's, key by key; module is the object, identifier the string", async () => {
    const registry = new Registry(fake({}));
    registry.lookup = async () => ({ manifest: { type: "office", slug: "vdex", version: "0.0.1" }, statics: { formats: ["md"], ignore: ["bak"] }, source: new Path("/pensieve/vdex.viva.js") });
    const citizen = await registry.accio({ module: "@vcompany/office/vdex", statics: { formats: ["md", "org"] } });
    expect(citizen.module.manifest.slug).toBe("vdex");
    expect(citizen.statics).toEqual({ formats: ["md", "org"], ignore: ["bak"] });
    expect(citizen.identifier).toBe("@vcompany/office/vdex");
  });
});
