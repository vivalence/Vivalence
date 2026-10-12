import { specimen, Connection, Span, Url, Vector, shape, shard } from "@vivalence/typology";
import { lighthouse as scenario } from "@vivalence/runtime/scenarios";
import { Lighthouse, STANDINGS } from "../../prototypes/lighthouse.js";

const { describe, it, expect } = specimen;

const marks = (span) => span.records.filter((record) => record.verb === "note").map((record) => record.data.message);

const stub = (vector) => new Connection(new Url("http://stub"), shard.transmitter.inline(shape.http(vector)));

describe("Lighthouse.restore — a held credential, validated before it is believed", () => {
  const held = {
    user: { id: "0f8b1c1e-2d3a-4b5c-8d9e-0a1b2c3d4e5f", slug: "finn", traits: [], trait: {} },
    authority: { access: "eyJhbGciOiJIUzI1NiJ9.eyJpZCI6IjEifQ.c2lnbmF0dXJl", refresh: "eyJhbGciOiJIUzI1NiJ9.eyJpZCI6IjIifQ.c2lnbmF0dXJl" },
    at: "2026-10-10T21:03:24.000Z",
  };

  it("a credential record sets authority and user and answers true, marking nothing", () => {
    const stdout = new Span("lighthouse");
    const lighthouse = new Lighthouse(stub(new Vector()), { stdout });
    expect(lighthouse.restore(held)).toBe(true);
    expect(lighthouse.authority).toEqual(held.authority);
    expect(lighthouse.user).toEqual(held.user);
    expect([lighthouse.isAuthorized, lighthouse.isIdentified]).toEqual([true, true]);
    expect(marks(stdout)).toEqual([]);
  });

  it("a malformed record is refused: false, nothing set, one note on stdout", () => {
    const stdout = new Span("lighthouse");
    const lighthouse = new Lighthouse(stub(new Vector()), { stdout });
    for (const malformed of [{ ...held, authority: { access: "x" } }, { ...held, extra: 1 }, { user: held.user }, null, "token"]) {
      expect(lighthouse.restore(malformed)).toBe(false);
    }
    expect(lighthouse.authority).toEqual({});
    expect([lighthouse.isAuthorized, lighthouse.isIdentified]).toEqual([false, false]);
    expect(marks(stdout)).toEqual(Array(5).fill("cached credential is not one — discarded"));
  });

  it("without a stdout a refusal is silent and still false", () => {
    const lighthouse = new Lighthouse(stub(new Vector()));
    expect(lighthouse.restore({ user: held.user })).toBe(false);
    expect(lighthouse.stdout).toBe(null);
  });
});

