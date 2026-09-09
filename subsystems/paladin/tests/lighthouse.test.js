import { describe, it } from "@std/testing/bdd";
import { expect } from "@std/expect";
import { Path, Url } from "@vivalence/typology";
import { Paladin } from "../prototypes/paladin.js";
import * as lifecycle from "../lifecycle/index.js";

const HOME = new Path("/fixtures/probe/test.viva.js");
const MULTIPLAYER = { module: "@commons/lighthouse/multiplayer", statics: { remote: "http://lighthouse/multiplayer" } };
const OWN = { module: "@elsewhere/lighthouse/own", statics: { remote: "http://own" } };

const daemon = (extra = {}) => ({
  manifest: { type: "daemon", slug: "probe", version: "0.0.1" },
  kernel: [],
  datamap: { module: "@commons/datamap/libsql" },
  ...extra,
});

const mount = (exports) => {
  const paladin = new Paladin();
  paladin.scopes([
    ["instance", () => true, () => new Path("/fixtures/probe/test.viva.js")],
    ["mountpoint", () => true, () => new Path("/mountpoint")],
  ]);
  paladin.find.type = async () => [
    { manifest: { type: "instance", slug: "probe", version: "0.0.1" }, source: HOME, ...exports },
  ];
  return lifecycle.mount(lifecycle.populate.instance(paladin));
};

describe("instance lighthouse — declared once, every daemon inherits a copy", () => {
  it("a daemon without a lighthouse inherits the instance's: a decoded COPY, module and all", async () => {
    const instance = await mount({ lighthouse: MULTIPLAYER, daemons: [daemon()] });
    const [held] = instance.daemons;
    expect(held.lighthouse).not.toBe(instance.lighthouse);
    expect(held.lighthouse.module).toBe("@commons/lighthouse/multiplayer");
    expect(held.lighthouse.statics.remote).toBeInstanceOf(Url);
    expect(held.lighthouse.statics.remote.absolute).toBe("http://lighthouse/multiplayer");
    expect(instance.lighthouse.statics.remote).toBeInstanceOf(Url);
    expect(instance.faults).toEqual([]);
  });

  it("a daemon binding its own lighthouse keeps it", async () => {
    const instance = await mount({ lighthouse: MULTIPLAYER, daemons: [daemon({ lighthouse: OWN })] });
    const [held] = instance.daemons;
    expect(held.lighthouse.module).toBe("@elsewhere/lighthouse/own");
    expect(held.lighthouse.statics.remote.absolute).toBe("http://own/");
  });

  it("no lighthouse anywhere: the schematic names the daemon, the mount still resolves", async () => {
    const instance = await mount({ daemons: [daemon()] });
    expect(instance.faults).toEqual(["daemon[probe] must have required properties lighthouse"]);
  });

  it("an instance lighthouse without a module faults ONCE, at the root — the copies echo it and are not reported", async () => {
    const instance = await mount({ lighthouse: { statics: { remote: "http://lighthouse" } }, daemons: [daemon(), daemon({ manifest: { type: "daemon", slug: "other" } })] });
    expect(instance.faults).toEqual(["lighthouse must have required properties module"]);
  });

  it("no daemons, no lighthouse: mounts", async () => {
    const instance = await mount({ daemons: [] });
    expect(instance.lighthouse).toBeUndefined();
    expect(instance.faults).toEqual([]);
  });
});
