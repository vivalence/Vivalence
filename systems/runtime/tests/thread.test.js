import { specimen } from "@vivalence/typology";
import { IntentEntity, ThreadEntity } from "@vivalence/runtime";
import { seed } from "./scenarios/datamap.js";

specimen.describe("Thread", () => {
  let orm;
  let em;
  let fixtures;

  specimen.beforeAll(async () => {
    ({ orm, em, fixtures } = await seed());
  });

  specimen.afterAll(async () => {
    await orm.close();
  });

  specimen.it("an intent template stamps a newborn thread", async () => {
    const intent = em.create(IntentEntity, {
      slug: "template-copy-traits",
      name: "Template Copy",
      traits: ["MASKED", "AIMED", "QUEUEING"],
      trait: {
        MASKED: { limit: 4 },
        AIMED: { mount: "/emit/feed" },
        QUEUEING: { depth: 1 },
      },
      mode: fixtures.mode,
      user: fixtures.user,
    });
    await em.flush();

    const stamped = em.create(ThreadEntity, {
      user: fixtures.user,
      mode: fixtures.mode,
      intent,
    });
    await em.flush();

    specimen.expect(stamped.traits).toEqual(["MASKED", "AIMED", "QUEUEING", "INTELLIGENT", "VOCAL"]);
    specimen.expect(stamped.trait.AIMED.mount).toBe("/emit/feed");
    specimen.expect(stamped.trait.QUEUEING.depth).toBe(1);
    specimen.expect(stamped.trait.MASKED.limit).toBe(4);

    const orphan = em.create(ThreadEntity, { user: fixtures.user, mode: fixtures.mode });
    await em.flush();

    specimen.expect(orphan.traits).toEqual(["INTELLIGENT", "VOCAL"]);
    specimen.expect(orphan.trait.INTELLIGENT).toEqual({ tune: "capable", effort: "low", rounds: 12 });
    specimen.expect(orphan.trait.QUEUEING).toEqual({ depth: 1 });
    specimen.expect(orphan.intent).toBeFalsy();
  });

  specimen.it("a thread wins the deep merge and the template survives", async () => {
    const merging = em.create(IntentEntity, {
      slug: "template-deep-merge",
      name: "Template Override",
      traits: ["MASKED", "AIMED", "QUEUEING"],
      trait: {
        MASKED: { limit: 4 },
        AIMED: { mount: "/emit/feed" },
        QUEUEING: { depth: 1 },
      },
      mode: fixtures.mode,
      user: fixtures.user,
    });
    await em.flush();

    const overriding = em.create(ThreadEntity, {
      user: fixtures.user,
      mode: fixtures.mode,
      intent: merging,
      trait: { MASKED: { limit: 10 } },
    });
    await em.flush();

    specimen.expect(overriding.traits).toEqual(["MASKED", "AIMED", "QUEUEING", "INTELLIGENT", "VOCAL"]);
    specimen.expect(overriding.trait.AIMED.mount).toBe("/emit/feed");
    specimen.expect(overriding.trait.QUEUEING.depth).toBe(1);
    specimen.expect(overriding.trait.MASKED.limit).toBe(10);

    const immutable = em.create(IntentEntity, {
      slug: "template-immutable",
      name: "Template Immutable",
      traits: ["MASKED", "AIMED", "QUEUEING"],
      trait: {
        MASKED: { limit: 4 },
        AIMED: { mount: "/emit/feed" },
        QUEUEING: { depth: 1 },
      },
      mode: fixtures.mode,
      user: fixtures.user,
    });
    await em.flush();

    const diverging = em.create(ThreadEntity, {
      user: fixtures.user,
      mode: fixtures.mode,
      intent: immutable,
      trait: { MASKED: { limit: 99 } },
    });
    await em.flush();

    specimen.expect(immutable.trait.MASKED.limit).toBe(4);
    specimen.expect(diverging.trait.MASKED.limit).toBe(99);
  });

  specimen.it("a write casts the trait: an undeclared name is refused on create, an invalid claimed value on update", async () => {
    const refusing = em.fork();
    refusing.create(ThreadEntity, { user: fixtures.user.id, mode: fixtures.mode.id, traits: ["SELFEVIDENT"], trait: { SELFEVIDENT: { static: true } } });
    const refused = await refusing.flush().then(() => null, (error) => error.message);
    specimen.expect(refused).toContain("no trait SELFEVIDENT");

    const updating = em.fork();
    const queued = updating.create(ThreadEntity, { user: fixtures.user.id, mode: fixtures.mode.id, traits: ["QUEUEING"], trait: { QUEUEING: { depth: 3 } } });
    await updating.flush();
    specimen.expect(queued.trait.QUEUEING).toEqual({ depth: 3 });

    queued.trait = { ...queued.trait, QUEUEING: { depth: 0 } };
    const invalid = await updating.flush().then(() => null, (error) => error.message);
    specimen.expect(invalid).toContain("/QUEUEING/depth");
  });
});