describe("Lighthouse — access · verify · refresh · logout against the runtime's /lighthouse", { sanitizeOps: false, sanitizeResources: false }, () => {
  let house;
  specimen.beforeAll(async () => {
    house = await scenario.create();
  });
  specimen.afterAll(async () => {
    await house.close();
  });

  it("STANDINGS is the closed set the status codes come from", () => {
    expect(STANDINGS).toEqual(["IDLE", "AUTHENTICATING", "AUTHENTICATED", "VERIFYING", "REFRESHING", "REFRESHED", "POPULATING", "VERIFIED", "OFFLINE", "ERROR", "SESSION_EXPIRED", "LOGGED_OUT"]);
    const lighthouse = new Lighthouse(house.connect());
    expect(STANDINGS.includes(lighthouse.status.code)).toBe(true);
    expect(lighthouse.manifest).toBe(null);
    expect(lighthouse.runtime).toBeInstanceOf(Connection);
  });

  it("signup authenticates: authority and user land, the status is AUTHENTICATED", async () => {
    const lighthouse = new Lighthouse(house.connect());
    const result = await lighthouse.signup("ada", "pw-ada");
    expect(result.status).toBe("OK");
    expect(result.user.slug).toBe("ada");
    expect(lighthouse.status).toEqual({ code: "AUTHENTICATED" });
    expect([lighthouse.isAuthorized, lighthouse.isIdentified]).toEqual([true, true]);
  });

  it("a taken username is an ERROR standing and nothing lands", async () => {
    const lighthouse = new Lighthouse(house.connect());
    const result = await lighthouse.signup("ada", "pw-other");
    expect(result.status).toBe("ERROR");
    expect(lighthouse.status.code).toBe("ERROR");
    expect(lighthouse.isAuthorized).toBe(false);
  });

  it("login with the password signs in, a wrong password is refused", async () => {
    const lighthouse = new Lighthouse(house.connect());
    expect((await lighthouse.login("ada", "wrong")).status).toBe("ERROR");
    expect(lighthouse.isAuthorized).toBe(false);
    expect((await lighthouse.login("ada", "pw-ada")).status).toBe("OK");
    expect(lighthouse.user.slug).toBe("ada");
  });

  it("verify with no token answers NO_TOKEN without asking the wire", async () => {
    const lighthouse = new Lighthouse(house.connect());
    expect(await lighthouse.verify()).toEqual({ status: "NO_TOKEN" });
    expect(lighthouse.status).toEqual({ code: "IDLE" });
  });

  it("verify with a live access token answers OK and refreshes the user card", async () => {
    const lighthouse = new Lighthouse(house.connect());
    await lighthouse.login("ada", "pw-ada");
    lighthouse.$user.set({ id: lighthouse.user.id });
    expect(await lighthouse.verify()).toEqual({ status: "OK" });
    expect(lighthouse.user.slug).toBe("ada");
  });

  it("verify with a dead access token falls through to refresh and comes back REFRESHED", async () => {
    const lighthouse = new Lighthouse(house.connect());
    await lighthouse.login("ada", "pw-ada");
    const { refresh } = lighthouse.authority;
    lighthouse.$authority.set({ access: "not-a-token", refresh });
    expect(await lighthouse.verify()).toEqual({ status: "OK" });
    expect(lighthouse.status).toEqual({ code: "REFRESHED" });
    expect(lighthouse.authority.refresh).toBe(refresh);
    expect(lighthouse.authority.access).not.toBe("not-a-token");
    expect(await lighthouse.verify()).toEqual({ status: "OK" });
  });

  it("refresh with no refresh token answers NO_REFRESH_TOKEN", async () => {
    const lighthouse = new Lighthouse(house.connect());
    lighthouse.$authority.set({ access: "a" });
    expect(await lighthouse.refresh()).toEqual({ status: "NO_REFRESH_TOKEN" });
  });

  it("logout clears authority and user, revokes the refresh on the wire, stands LOGGED_OUT", async () => {
    const lighthouse = new Lighthouse(house.connect());
    await lighthouse.login("ada", "pw-ada");
    const { refresh } = lighthouse.authority;
    lighthouse.logout();
    expect(lighthouse.status).toEqual({ code: "LOGGED_OUT" });
    expect([lighthouse.authority, lighthouse.user]).toEqual([null, null]);
    expect([lighthouse.isAuthorized, lighthouse.isIdentified]).toEqual([false, false]);
    await new Promise((resolve) => setTimeout(resolve, 20));
    const revoked = new Lighthouse(house.connect());
    revoked.$authority.set({ access: "not-a-token", refresh });
    const result = await revoked.refresh();
    expect(result.status).toBe("SESSION_EXPIRED");
    expect(revoked.status).toEqual({ code: "SESSION_EXPIRED" });
  });

  it("json and toJSON carry the standing, never a store", async () => {
    const lighthouse = new Lighthouse(house.connect());
    await lighthouse.login("ada", "pw-ada");
    const json = JSON.parse(JSON.stringify(lighthouse));
    expect(Object.keys(json)).toEqual(["status", "isIdentified", "isAuthorized", "user", "authority"]);
    expect(json.status).toEqual({ code: "AUTHENTICATED" });
    expect(json.user.slug).toBe("ada");
  });
});
