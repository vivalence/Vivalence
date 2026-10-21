import { Path, Url, Vector, specimen, v } from "@vivalence/typology";
import { Paladin } from "../paladin/prototype.js";
import { Instance } from "../instance/prototype.js";
import { bake, baked, belt } from "../paladin/lifecycle.js";
import vault from "../gestalten/belt/vault.js";

const { describe, it, expect } = specimen;

const RECIPE = {
  manifest: { type: "instance", slug: "probe", version: "0.0.1" },
  environment: { type: "object", properties: {} },
  runtime: {
    manifest: { slug: "runtime" },
    statics: { serve: "http://0.0.0.0:2501/", remote: "http://localhost:2501/" },
    mountpoint: "/mount/runtime",
    reference: "/runtime/runtime",
    url: "http://localhost:2501/runtime/runtime",
    attach: "http://localhost:2501/attached",
    modes: [{ module: "@commons/harness/runtime", reference: "/mode/harness/runtime", url: "http://localhost:2501/runtime/runtime/mode/harness/runtime", mountpoint: "/mount/runtime/mode_harness_runtime" }],
  },
  lighthouse: { secrets: { jwt: "hello-secret-hello-secret-hello-secret" }, traits: ["AUTOLOGIN"], trait: { AUTOLOGIN: { username: "probe" } } },
  clients: [{ manifest: { type: "client", slug: "anima", version: "0.0.1", traits: ["HOME"] }, statics: { serve: "http://localhost:1794/" }, reference: "/client/anima", modes: ["@probe/home/console"], trait: { HOME: { reference: "/runtime/runtime/mode/harness/runtime" } } }],
};

const namespace = { manifest: { type: "home", slug: "console", version: "0.0.1", traits: [], owner: "@probe" }, repl: new Vector(), source: new Path("/registry/probe/modes/home/console/console.viva.js") };

const citizen = () => ({
  ...namespace,
  module: namespace,
  identifier: "@probe/home/console",
  manifest: namespace.manifest,
  statics: {},
  secrets: {},
  reference: new Path("/mode/home/console"),
  url: new Url("http://localhost:2501/client/anima/mode/home/console"),
});

const live = () => {
  const paladin = belt(new Paladin(), [vault]);
  paladin.assign({ VIVA_RUNTIME_SERVE: "http://localhost:2501/", PUBLIC_VIVA_RUNTIME_REMOTE: "${VIVA_RUNTIME_SERVE}", SECRET_VIVA_JWT: "never-baked" }, "ledger");
  paladin.instance = Object.assign(new Instance(paladin), v.primitives.instance.Instance.decode(v.primitives.instance.Instance.cast(RECIPE)));
  paladin.ledger = { registry: { wire: async (mask) => ({ hallucinators: [], consume: {}, domain: {}, modes: mask.modes.map(citizen) }) } };
  return paladin;
};

describe("paladin bake ⟷ baked — the instance crosses to a browser as strings and comes back as prototypes", () => {
  it("bake: every Signature is its absolute string, PUBLIC_VIVA_ expanded, the paladin dropped, the citizen its wire fields; the live instance is not mutated", async () => {
    const paladin = live();
    expect(paladin.instance.runtime.statics.remote).toBeInstanceOf(Url);
    const data = await bake(paladin, "anima");
    expect(data.env).toEqual({ PUBLIC_VIVA_RUNTIME_REMOTE: "http://localhost:2501/" });
    expect(data.instance.runtime.statics.remote).toBe("http://localhost:2501/");
    expect(data.instance.runtime.mountpoint).toBe("/mount/runtime");
    expect(data.instance.runtime.modes[0].url).toBe("http://localhost:2501/runtime/runtime/mode/harness/runtime");
    expect(data.instance.clients[0].reference).toBe("/client/anima");
    expect("paladin" in data.instance).toBe(false);
    expect(data.wired.modes).toEqual([]);
    expect(data.modes).toEqual([{
      identifier: "@probe/home/console",
      manifest: namespace.manifest,
      statics: {},
      secrets: {},
      reference: "/mode/home/console",
      url: "http://localhost:2501/client/anima/mode/home/console",
      source: "/registry/probe/modes/home/console/console.viva.js",
    }]);
    expect(JSON.parse(JSON.stringify(data))).toEqual(data);
    expect(paladin.instance.runtime.statics.remote).toBeInstanceOf(Url);
    expect(paladin.instance.clients[0].reference).toBeInstanceOf(Path);
  });

  it("bake: an unknown client is loud", async () => {
    await expect(bake(live(), "ghost")).rejects.toThrow("[PALADIN] bake ghost: no client of that slug — anima");
  });

  it("baked: the instance decodes through its schema — remote a Url with the origin, references Paths; the wire revives a citizen as namespace + Mode", async () => {
    const data = await bake(live(), "anima");
    const paladin = belt(new Paladin(), [vault]);
    baked(paladin, { ...data, modes: data.modes.map((held) => ({ ...held, module: () => Promise.resolve(namespace) })) });
    expect(paladin.instance).toBeInstanceOf(Instance);
    expect(paladin.instance.runtime.statics.remote).toBeInstanceOf(Url);
    expect(paladin.instance.runtime.statics.remote.origin).toBe("http://localhost:2501");
    expect(paladin.instance.runtime.statics.remote.absolute).toBe("http://localhost:2501/");
    expect(new Url(paladin.instance.runtime.statics.remote).branch("/multiplex").absolute).toBe("http://localhost:2501/multiplex");
    expect(paladin.instance.runtime.url.absolute).toBe("http://localhost:2501/runtime/runtime");
    expect(paladin.instance.runtime.reference.absolute).toBe("/runtime/runtime");
    expect(paladin.instance.runtime.modes[0].url.origin).toBe("http://localhost:2501");
    expect(paladin.instance.clients[0].reference.absolute).toBe("/client/anima");
    expect(paladin.instance.clients[0].trait.HOME.reference).toBe("/runtime/runtime/mode/harness/runtime");
    expect(paladin.env.get("PUBLIC_VIVA_RUNTIME_REMOTE")).toBe("http://localhost:2501/");
    expect(paladin.env.has("SECRET_VIVA_JWT")).toBe(false);
    const wired = await paladin.ledger.registry.wire();
    expect(wired.hallucinators).toEqual([]);
    expect(wired.modes[0].reference.absolute).toBe("/mode/home/console");
    expect(wired.modes[0].url.origin).toBe("http://localhost:2501");
    expect(wired.modes[0].module).toBe(namespace);
    expect(wired.modes[0].repl).toBe(namespace.repl);
    expect(wired.modes[0].manifest).toEqual(namespace.manifest);
  });
});
