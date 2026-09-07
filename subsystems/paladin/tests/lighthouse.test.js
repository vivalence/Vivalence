import { describe, it } from "@std/testing/bdd";
import { expect } from "@std/expect";
import { Path } from "@vivalence/typology";
import { Instance } from "../prototypes/instance.js";

const HOME = new Path("/fixtures/probe/test.viva.js");
const MULTIPLAYER = { module: "@commons/lighthouse/multiplayer", statics: { remote: "http://lighthouse/multiplayer" } };
const OWN = { module: "@elsewhere/lighthouse/own", statics: { remote: "http://own" } };

const daemon = (extra = {}) => ({
  manifest: { type: "daemon", slug: "probe", version: "0.0.1" },
  kernel: [],
  datamap: { module: "@commons/datamap/libsql" },
  ...extra,
});

const module = (exports) => ({
  manifest: { type: "instance", slug: "probe", version: "0.0.1" },
  source: HOME,
  ...exports,
});

const fakePaladin = (mod) => ({
  scope: { instance: mod.source, mountpoint: new Path("/mountpoint") },
  state: { dir: async () => {} },
  find: { type: async () => [mod] },
  publish: () => {},
});

const mount = (exports) => new Instance(fakePaladin(module(exports))).mount();

describe("instance lighthouse — declared once, inherited by every daemon", () => {
  it("a daemon without a lighthouse inherits the instance's, module and all", async () => {
    const instance = await mount({ lighthouse: MULTIPLAYER, daemons: [daemon()] });
    const [held] = instance.daemons;
    expect(held.lighthouse).toBe(instance.lighthouse);
    expect(held.lighthouse.module).toBe("@commons/lighthouse/multiplayer");
    expect(held.lighthouse.statics.remote.absolute).toBe("http://lighthouse/multiplayer");
    expect(instance.faults).toEqual([]);
  });

  it("a daemon binding its own lighthouse keeps it", async () => {
    const instance = await mount({ lighthouse: MULTIPLAYER, daemons: [daemon({ lighthouse: OWN })] });
    const [held] = instance.daemons;
    expect(held.lighthouse).not.toBe(instance.lighthouse);
    expect(held.lighthouse.module).toBe("@elsewhere/lighthouse/own");
  });

  it("no lighthouse anywhere: a fault by name, the mount still resolves", async () => {
    const instance = await mount({ daemons: [daemon()] });
    expect(instance.faults).toEqual(["daemon[probe].lighthouse none declared, none to inherit"]);
  });

  it("an instance lighthouse without a module is a fault by name", async () => {
    const instance = await mount({ lighthouse: { statics: { remote: "http://lighthouse" } }, daemons: [] });
    expect(instance.faults).toEqual(["lighthouse must have required properties module"]);
  });

  it("no daemons, no lighthouse: mounts", async () => {
    const instance = await mount({ daemons: [] });
    expect(instance.lighthouse).toBeUndefined();
  });
});
