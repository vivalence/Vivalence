import {
  specimen, Aperture, Connection, Url,
  shard, shape, RemoteEntityManager, RemoteRepository,
} from "@vivalence/typology";
import { datamap } from "@vivalence/typology/scenarios";

class TestMode {
  constructor(data) { Object.assign(this, data); }
  implements(trait) { return this.traits?.includes(trait); }
  toJSON() {
    const out = {};
    for (const [key, value] of Object.entries(this)) {
      if (typeof value === "function") continue;
      if (value instanceof Set || value instanceof Map) continue;
      out[key] = value;
    }
    return out;
  }
}

class TestIntent {
  constructor(data) { Object.assign(this, data); }
  toJSON() {
    const out = {};
    for (const [key, value] of Object.entries(this)) {
      if (typeof value === "function") continue;
      out[key] = value;
    }
    return out;
  }
}

class TestThread {
  mode = null;
  intent = null;
  cursor = 0;
  counter = 0;
  traits = [];
  toJSON() {
    const out = {};
    for (const [key, value] of Object.entries(this)) {
      if (typeof value === "function") continue;
      if (value instanceof Set || value instanceof Map) continue;
      out[key] = value;
    }
    return out;
  }
}

class TestEnrichedMode {
  constructor(data) { Object.assign(this, data); }
  toJSON() {
    const out = {};
    for (const [key, value] of Object.entries(this)) {
      if (typeof value === "function") continue;
      if (value instanceof Set || value instanceof Map) continue;
      out[key] = value;
    }
    return out;
  }
}

let scenario, connection, schema;

specimen.beforeAll(async () => {
  scenario = await datamap.seed();

  const aperture = new Aperture();
  aperture.branch("/entities/literal").slurp(shard.datamap.repository(scenario.repos.literal));
  aperture.branch("/entities/symbol").slurp(shard.datamap.repository(scenario.repos.symbol));
  aperture.branch("/entities/mode").slurp(shard.datamap.repository(scenario.repos.mode));
  aperture.branch("/entities/intent").slurp(shard.datamap.repository(scenario.repos.intent));

  connection = new Connection(
    new Url("http://test"),
    shard.transmitter.inline(shape.http(aperture)),
  );

  schema = shard.datamap.strip(scenario.orm.getMetadata());
});

specimen.afterAll(async () => {
  await scenario.orm.close();
  await new Promise((resolve) => setTimeout(resolve, 1100));
});

