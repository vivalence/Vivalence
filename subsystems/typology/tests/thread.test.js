import { specimen } from "@vivalence/typology";
import { IntentEntity, ThreadEntity } from "@vivalence/typology/entities";
import { seed } from "./scenarios/datamap.js";

specimen.describe("Thread beforeCreate hook", () => {
  let orm;
  let em;
  let fixtures;

  specimen.beforeAll(async () => {
    ({ orm, em, fixtures } = await seed());
  });

  specimen.afterAll(async () => {
    await orm.close();
  });

  specimen.it("copies intent.traits into thread.traits when intent is present", async () => {
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
    });
    await em.flush();

    const thread = em.create(ThreadEntity, {
      user: fixtures.user,
      mode: fixtures.mode,
      intent,
    });
    await em.flush();

    specimen.expect(thread.traits).toEqual(["MASKED", "AIMED", "QUEUEING"]);
    specimen.expect(thread.trait.AIMED.mount).toBe("/emit/feed");
    specimen.expect(thread.trait.QUEUEING.depth).toBe(1);
    specimen.expect(thread.trait.MASKED.limit).toBe(4);
  });

  specimen.it("deep-merges intent.trait with thread.trait, thread wins per nested key", async () => {
    const intent = em.create(IntentEntity, {
      slug: "template-deep-merge",
      name: "Template Override",
      traits: ["MASKED", "AIMED", "QUEUEING"],
      trait: {
        MASKED: { limit: 4 },
        AIMED: { mount: "/emit/feed" },
        QUEUEING: { depth: 1 },
      },
      mode: fixtures.mode,
    });
    await em.flush();

    const thread = em.create(ThreadEntity, {
      user: fixtures.user,
      mode: fixtures.mode,
      intent,
      trait: { MASKED: { limit: 10 } },
    });
    await em.flush();

    specimen.expect(thread.traits).toEqual(["MASKED", "AIMED", "QUEUEING"]);
    specimen.expect(thread.trait.AIMED.mount).toBe("/emit/feed");
    specimen.expect(thread.trait.QUEUEING.depth).toBe(1);
    specimen.expect(thread.trait.MASKED.limit).toBe(10);
  });

  specimen.it("is a no-op when intent is absent", async () => {
    const thread = em.create(ThreadEntity, {
      user: fixtures.user,
      mode: fixtures.mode,
      traits: ["SELFEVIDENT"],
      trait: { SELFEVIDENT: { static: true } },
    });
    await em.flush();

    specimen.expect(thread.traits).toEqual(["SELFEVIDENT"]);
    specimen.expect(thread.trait.SELFEVIDENT.static).toBe(true);
    specimen.expect(thread.intent).toBeFalsy();
  });

  specimen.it("intent template is not mutated by thread creation", async () => {
    const intent = em.create(IntentEntity, {
      slug: "template-immutable",
      name: "Template Immutable",
      traits: ["MASKED", "AIMED", "QUEUEING"],
      trait: {
        MASKED: { limit: 4 },
        AIMED: { mount: "/emit/feed" },
        QUEUEING: { depth: 1 },
      },
      mode: fixtures.mode,
    });
    await em.flush();

    const thread = em.create(ThreadEntity, {
      user: fixtures.user,
      mode: fixtures.mode,
      intent,
      trait: { MASKED: { limit: 99 } },
    });
    await em.flush();

    specimen.expect(intent.trait.MASKED.limit).toBe(4);
    specimen.expect(thread.trait.MASKED.limit).toBe(99);
  });
});
