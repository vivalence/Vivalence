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
    expect(by["runtime.serve"].usable).toBe(true);
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

  it("catches the silent failure: new Url(unset) is PRODUCED but not usable", () => {
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
    expect(by["runtime.good"].usable).toBe(true);
    // this is the whole point: it did not throw. all three empty shapes produce a Url with no
    // origin — a blind pinhole hands that to the runtime as an address and the app serves nowhere.
    expect(new Url(undefined).href).toBe("NaN");
    expect(new Url(null).href).toBe("NaN");
    expect(new Url("").href).toBe("undefined/");
    expect([undefined, null, ""].every((held) => new Url(held).origin === undefined)).toBe(true);
    expect(by["runtime.bad"].usable).toBe(false);
    expect(by["runtime.bad"].unset).toEqual(["VIVA_PROBE_MISSING"]);
  });

  it("refuses to fire a deferred branch — secrets stay callable, never a string", () => {
    const record = [];
    const paladin = mk({}, { SECRET_VIVA_PROBE: "CANARY" });
    const held = hydrate(
      {
        statics: { serve: () => "fired" },
        secrets: { jwt: () => paladin.secret.get("SECRET_VIVA_PROBE") },
      },
      record,
      paladin,
      "service[probe]",
    );
    expect(held.statics.serve).toBe("fired");
    expect(typeof held.secrets.jwt).toBe("function");
    expect(held.secrets.jwt()).toBe("CANARY");
    // the plaintext never lands on the declaration, so no serializer has to lie about it
    expect(JSON.stringify(held).includes("CANARY")).toBe(false);
    // a deferred thunk still contributes a row — probed, not resolved (see the next test)
    expect(record.map((row) => row.at).sort()).toEqual([
      "service[probe].secrets.jwt",
      "service[probe].statics.serve",
    ]);
    expect(record.find((row) => row.at.endsWith("secrets.jwt")).deferred).toBe(true);
  });

  it("fires a deferred thunk once and hands back the THUNK, not the value", () => {
    const record = [];
    const paladin = mk({}, { SECRET_VIVA_PROBE: "CANARY" });
    const held = hydrate(
      {
        secrets: {
          jwt: () => paladin.secret.get("SECRET_VIVA_PROBE"),
          gone: () => paladin.secret.get("SECRET_VIVA_ABSENT"),
        },
      },
      record,
      paladin,
      "service[probe]",
    );
    const by = Object.fromEntries(record.map((row) => [row.at, row]));
    // fired once, so the keys are known — a deferred branch is enumerable, which is what lets the
    // wizard ask for it and the doctor name who needs it.
    expect(by["service[probe].secrets.jwt"].read).toEqual(["SECRET_VIVA_PROBE"]);
    expect(by["service[probe].secrets.jwt"].deferred).toBe(true);
    expect(by["service[probe].secrets.jwt"].unset).toEqual([]);
    expect(by["service[probe].secrets.gone"].unset).toEqual(["SECRET_VIVA_ABSENT"]);
    // a REAL verdict, because a real value was produced — an unset secret is not usable
    expect(by["service[probe].secrets.jwt"].usable).toBe(true);
    expect(by["service[probe].secrets.gone"].usable).toBe(false);
    // …and the value went nowhere: the instance holds the thunk, so no plaintext to leak
    expect(typeof held.secrets.jwt).toBe("function");
    expect(held.secrets.jwt()).toBe("CANARY");
    expect(JSON.stringify(held).includes("CANARY")).toBe(false);
  });

  it("deferral is inherited by the whole branch, however deep", () => {
    const record = [];
    const paladin = mk({}, { SECRET_VIVA_PROBE: "CANARY" });
    const held = hydrate(
      { secrets: { nested: { deep: [() => paladin.secret.get("SECRET_VIVA_PROBE")] } } },
      record,
      paladin,
      "service[probe]",
    );
    // a secret three levels down a deferred branch is still a thunk
    expect(typeof held.secrets.nested.deep[0]).toBe("function");
    expect(record[0].at).toBe("service[probe].secrets.nested.deep[0]");
    expect(record[0].deferred).toBe(true);
    expect(JSON.stringify(held).includes("CANARY")).toBe(false);
  });

  it("usable is STRICT — null, undefined and empty string are all unusable", () => {
    const record = [];
    const paladin = mk({ VIVA_HOLLOW: "", VIVA_REAL: "x" });
    hydrate(
      {
        real: () => paladin.env.get("VIVA_REAL"),
        hollow: () => paladin.env.get("VIVA_HOLLOW"),
        missing: () => paladin.env.get("VIVA_ABSENT"),
        undef: () => undefined,
        zero: () => 0,
        no: () => false,
      },
      record,
      paladin,
      "runtime",
    );
    const by = Object.fromEntries(record.map((row) => [row.at, row.usable]));
    expect(by["runtime.real"]).toBe(true);
    expect(by["runtime.hollow"]).toBe(false);
    expect(by["runtime.missing"]).toBe(false);
    expect(by["runtime.undef"]).toBe(false);
    // 0 and false are VALUES. only absence is unusable — a port of 0 is a bug, not an absence.
    expect(by["runtime.zero"]).toBe(true);
    expect(by["runtime.no"]).toBe(true);
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