specimen.describe("RemoteEntityManager", () => {
  specimen.it("an identity map holds one truth per id", () => {
    const entityManager = new RemoteEntityManager(connection, schema);
    entityManager.register("mode", new RemoteRepository(TestMode).connect(connection.branch("/entities/mode")));
    entityManager.register("intent", new RemoteRepository(TestIntent).connect(connection.branch("/entities/intent")));

    const first = entityManager.merge("mode", { id: "m-1", slug: "test", traits: ["APPLICATION"] }, TestMode);
    specimen.expect(first).toBeInstanceOf(TestMode);
    specimen.expect(first.implements("APPLICATION")).toBe(true);

    const second = entityManager.merge("mode", { id: "m-1", slug: "updated" }, TestMode);
    specimen.expect(first).toBe(second);
    specimen.expect(first.slug).toBe("updated");
    specimen.expect(entityManager.identity("mode", "m-1")).toBe(first);
    specimen.expect(entityManager.identity("mode", { id: "m-1" })).toBe(first);

    entityManager.merge("mode", { id: "m-1", traits: ["APPLICATION", "EMITTER"] }, TestMode);
    entityManager.merge("mode", { id: "m-1", traits: [] }, TestMode);
    specimen.expect(entityManager.identity("mode", "m-1").traits).toEqual(["APPLICATION", "EMITTER"]);

    entityManager.merge("mode", { id: "shared-id", slug: "mode" }, TestMode);
    entityManager.merge("intent", { id: "shared-id", slug: "intent" }, TestIntent);
    const sharedMode = entityManager.identity("mode", "shared-id");
    const sharedIntent = entityManager.identity("intent", "shared-id");
    specimen.expect(sharedMode).toBeInstanceOf(TestMode);
    specimen.expect(sharedIntent).toBeInstanceOf(TestIntent);
    specimen.expect(sharedMode).not.toBe(sharedIntent);

    const dropManager = new RemoteEntityManager(connection, schema);
    dropManager.register("mode", new RemoteRepository(TestMode).connect(connection.branch("/entities/mode")));
    dropManager.merge("mode", { id: "m-1", slug: "test" }, TestMode);
    specimen.expect(dropManager.identity("mode", "m-1")).toBeDefined();
    dropManager.drop("mode", "m-1");
    specimen.expect(dropManager.identity("mode", "m-1")).toBe(null);
    specimen.expect(dropManager.stores.mode.get().length).toBe(0);
  });

  specimen.it("a reference resolves to its canonical entity", async () => {
    const entityManager = new RemoteEntityManager(connection, schema);
    entityManager.register("mode", new RemoteRepository(TestMode).connect(connection.branch("/entities/mode")));

    specimen.expect(await entityManager.resolve("mode", null)).toBe(null);
    specimen.expect(await entityManager.resolve("mode", undefined)).toBe(null);
    specimen.expect(await entityManager.resolve("mode", 42)).toBe(42);
    specimen.expect(await entityManager.resolve("mode", true)).toBe(true);
    specimen.expect(await entityManager.resolve("mode", "unknown-id")).toBe("unknown-id");

    const mode = entityManager.merge("mode", { id: "m-1", slug: "flashcard" }, TestMode);
    specimen.expect(await entityManager.resolve("mode", "m-1")).toBe(mode);
    specimen.expect(await entityManager.resolve("mode", { id: "m-1" })).toBe(mode);

    const minted = await entityManager.resolve("mode", { id: "m-new", slug: "immersion", traits: ["APPLICATION"] });
    specimen.expect(minted.id).toBe("m-new");
    specimen.expect(minted.slug).toBe("immersion");
    specimen.expect(entityManager.identity("mode", "m-new")).toBe(minted);

    const upserted = await entityManager.resolve("mode", { id: "m-1", slug: "updated", traits: ["EMITTER"] });
    specimen.expect(upserted).toBe(mode);
    specimen.expect(mode.slug).toBe("updated");
    specimen.expect(mode.traits).toEqual(["EMITTER"]);
  });

  specimen.it("a cast hydrates relations and grows reactive collections", async () => {
    const entityManager = new RemoteEntityManager(connection, schema);
    entityManager.register("mode", new RemoteRepository(TestMode).connect(connection.branch("/entities/mode")));
    entityManager.register("intent", new RemoteRepository(TestIntent).connect(connection.branch("/entities/intent")));

    const mode = await entityManager.cast("mode", { id: "m-1", slug: "flashcard" }, TestMode);
    specimen.expect(mode.$intents).toBeDefined();
    specimen.expect(typeof mode.$intents.get).toBe("function");
    specimen.expect(typeof mode.$intents.subscribe).toBe("function");
    specimen.expect(mode.$intents.get()).toEqual([]);

    const objectReferenced = await entityManager.cast("intent", { id: "i-1", slug: "survival", mode: { id: "m-1" } }, TestIntent);
    specimen.expect(objectReferenced.mode).toBe(mode);
    specimen.expect(mode.$intents.get()).toEqual([objectReferenced]);

    const stringReferenced = await entityManager.cast("intent", { id: "i-2", slug: "drill", mode: "m-1" }, TestIntent);
    specimen.expect(stringReferenced.mode).toBe(mode);
    specimen.expect(mode.$intents.get().length).toBe(2);

    entityManager.drop("intent", "i-1");
    specimen.expect(mode.$intents.get().length).toBe(1);
    specimen.expect(mode.$intents.get()[0].id).toBe("i-2");

    const dangling = await entityManager.cast("intent", { id: "i-x", mode: "unknown-id" }, TestIntent);
    specimen.expect(dangling.mode).toBe("unknown-id");

    const modeA = await entityManager.cast("mode", { id: "m-a", slug: "flash" }, TestMode);
    const modeB = await entityManager.cast("mode", { id: "m-b", slug: "drill" }, TestMode);
    await entityManager.cast("intent", { id: "i-a1", slug: "a", mode: "m-a" }, TestIntent);
    await entityManager.cast("intent", { id: "i-b1", slug: "b", mode: "m-b" }, TestIntent);
    await entityManager.cast("intent", { id: "i-a2", slug: "c", mode: "m-a" }, TestIntent);
    specimen.expect(modeA.$intents.get().length).toBe(2);
    specimen.expect(modeB.$intents.get().length).toBe(1);

    const bareManager = new RemoteEntityManager(connection, schema);
    bareManager.register("mode", new RemoteRepository(TestMode).connect(connection.branch("/entities/mode")));
    const bareMode = await bareManager.cast("mode", { id: "m-1", slug: "flashcard" }, TestMode);
    specimen.expect(bareMode.$intents).toBeUndefined();
  });

  specimen.it("a unit of work tracks the dirty and the removed", () => {
    const entityManager = new RemoteEntityManager(connection, schema);
    entityManager.register("mode", new RemoteRepository(TestMode).connect(connection.branch("/entities/mode")));

    const entity = entityManager.merge("mode", { id: "m-1", slug: "test", name: "Original" }, TestMode);
    specimen.expect(entityManager.changes("mode", entity)).toBe(null);
    entity.name = "Mutated";
    const diff = entityManager.changes("mode", entity);
    specimen.expect(diff).toBeDefined();
    specimen.expect(diff.name).toBe("Mutated");
    entityManager.snapshot("mode", entity);
    specimen.expect(entityManager.changes("mode", entity)).toBe(null);

    entityManager.persist(entity);
    specimen.expect(entityManager.dirty.has(entity)).toBe(true);
    entityManager.remove(entity);
    specimen.expect(entityManager.dirty.has(entity)).toBe(false);
    specimen.expect(entityManager.removed.has(entity)).toBe(true);
    entityManager.persist(entity);
    specimen.expect(entityManager.removed.has(entity)).toBe(false);
    specimen.expect(entityManager.dirty.has(entity)).toBe(true);

    const storeBefore = entityManager.stores.mode.get();
    entity.slug = "mutated";
    entityManager.persist(entity);
    const storeAfter = entityManager.stores.mode.get();
    specimen.expect(storeAfter).not.toBe(storeBefore);
    specimen.expect(storeAfter[0]).toBe(entity);
    specimen.expect(storeAfter[0].slug).toBe("mutated");

    let subscriberSlugs = [];
    entityManager.stores.mode.subscribe((modes) => {
      subscriberSlugs = modes.map((storedMode) => storedMode.slug);
    });
    entity.slug = "changed";
    entityManager.persist(entity);
    specimen.expect(subscriberSlugs).toEqual(["changed"]);

    entityManager.persist(entity);
    entityManager.persist(entity);
    specimen.expect(entityManager.dirty.size).toBe(1);

    const bareManager = new RemoteEntityManager(connection, schema);
    const orphan = { id: "orphan-1", slug: "rogue" };
    bareManager.persist(orphan);
    specimen.expect(bareManager.dirty.has(orphan)).toBe(true);

    const forked = entityManager.fork();
    specimen.expect(forked.identities.size).toBe(0);
    specimen.expect(forked.connection).toBe(connection);
    specimen.expect(forked.schema).toBe(schema);
  });

  specimen.it("an entity class survives merging with its fields intact", async () => {
    const entityManager = new RemoteEntityManager(connection, schema);
    entityManager.register("mode", new RemoteRepository(TestMode).connect(connection.branch("/entities/mode")));
    entityManager.register("intent", new RemoteRepository(TestIntent).connect(connection.branch("/entities/intent")));
    entityManager.register("thread", new RemoteRepository(TestThread).connect(connection.branch("/entities/mode")));

    const mode = entityManager.merge("mode", { id: "m-1", slug: "test" }, TestMode);
    const thread = entityManager.merge("thread", {
      id: "t-1", mode: mode, intent: { id: "i-1" }, cursor: 5, counter: 10,
    }, TestThread);
    specimen.expect(thread).toBeInstanceOf(TestThread);
    specimen.expect(thread.mode).toBe(mode);
    specimen.expect(thread.intent).toEqual({ id: "i-1" });
    specimen.expect(thread.cursor).toBe(5);
    specimen.expect(thread.counter).toBe(10);

    const casted = await entityManager.cast("thread", { id: "t-2", mode: "m-1", cursor: 3 }, TestThread);
    specimen.expect(casted.mode).toBe(mode);
    specimen.expect(casted.cursor).toBe(3);

    const resilienceManager = new RemoteEntityManager(connection, schema);
    resilienceManager.register("mode", new RemoteRepository(TestEnrichedMode).connect(connection.branch("/entities/mode")));
    const enriched = resilienceManager.merge("mode", {
      id: "m-1",
      slug: "test",
      call: function () {},
      buffer: () => ({ mode: "m-1", data: {} }),
      connection: { fetch: () => {} },
      intents: new Set(["i-1"]),
    }, TestEnrichedMode);
    specimen.expect(enriched.id).toBe("m-1");
    specimen.expect(enriched.slug).toBe("test");
    enriched.slug = "mutated";
    specimen.expect(resilienceManager.changes("mode", enriched)).toBe(null);
  });
});

