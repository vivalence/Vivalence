// hydrate is the only place a thunk fires, so it is the only place they can be observed.
import { specimen, Url } from "@vivalence/typology";
import { Paladin, hydrate } from "@vivalence/paladin/typology";

const { describe, it, expect } = specimen;

const mk = (pairs = {}, secrets = {}) => {
  const paladin = new Paladin();
  paladin.env.assign(pairs, "flag");
  paladin.secret.assign(secrets, "flag");
  return paladin;
};

describe("hydrate — the pinhole", () => {
  it("without a record it is the old function: fires thunks, walks arrays and plain objects", () => {
    const held = hydrate({
      literal: 7,
      thunk: () => "fired",
      list: [() => 1, { deep: () => 2 }],
      keep: null,
    });
    expect(held.literal).toBe(7);
    expect(held.thunk).toBe("fired");
    expect(held.list[0]).toBe(1);
    expect(held.list[1].deep).toBe(2);
    expect(held.keep).toBe(null);
  });

  it("labels every thunk with its path — arrays by index, objects by key", () => {
    const record = [];
    const paladin = mk();
    hydrate(
      { statics: { serve: () => "a" }, list: [{ remote: () => "b" }] },
      record,
      paladin,
      "runtime",
    );
    expect(record.map((row) => row.at).sort()).toEqual([
      "runtime.list[0].remote",
      "runtime.statics.serve",
    ]);
  });

  it("learns which keys a thunk read, from both bags, without the thunk knowing", () => {
    const record = [];
    const paladin = mk({ VIVA_PROBE_SERVE: "http://x/" }, { SECRET_VIVA_PROBE: "shh" });
    hydrate(
      {
        serve: () => paladin.env.get("VIVA_PROBE_SERVE"),
        both: () => `${paladin.env.get("VIVA_PROBE_SERVE")}${paladin.secret.get("SECRET_VIVA_PROBE")}`,
      },
      record,
      paladin,
      "runtime",
    );
    const by = Object.fromEntries(record.map((row) => [row.at, row]));
    expect(by["runtime.serve"].read).toEqual(["VIVA_PROBE_SERVE"]);
    expect(by["runtime.both"].read).toEqual(["VIVA_PROBE_SERVE", "SECRET_VIVA_PROBE"]);
    // and the values still arrive — the view is read-through, not a stub
  });

  it("names the UNSET keys separately from the read ones", () => {
    const record = [];
    const paladin = mk({ VIVA_PROBE_SET: "yes", VIVA_PROBE_HOLLOW: "" });
    hydrate(
      {
        one: () => paladin.env.get("VIVA_PROBE_SET"),
        two: () => paladin.env.get("VIVA_PROBE_MISSING"),
        three: () => paladin.env.get("VIVA_PROBE_HOLLOW"),
      },
      record,
      paladin,
      "runtime",
    );
    const by = Object.fromEntries(record.map((row) => [row.at, row]));
    expect(by["runtime.one"].unset).toEqual([]);
    expect(by["runtime.two"].unset).toEqual(["VIVA_PROBE_MISSING"]);
    // "" is unset too — a hollow value is the same silent failure as a missing one
    expect(by["runtime.three"].unset).toEqual(["VIVA_PROBE_HOLLOW"]);
  });

  it("does not throw on new Url(unset) — the value is PRODUCED, only the record says the key was unset", () => {
    const record = [];
    const paladin = mk({ VIVA_PROBE_SERVE: "http://localhost:2501/" });
    hydrate(
      {
        good: () => new Url(paladin.env.get("VIVA_PROBE_SERVE")),
        bad: () => new Url(paladin.env.get("VIVA_PROBE_MISSING")),
      },
      record,
      paladin,
      "runtime",
    );
    const by = Object.fromEntries(record.map((row) => [row.at, row]));
    // this is the whole point: it did not throw. all three empty shapes produce a Url with no
    // origin — a blind pinhole hands that to the runtime as an address and the app serves nowhere.
    expect(new Url(undefined).href).toBe("NaN");
    expect(new Url(null).href).toBe("NaN");
    expect(new Url("").href).toBe("undefined/");
    expect([undefined, null, ""].every((held) => new Url(held).origin === undefined)).toBe(true);
    expect(by["runtime.bad"].unset).toEqual(["VIVA_PROBE_MISSING"]);
  });

  it("secrets fire at the pinhole like every other branch — a provider receives a static map", () => {
    const record = [];
    const paladin = mk({}, { SECRET_VIVA_PROBE: "CANARY" });
    const held = hydrate(
      {
        statics: { serve: () => "fired" },
        secrets: {
          jwt: () => paladin.secret.get("SECRET_VIVA_PROBE"),
          gone: () => paladin.secret.get("SECRET_VIVA_ABSENT"),
          nested: { deep: [() => paladin.secret.get("SECRET_VIVA_PROBE")] },
        },
      },
      record,
      paladin,
      "service[probe]",
    );
    expect(held.statics.serve).toBe("fired");
    expect(held.secrets.jwt).toBe("CANARY");
    expect(held.secrets.nested.deep[0]).toBe("CANARY");
    expect(typeof held.secrets.jwt).toBe("string");
    const by = Object.fromEntries(record.map((row) => [row.at, row]));
    expect(Object.keys(by).sort()).toEqual([
      "service[probe].secrets.gone",
      "service[probe].secrets.jwt",
      "service[probe].secrets.nested.deep[0]",
      "service[probe].statics.serve",
    ]);
    expect(by["service[probe].secrets.jwt"].read).toEqual(["SECRET_VIVA_PROBE"]);
    expect(by["service[probe].secrets.jwt"].unset).toEqual([]);
    expect(by["service[probe].secrets.gone"].unset).toEqual(["SECRET_VIVA_ABSENT"]);
    expect(Object.keys(by["service[probe].secrets.jwt"]).sort()).toEqual(["at", "read", "unset"]);
  });

  it("walks a fired thunk's value — a declaration thunk that yields more thunks resolves to the bottom", () => {
    const record = [];
    const paladin = mk({}, { SECRET_VIVA_PROBE: "CANARY" });
    const held = hydrate(
      {
        hallucinators: () =>
          paladin.secret.get("SECRET_VIVA_PROBE")
            ? [{ module: "probe", secrets: { key: () => paladin.secret.get("SECRET_VIVA_PROBE") } }]
            : [],
      },
      record,
      paladin,
      "daemon[probe]",
    );
    expect(held.hallucinators[0].secrets.key).toBe("CANARY");
    expect(record.map((row) => row.at).sort()).toEqual([
      "daemon[probe].hallucinators",
      "daemon[probe].hallucinators[0].secrets.key",
    ]);
    expect(hydrate({ nested: () => () => "twice" }).nested).toBe("twice");
  });

  it("restores the real bags after every thunk, including one that throws", () => {
    const paladin = mk({ VIVA_PROBE_SERVE: "x" });
    const { env, secret } = paladin;
    hydrate({ ok: () => paladin.env.get("VIVA_PROBE_SERVE") }, [], paladin, "runtime");
    expect(paladin.env).toBe(env);
    expect(paladin.secret).toBe(secret);

    let thrown = null;
    try {
      hydrate({ boom: () => { throw new Error("declaration blew up"); } }, [], paladin, "runtime");
    } catch (error) {
      thrown = error;
    }
    expect(thrown?.message).toBe("declaration blew up");
    expect(paladin.env).toBe(env);
    expect(paladin.secret).toBe(secret);
  });
});
