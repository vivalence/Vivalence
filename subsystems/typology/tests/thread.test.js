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
      traits: ["QUEUEING", "FURNISHED"],
      trait: {
        QUEUEING: { mount: "/emit/feed", queue: 1, mask: { limit: 4 } },
        FURNISHED: { recall: "LEARNING" },
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

    specimen.expect(thread.traits).toEqual(["QUEUEING", "FURNISHED"]);
    specimen.expect(thread.trait.QUEUEING.mount).toBe("/emit/feed");
    specimen.expect(thread.trait.QUEUEING.queue).toBe(1);
    specimen.expect(thread.trait.QUEUEING.mask.limit).toBe(4);
    specimen.expect(thread.trait.FURNISHED.recall).toBe("LEARNING");
  });

  specimen.it("deep-merges intent.trait with thread.trait, thread wins per nested key", async () => {
    const intent = em.create(IntentEntity, {
      slug: "template-deep-merge",
      name: "Template Override",
      traits: ["QUEUEING"],
      trait: {
        QUEUEING: { mount: "/emit/feed", queue: 1, mask: { limit: 4 } },
      },
      mode: fixtures.mode,
    });
    await em.flush();

    const thread = em.create(ThreadEntity, {
      user: fixtures.user,
      mode: fixtures.mode,
      intent,
      trait: { QUEUEING: { mask: { limit: 10 } } },
    });
    await em.flush();

    specimen.expect(thread.traits).toEqual(["QUEUEING"]);
    specimen.expect(thread.trait.QUEUEING.mount).toBe("/emit/feed");
    specimen.expect(thread.trait.QUEUEING.queue).toBe(1);
    specimen.expect(thread.trait.QUEUEING.mask.limit).toBe(10);
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
      traits: ["QUEUEING"],
      trait: {
        QUEUEING: { mount: "/emit/feed", queue: 1, mask: { limit: 4 } },
      },
      mode: fixtures.mode,
    });
    await em.flush();

    const thread = em.create(ThreadEntity, {
      user: fixtures.user,
      mode: fixtures.mode,
      intent,
      trait: { QUEUEING: { mask: { limit: 99 } } },
    });
    await em.flush();

    specimen.expect(intent.trait.QUEUEING.mask.limit).toBe(4);
    specimen.expect(thread.trait.QUEUEING.mask.limit).toBe(99);
  });
});
