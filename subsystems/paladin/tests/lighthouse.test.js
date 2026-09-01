import { describe, it } from "@std/testing/bdd";
import { expect } from "@std/expect";
import { Path } from "@vivalence/typology";
import { Instance } from "../prototypes/instance.js";

const HOME = new Path("/fixtures/probe/test.viva.js");
const MULTIPLAYER = { module: "@commons/lighthouse/multiplayer", statics: { remote: "http://lighthouse/multiplayer" } };
const OWN = { module: "@elsewhere/lighthouse/own", statics: { remote: "http://own" } };

const daemon = (extra = {}) => ({
  manifest: { type: "daemon", slug: "probe", version: "0.0.1" },
  statics: {},
  kernel: [],
  datamap: { module: "@commons/datamap/libsql", statics: {} },
  hallucinators: [],
  consume: {},
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
    expect(held.lighthouse.statics.remote).toBe("http://lighthouse/multiplayer");
  });

  it("a daemon binding its own lighthouse keeps it", async () => {
    const instance = await mount({ lighthouse: MULTIPLAYER, daemons: [daemon({ lighthouse: OWN })] });
    const [held] = instance.daemons;
    expect(held.lighthouse).not.toBe(instance.lighthouse);
    expect(held.lighthouse.module).toBe("@elsewhere/lighthouse/own");
  });

  it("no lighthouse anywhere: the daemon's inherited {} fails by name at mount", async () => {
    await expect(mount({ daemons: [daemon()] })).rejects.toThrow("daemon[probe]/lighthouse");
  });

  it("an instance lighthouse without a module fails by name at mount", async () => {
    await expect(mount({ lighthouse: { statics: { remote: "http://lighthouse" } }, daemons: [] })).rejects.toThrow(
      "lighthouse: must have required properties module",
    );
  });

  it("no daemons, no lighthouse: mounts", async () => {
    const instance = await mount({ daemons: [] });
    expect(instance.lighthouse).toEqual({});
  });
});
