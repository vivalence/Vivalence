import { specimen } from "@vivalence/typology";
import { RequestContext } from "@mikro-orm/core";
import { seed } from "../../../../fixtures/data/seed.js";
import { tiers } from "../../../../fixtures/data/tiers.js";

let scenario;
let em;
let literal;
let alice;
let bob;

const as = (user, fn) =>
  RequestContext.create(scenario.orm.em, async () => {
    const scoped = RequestContext.getEntityManager();
    scoped.setFilterParams("user", { user: user.id });
    return fn(scoped);
  });

const context = (user) => ({ daemon: { entities: scenario.entities }, user: { id: user.id }, mode: null, thread: null });

specimen.beforeAll(async () => {
  scenario = await seed();
  em = scenario.em;
  literal = scenario.entities.literal;
  alice = scenario.fixtures.user;
  bob = em.create(tiers.user.entity, { roles: ["USER"], config: {} });
  await em.flush();
});

specimen.afterAll(async () => await scenario.orm.close());

specimen.describe("userspace — retention and trace are per user, the literal is shared", () => {
  specimen.it("alice's retentions are invisible to bob: the same literal is novel for him", async () => {
    const forAlice = await as(alice, () => literal.novel({}, { limit: 50 }));
    specimen.expect(forAlice.map((row) => row.slug)).not.toContain("hello");
    const forBob = await as(bob, () => literal.novel({}, { limit: 50 }));
    specimen.expect(forBob.map((row) => row.slug)).toContain("hello");
    specimen.expect(forBob.map((row) => row.slug)).toContain("goodbye");
    const dueForBob = await as(bob, () => literal.due({}, { limit: 50 }));
    specimen.expect(dueForBob.length).toBe(0);
  });

  specimen.it("bob's review creates HIS retention + trace; alice's stay untouched; each sees only their own", async () => {
    const [target] = await as(bob, () => literal.find({ slug: "hello" }));
    const bobs = await as(bob, async (scoped) => {
      const [row] = await scoped.find(tiers.literal.entity, { slug: "hello" }, { populate: ["retentions"] });
      return row.review("FAILURE", { ...context(bob), daemon: { entities: { ...scenario.entities, em: scoped } } });
    });
    specimen.expect(bobs.user?.id ?? bobs.user).toBe(bob.id);
    specimen.expect(target.id).toBe(scenario.fixtures.hello.id);

    const aliceRetentions = await as(alice, (scoped) => scoped.find(tiers.retention.entity, { literal: scenario.fixtures.hello.id }));
    specimen.expect(aliceRetentions.length).toBe(1);
    specimen.expect(aliceRetentions[0].status).toBe("KNOWN");
    specimen.expect(aliceRetentions[0].user?.id ?? aliceRetentions[0].user).toBe(alice.id);

    const bobRetentions = await as(bob, (scoped) => scoped.find(tiers.retention.entity, { literal: scenario.fixtures.hello.id }));
    specimen.expect(bobRetentions.length).toBe(1);
    specimen.expect(bobRetentions[0].id).toBe(bobs.id);

    const bobTraces = await as(bob, (scoped) => scoped.find(tiers.trace.entity, {}));
    specimen.expect(bobTraces.length).toBe(1);
    specimen.expect(bobTraces[0].signal).toEqual({ enum: "FAILURE" });
    const aliceTraces = await as(alice, (scoped) => scoped.find(tiers.trace.entity, {}));
    for (const trace of aliceTraces) specimen.expect(trace.user?.id ?? trace.user).toBe(alice.id);
  });

  specimen.it("one retention per user·literal is a hard uniqueness, not a convention", async () => {
    let threw = false;
    try {
      await as(alice, async (scoped) => {
        scoped.create(tiers.retention.entity, {
          user: alice,
          literal: scenario.fixtures.hello,
          status: "UNKNOWN",
          state: {},
          nextAt: new Date(),
          lastAt: new Date(),
        });
        await scoped.flush();
      });
    } catch (error) {
      threw = /unique/i.test(String(error?.message ?? error));
    }
    specimen.expect(threw).toBe(true);
  });

  specimen.it("byStatus / byStrength / sample answer per user", async () => {
    const aliceKnown = await as(alice, () => literal.find({ retentions: { status: "KNOWN" } }));
    specimen.expect(aliceKnown.map((row) => row.slug)).toEqual(["hello"]);
    const bobKnown = await as(bob, () => literal.find({ retentions: { status: "KNOWN" } }));
    specimen.expect(bobKnown.length).toBe(0);
    const bobStrength = await as(bob, () => literal.byStrength({}, { limit: 10 }));
    specimen.expect(bobStrength.map((row) => row.slug)).toEqual(["hello"]);
    const bobSample = await as(bob, () => literal.sample({}, { limit: 10 }));
    specimen.expect(bobSample.map((row) => row.slug)).toEqual(["hello"]);
    const aliceSample = await as(alice, () => literal.sample({}, { status: ["LEARNING"], limit: 10 }));
    specimen.expect(aliceSample.map((row) => row.slug)).toEqual(["goodbye"]);
  });
});

specimen.describe("userspace — deleting a literal cascades to every user's retention and trace", () => {
  specimen.it("no orphan rows survive the literal", async () => {
    const connection = scenario.orm.em.getConnection();
    const id = scenario.fixtures.hello.id;
    const before = await connection.execute("select (select count(*) from Retention where literal = ?) as retentions, (select count(*) from Trace where literal = ?) as traces", [id, id]);
    specimen.expect(before[0].retentions).toBeGreaterThan(0);
    specimen.expect(before[0].traces).toBeGreaterThan(0);
    await as(alice, async (scoped) => {
      const row = await scoped.findOneOrFail(tiers.literal.entity, { id });
      scoped.remove(row);
      await scoped.flush();
    });
    const after = await connection.execute("select (select count(*) from Retention where literal = ?) as retentions, (select count(*) from Trace where literal = ?) as traces", [id, id]);
    specimen.expect(after[0]).toEqual({ retentions: 0, traces: 0 });
  });
});
