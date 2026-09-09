import { specimen, Url } from "@vivalence/typology";
import { Paladin } from "@vivalence/paladin/typology";

const { describe, it, expect } = specimen;

const mk = (pairs = {}, secrets = {}) => {
  const paladin = new Paladin();
  paladin.env.assign(pairs, "flag");
  paladin.secret.assign(secrets, "flag");
  return paladin;
};

describe("paladin.hydrate — the pinhole", () => {
  it("without a record it fires thunks and walks arrays and plain objects", () => {
    const held = mk().hydrate({
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
    mk().hydrate({ statics: { serve: () => "a" }, list: [{ remote: () => "b" }] }, record, "runtime");
    expect(record.map((row) => row.at).sort()).toEqual(["runtime.list[0].remote", "runtime.statics.serve"]);
  });

  it("learns which keys a thunk read, from both bags, without the thunk knowing", () => {
    const record = [];
    const paladin = mk({ VIVA_PROBE_SERVE: "http://x/" }, { SECRET_VIVA_PROBE: "shh" });
    paladin.hydrate(
      {
        serve: () => paladin.env.get("VIVA_PROBE_SERVE"),
        both: () => `${paladin.env.get("VIVA_PROBE_SERVE")}${paladin.secret.get("SECRET_VIVA_PROBE")}`,
      },
      record,
      "runtime",
    );
    const by = Object.fromEntries(record.map((row) => [row.at, row]));
    expect(by["runtime.serve"].read).toEqual(["VIVA_PROBE_SERVE"]);
    expect(by["runtime.both"].read).toEqual(["VIVA_PROBE_SERVE", "SECRET_VIVA_PROBE"]);
  });

  it("names the UNSET keys separately from the read ones", () => {
    const record = [];
    const paladin = mk({ VIVA_PROBE_SET: "yes", VIVA_PROBE_HOLLOW: "" });
    paladin.hydrate(
      {
        one: () => paladin.env.get("VIVA_PROBE_SET"),
        two: () => paladin.env.get("VIVA_PROBE_MISSING"),
        three: () => paladin.env.get("VIVA_PROBE_HOLLOW"),
      },
      record,
      "runtime",
    );
    const by = Object.fromEntries(record.map((row) => [row.at, row]));
    expect(by["runtime.one"].unset).toEqual([]);
    expect(by["runtime.two"].unset).toEqual(["VIVA_PROBE_MISSING"]);
    expect(by["runtime.three"].unset).toEqual(["VIVA_PROBE_HOLLOW"]);
  });

  it("does not throw on new Url(unset) — the value is PRODUCED, only the record says the key was unset", () => {
    const record = [];
    const paladin = mk({ VIVA_PROBE_SERVE: "http://localhost:2501/" });
    paladin.hydrate(
      {
        good: () => new Url(paladin.env.get("VIVA_PROBE_SERVE")),
        bad: () => new Url(paladin.env.get("VIVA_PROBE_MISSING")),
      },
      record,
      "runtime",
    );
    const by = Object.fromEntries(record.map((row) => [row.at, row]));
    expect(new Url(undefined).href).toBe("NaN");
    expect(new Url(null).href).toBe("NaN");
    expect(new Url("").href).toBe("undefined/");
    expect([undefined, null, ""].every((held) => new Url(held).origin === undefined)).toBe(true);
    expect(by["runtime.bad"].unset).toEqual(["VIVA_PROBE_MISSING"]);
  });

  it("secrets fire at the pinhole like every other branch — a provider receives a static map", () => {
    const record = [];
    const paladin = mk({}, { SECRET_VIVA_PROBE: "CANARY" });
    const held = paladin.hydrate(
      {
        statics: { serve: () => "fired" },
        secrets: {
          jwt: () => paladin.secret.get("SECRET_VIVA_PROBE"),
          gone: () => paladin.secret.get("SECRET_VIVA_ABSENT"),
          nested: { deep: [() => paladin.secret.get("SECRET_VIVA_PROBE")] },
        },
      },
      record,
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
    const held = paladin.hydrate(
      {
        hallucinators: () =>
          paladin.secret.get("SECRET_VIVA_PROBE")
            ? [{ module: "probe", secrets: { key: () => paladin.secret.get("SECRET_VIVA_PROBE") } }]
            : [],
      },
      record,
      "daemon[probe]",
    );
    expect(held.hallucinators[0].secrets.key).toBe("CANARY");
    expect(record.map((row) => row.at).sort()).toEqual([
      "daemon[probe].hallucinators",
      "daemon[probe].hallucinators[0].secrets.key",
    ]);
    expect(mk().hydrate({ nested: () => () => "twice" }).nested).toBe("twice");
  });

  it("restores the real bags after every thunk, including one that throws", () => {
    const paladin = mk({ VIVA_PROBE_SERVE: "x" });
    const { env, secret } = paladin;
    paladin.hydrate({ ok: () => paladin.env.get("VIVA_PROBE_SERVE") }, [], "runtime");
    expect(paladin.env).toBe(env);
    expect(paladin.secret).toBe(secret);

    let thrown = null;
    try {
      paladin.hydrate({ boom: () => { throw new Error("declaration blew up"); } }, [], "runtime");
    } catch (error) {
      thrown = error;
    }
    expect(thrown?.message).toBe("declaration blew up");
    expect(paladin.env).toBe(env);
    expect(paladin.secret).toBe(secret);
  });
});