specimen.describe("RemoteRepository + RemoteEntityManager", () => {
  specimen.it("a managed repository finds through the identity map", async () => {
    const entityManager = new RemoteEntityManager(connection, schema);
    const modeRepository = new RemoteRepository(TestMode).connect(connection.branch("/entities/mode"));
    entityManager.register("mode", modeRepository);

    const modes = await modeRepository.find();
    specimen.expect(modes.length).toBeGreaterThan(0);
    specimen.expect(modes[0]).toBeInstanceOf(TestMode);

    const again = await modeRepository.find();
    specimen.expect(again[0]).toBe(modes[0]);

    specimen.expect(modeRepository.$entities).toBe(entityManager.stores.mode);
    specimen.expect(modeRepository.$entities.get().length).toBeGreaterThan(0);

    const found = modeRepository.findOneLocal({ slug: "test" });
    specimen.expect(found).toBeDefined();
    specimen.expect(found.slug).toBe("test");
  });

  specimen.it("a managed repository drops and casts through its manager", async () => {
    const entityManager = new RemoteEntityManager(connection, schema);
    const modeRepository = new RemoteRepository(TestMode).connect(connection.branch("/entities/mode"));
    const intentRepository = new RemoteRepository(TestIntent).connect(connection.branch("/entities/intent"));
    entityManager.register("mode", modeRepository);
    entityManager.register("intent", intentRepository);

    const modes = await modeRepository.find();
    const intent = await intentRepository.cast({ id: "i-synthetic", slug: "test-intent", mode: { id: modes[0].id } });
    specimen.expect(intent.mode).toBe(modes[0]);

    const id = modeRepository.$entities.get()[0].id;
    modeRepository.drop(id);
    specimen.expect(entityManager.identity("mode", id)).toBe(null);
    specimen.expect(modeRepository.$entities.get().find((entity) => entity.id === id)).toBeUndefined();
  });
});
