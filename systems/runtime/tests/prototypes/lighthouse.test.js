import { assertEquals, assertRejects } from "jsr:@std/assert";
import { Status } from "@vivalence/typology";
import { Lighthouse } from "@vivalence/runtime";

const user = { id: "u1" };
const connection = {
  call: async (endpoint, body) => { connection.calls.push([endpoint, body]); return body; },
  calls: [],
  fetch: async (endpoint, body) => {
    if (endpoint === "/auth/verify") return body.access === "good" ? { ok: true, body: { identity: { id: "u1" } } } : { ok: false, body: { status: "ERROR", error: { code: "INVALID_TOKEN", message: "bad signature" } } };
    if (endpoint === "/auth/enroll") return { ok: true, body: { status: "SUCCESS" } };
    return { ok: true, body: {} };
  },
};
const users = { rows: [user], findOne: async ({ id }) => users.rows.find((row) => row.id === id) ?? null, upsert: async (row) => { users.rows.push(row); } };
const facts = { status: new Status("RUNNING"), daemon: "rhythm", remote: "http://rhythm:2501" };
const lighthouse = new Lighthouse(connection, { users, ...facts });
const { authenticate, authorize } = lighthouse.shard;

const ctx = ({ header, token } = {}) => ({
  request: {
    headers: { get: (name) => (name === "authorization" ? header ?? null : null) },
    url: { searchParams: { get: (name) => (name === "token" ? token ?? null : null) } },
  },
  response: {},
});

Deno.test("authenticate: no token → 401 MISSING_TOKEN, next not called", async () => {
  let called = false;
  const c = ctx();
  await authenticate(c, async () => { called = true; });
  assertEquals([c.response.status, c.response.body.error.code, called], [401, "MISSING_TOKEN", false]);
});

Deno.test("authenticate: bad bearer → 401 INVALID_TOKEN", async () => {
  const c = ctx({ header: "Bearer nope" });
  await authenticate(c, async () => {});
  assertEquals([c.response.status, c.response.body.error.code], [401, "INVALID_TOKEN"]);
});

Deno.test("authenticate: good bearer → ctx.lighthouse is the vouching handle; ?token= works too", async () => {
  const c = ctx({ header: "Bearer good" });
  await authenticate(c, async () => {});
  assertEquals(typeof c.lighthouse.getUser, "function");
  assertEquals(typeof c.lighthouse.enroll, "function");
  assertEquals(c.lighthouse.identity, undefined);
  const q = ctx({ token: "good" });
  await authenticate(q, async () => {});
  assertEquals(typeof q.lighthouse.enroll, "function");
});

Deno.test("authenticate: an already-vouched ctx passes through untouched", async () => {
  const c = { ...ctx(), lighthouse: { getUser: () => "kept" } };
  let called = false;
  await authenticate(c, async () => { called = true; });
  assertEquals([called, c.lighthouse.getUser()], [true, "kept"]);
});

Deno.test("authorize: authenticates then resolves ctx.user through the handle", async () => {
  const c = ctx({ header: "Bearer good" });
  let called = false;
  await authorize(c, async () => { called = true; });
  assertEquals([called, c.user], [true, { id: "u1" }]);
});

Deno.test("authorize: no userspace → 401 USER_NOT_FOUND; lookup fault → 500", async () => {
  users.rows = [];
  const c = ctx({ header: "Bearer good" });
  await authorize(c, async () => {});
  assertEquals([c.response.status, c.response.body.error.code], [401, "USER_NOT_FOUND"]);
  users.rows = [user];
  const faulty = new Lighthouse(connection, { ...facts, users: { findOne: async () => { throw new Error("db down"); } } });
  const f = ctx({ header: "Bearer good" });
  await faulty.shard.authorize(f, async () => {});
  assertEquals([f.response.status, f.response.body.error.code], [500, "USER_LOOKUP_FAILED"]);
});

Deno.test("authorize: unauthenticated never reaches the user lookup", async () => {
  let looked = false;
  const spy = new Lighthouse(connection, { ...facts, users: { findOne: async () => { looked = true; return null; } } });
  const c = ctx();
  await spy.shard.authorize(c, async () => {});
  assertEquals([c.response.status, looked], [401, false]);
});

Deno.test("enroll: asks /auth/enroll with the daemon's slug, then mints the user once", async () => {
  const asked = [];
  const wire = { call: async (endpoint, body) => body, fetch: async (endpoint, body) => { asked.push([endpoint, body.daemon]); return endpoint === "/auth/verify" ? { ok: true, body: { identity: { id: "u2" } } } : { ok: true, body: { status: "SUCCESS" } }; } };
  const minted = [];
  const house = new Lighthouse(wire, { ...facts, users: { findOne: async ({ id }) => minted.find((row) => row.id === id) ?? null, upsert: async (row) => { minted.push(row); } } });
  const handle = await house.authenticate("good");
  const enrolled = await handle.enroll();
  assertEquals([asked[1], enrolled.id, minted.length], [["/auth/enroll", "rhythm"], "u2", 1]);
});

Deno.test("announce is what a status change does: listen announces, each transition re-announces, STOPPED lands last", async () => {
  const beacons = [];
  const wire = { call: async (endpoint, body) => { beacons.push([endpoint, body.reported]); return body; }, fetch: async () => ({ ok: true, body: {} }) };
  const status = new Status("MOUNTING");
  const house = new Lighthouse(wire, { users, status, daemon: "rhythm", remote: "http://rhythm:2501" });
  status.set("MOUNTING");
  assertEquals(beacons, []);
  await house.listen();
  for (const code of ["RUNNING", "STOPPING", "STOPPED"]) { status.set(code); await house.announced; }
  assertEquals(beacons, [["/daemons/announce", "MOUNTING"], ["/daemons/announce", "RUNNING"], ["/daemons/announce", "STOPPING"], ["/daemons/announce", "STOPPED"]]);
  assertEquals(beacons.length, 4);
});

Deno.test("a refused beacon never throws: announced resolves to the refusal, the next transition beacons again", async () => {
  let up = false;
  const wire = { call: async (endpoint, body) => { if (!up) throw new Error("refused"); return body; }, fetch: async () => ({ ok: true, body: {} }) };
  const status = new Status("MOUNTING");
  const house = new Lighthouse(wire, { users, status, daemon: "rhythm", remote: "http://rhythm:2501" });
  await house.listen().catch(() => {});
  assertEquals((await house.announced).message, "refused");
  await assertRejects(() => house.beacon(), Error, "refused");
  up = true;
  status.set("RUNNING");
  assertEquals((await house.announced).reported, "RUNNING");
});

Deno.test("beacons serialize: a transition during an in-flight beacon lands after it, never beside it", async () => {
  const beacons = [];
  let release = null;
  const wire = {
    call: async (endpoint, body) => {
      if (body.reported === "MOUNTING") await new Promise((resolve) => (release = resolve));
      beacons.push(body.reported);
      return body;
    },
    fetch: async () => ({ ok: true, body: {} }),
  };
  const status = new Status("MOUNTING");
  const house = new Lighthouse(wire, { users, status, daemon: "rhythm", remote: "http://rhythm:2501" });
  house.listen();
  while (!release) await new Promise((resolve) => setTimeout(resolve, 1));
  status.set("RUNNING");
  const boot = house.beacon();
  assertEquals(beacons, []);
  release();
  assertEquals((await boot).reported, "RUNNING");
  assertEquals(beacons, ["MOUNTING", "RUNNING", "RUNNING"]);
});
