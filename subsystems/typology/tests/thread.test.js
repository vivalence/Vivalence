import { specimen } from "@vivalence/typology";
import { IntentEntity, ThreadEntity } from "@vivalence/typology/entities";
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

    specimen.expect(stamped.traits).toEqual(["MASKED", "AIMED", "QUEUEING"]);
    specimen.expect(stamped.trait.AIMED.mount).toBe("/emit/feed");
    specimen.expect(stamped.trait.QUEUEING.depth).toBe(1);
    specimen.expect(stamped.trait.MASKED.limit).toBe(4);

    const orphan = em.create(ThreadEntity, {
      user: fixtures.user,
      mode: fixtures.mode,
      traits: ["SELFEVIDENT"],
      trait: { SELFEVIDENT: { static: true } },
    });
    await em.flush();

    specimen.expect(orphan.traits).toEqual(["SELFEVIDENT"]);
    specimen.expect(orphan.trait.SELFEVIDENT.static).toBe(true);
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

    specimen.expect(overriding.traits).toEqual(["MASKED", "AIMED", "QUEUEING"]);
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
});
