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

// Entity class with field initializers — mirrors real entity classes
// (Thread, Buffer, etc.) where `mode = null` runs AFTER super().
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

// Entity with non-cloneable properties (functions, closures) — mirrors
// enriched modes after daemon.wafer /resolve.
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

let scenario, conn, schema;

specimen.beforeAll(async () => {
  scenario = await datamap.seed();
  const { repos } = scenario;

  const aperture = new Aperture();
  aperture.branch("/entities/literal").slurp(shard.datamap.repository(repos.literal));
  aperture.branch("/entities/symbol").slurp(shard.datamap.repository(repos.symbol));
  aperture.branch("/entities/mode").slurp(shard.datamap.repository(repos.mode));
  aperture.branch("/entities/intent").slurp(shard.datamap.repository(repos.intent));

  conn = new Connection(
    new Url("http://test"),
    shard.transmitter.inline(shape.http(aperture)),
  );

  schema = shard.datamap.strip(scenario.orm.getMetadata());
});

specimen.afterAll(async () => {
  await scenario.orm.close();
  await new Promise((r) => setTimeout(r, 1100));
});

// ── RemoteEntityManager: identity map ────────────────────────────────────

specimen.describe("RemoteEntityManager", () => {

  specimen.describe("identity map", () => {
    specimen.it("merge returns same reference for same id", () => {
      const entityManager = new RemoteEntityManager(conn, schema);
      const modeRepo = new RemoteRepository(TestMode).connect(conn.branch("/entities/mode"));
      entityManager.register("mode", modeRepo);

      const first = entityManager.merge("mode", { id: "m-1", slug: "test" }, TestMode);
      const second = entityManager.merge("mode", { id: "m-1", slug: "updated" }, TestMode);

      specimen.expect(first).toBe(second);
      specimen.expect(first.slug).toBe("updated");
    });

    specimen.it("merge wraps in entity class", () => {
      const entityManager = new RemoteEntityManager(conn, schema);
      const modeRepo = new RemoteRepository(TestMode).connect(conn.branch("/entities/mode"));
      entityManager.register("mode", modeRepo);

      const entity = entityManager.merge("mode", { id: "m-1", slug: "test", traits: ["APPLICATION"] }, TestMode);
      specimen.expect(entity).toBeInstanceOf(TestMode);
      specimen.expect(entity.implements("APPLICATION")).toBe(true);
    });

    specimen.it("identity resolves string id and object reference", () => {
      const entityManager = new RemoteEntityManager(conn, schema);
      const modeRepo = new RemoteRepository(TestMode).connect(conn.branch("/entities/mode"));
      entityManager.register("mode", modeRepo);

      const entity = entityManager.merge("mode", { id: "m-1", slug: "test" }, TestMode);
      specimen.expect(entityManager.identity("mode", "m-1")).toBe(entity);
      specimen.expect(entityManager.identity("mode", { id: "m-1" })).toBe(entity);
    });

    specimen.it("identity map is per entity type", () => {
      const entityManager = new RemoteEntityManager(conn, schema);
      entityManager.register("mode", new RemoteRepository(TestMode).connect(conn.branch("/entities/mode")));
      entityManager.register("intent", new RemoteRepository(TestIntent).connect(conn.branch("/entities/intent")));

      entityManager.merge("mode", { id: "shared-id", slug: "mode" }, TestMode);
      entityManager.merge("intent", { id: "shared-id", slug: "intent" }, TestIntent);

      const mode = entityManager.identity("mode", "shared-id");
      const intent = entityManager.identity("intent", "shared-id");

      specimen.expect(mode).toBeInstanceOf(TestMode);
      specimen.expect(intent).toBeInstanceOf(TestIntent);
      specimen.expect(mode).not.toBe(intent);
    });

    specimen.it("drop removes from identity map and reactive store", () => {
      const entityManager = new RemoteEntityManager(conn, schema);
      entityManager.register("mode", new RemoteRepository(TestMode).connect(conn.branch("/entities/mode")));

      entityManager.merge("mode", { id: "m-1", slug: "test" }, TestMode);
      specimen.expect(entityManager.identity("mode", "m-1")).toBeDefined();

      entityManager.drop("mode", "m-1");
      specimen.expect(entityManager.identity("mode", "m-1")).toBe(null);
      specimen.expect(entityManager.stores.mode.get().length).toBe(0);
    });

    specimen.it("does not overwrite populated arrays with empty arrays", () => {
      const entityManager = new RemoteEntityManager(conn, schema);
      entityManager.register("mode", new RemoteRepository(TestMode).connect(conn.branch("/entities/mode")));

      entityManager.merge("mode", { id: "m-1", traits: ["APPLICATION", "EMITTER"] }, TestMode);
      entityManager.merge("mode", { id: "m-1", traits: [] }, TestMode);

      specimen.expect(entityManager.identity("mode", "m-1").traits).toEqual(["APPLICATION", "EMITTER"]);
    });
  });

  specimen.describe("resolve", () => {
    specimen.it("returns null for null reference", async () => {
      const entityManager = new RemoteEntityManager(conn, schema);
      entityManager.register("mode", new RemoteRepository(TestMode).connect(conn.branch("/entities/mode")));

      specimen.expect(await entityManager.resolve("mode", null)).toBe(null);
      specimen.expect(await entityManager.resolve("mode", undefined)).toBe(null);
    });

    specimen.it("resolves string id to canonical entity from identity map", async () => {
      const entityManager = new RemoteEntityManager(conn, schema);
      entityManager.register("mode", new RemoteRepository(TestMode).connect(conn.branch("/entities/mode")));

      const mode = entityManager.merge("mode", { id: "m-1", slug: "flashcard" }, TestMode);
      const resolved = await entityManager.resolve("mode", "m-1");

      specimen.expect(resolved).toBe(mode);
    });

    specimen.it("returns original string when id not in identity map", async () => {
      const entityManager = new RemoteEntityManager(conn, schema);
      entityManager.register("mode", new RemoteRepository(TestMode).connect(conn.branch("/entities/mode")));

      const resolved = await entityManager.resolve("mode", "unknown-id");
      specimen.expect(resolved).toBe("unknown-id");
    });

    specimen.it("resolves object with id to canonical entity", async () => {
      const entityManager = new RemoteEntityManager(conn, schema);
      entityManager.register("mode", new RemoteRepository(TestMode).connect(conn.branch("/entities/mode")));

      const mode = entityManager.merge("mode", { id: "m-1", slug: "flashcard" }, TestMode);
      const resolved = await entityManager.resolve("mode", { id: "m-1" });

      specimen.expect(resolved).toBe(mode);
    });

    specimen.it("merges full object and returns canonical entity", async () => {
      const entityManager = new RemoteEntityManager(conn, schema);
      entityManager.register("mode", new RemoteRepository(TestMode).connect(conn.branch("/entities/mode")));

      const resolved = await entityManager.resolve("mode", { id: "m-new", slug: "immersion", traits: ["APPLICATION"] });

      specimen.expect(resolved.id).toBe("m-new");
      specimen.expect(resolved.slug).toBe("immersion");
      specimen.expect(entityManager.identity("mode", "m-new")).toBe(resolved);
    });

    specimen.it("upserts new data onto existing identity-map entry", async () => {
      const entityManager = new RemoteEntityManager(conn, schema);
      entityManager.register("mode", new RemoteRepository(TestMode).connect(conn.branch("/entities/mode")));

      const mode = entityManager.merge("mode", { id: "m-1", slug: "flashcard" }, TestMode);
      const resolved = await entityManager.resolve("mode", { id: "m-1", slug: "updated", traits: ["EMITTER"] });

      specimen.expect(resolved).toBe(mode);
      specimen.expect(mode.slug).toBe("updated");
      specimen.expect(mode.traits).toEqual(["EMITTER"]);
    });

    specimen.it("passes through non-entity values", async () => {
      const entityManager = new RemoteEntityManager(conn, schema);
      entityManager.register("mode", new RemoteRepository(TestMode).connect(conn.branch("/entities/mode")));

      specimen.expect(await entityManager.resolve("mode", 42)).toBe(42);
      specimen.expect(await entityManager.resolve("mode", true)).toBe(true);
    });
  });

  specimen.describe("cast (relationship hydration via EM)", () => {
    specimen.it("resolves m:1 object references across types", async () => {
      const entityManager = new RemoteEntityManager(conn, schema);
      entityManager.register("mode", new RemoteRepository(TestMode).connect(conn.branch("/entities/mode")));
      entityManager.register("intent", new RemoteRepository(TestIntent).connect(conn.branch("/entities/intent")));

      const mode = entityManager.merge("mode", { id: "m-1", slug: "flashcard" }, TestMode);
      const intent = await entityManager.cast("intent", { id: "i-1", slug: "survival", mode: { id: "m-1" } }, TestIntent);

      specimen.expect(intent.mode).toBe(mode);
    });

    specimen.it("resolves m:1 string id references", async () => {
      const entityManager = new RemoteEntityManager(conn, schema);
      entityManager.register("mode", new RemoteRepository(TestMode).connect(conn.branch("/entities/mode")));
      entityManager.register("intent", new RemoteRepository(TestIntent).connect(conn.branch("/entities/intent")));

      const mode = entityManager.merge("mode", { id: "m-1", slug: "flashcard" }, TestMode);
      const intent = await entityManager.cast("intent", { id: "i-1", slug: "survival", mode: "m-1" }, TestIntent);

      specimen.expect(intent.mode).toBe(mode);
    });

    specimen.it("leaves unresolvable references as-is", async () => {
      const entityManager = new RemoteEntityManager(conn, schema);
      entityManager.register("mode", new RemoteRepository(TestMode).connect(conn.branch("/entities/mode")));
      entityManager.register("intent", new RemoteRepository(TestIntent).connect(conn.branch("/entities/intent")));

      const intent = await entityManager.cast("intent", { id: "i-1", mode: "unknown-id" }, TestIntent);
      specimen.expect(intent.mode).toBe("unknown-id");
    });
  });

  specimen.describe("reactive collections (1:m via computed)", () => {
    specimen.it("cast defines $collection for 1:m with mappedBy", async () => {
      const entityManager = new RemoteEntityManager(conn, schema);
      entityManager.register("mode", new RemoteRepository(TestMode).connect(conn.branch("/entities/mode")));
      entityManager.register("intent", new RemoteRepository(TestIntent).connect(conn.branch("/entities/intent")));

      const mode = await entityManager.cast("mode", { id: "m-1", slug: "flashcard" }, TestMode);
      specimen.expect(mode.$intents).toBeDefined();
      specimen.expect(typeof mode.$intents.get).toBe("function");
      specimen.expect(typeof mode.$intents.subscribe).toBe("function");
    });

    specimen.it("$collection reflects children cast after parent", async () => {
      const entityManager = new RemoteEntityManager(conn, schema);
      entityManager.register("mode", new RemoteRepository(TestMode).connect(conn.branch("/entities/mode")));
      entityManager.register("intent", new RemoteRepository(TestIntent).connect(conn.branch("/entities/intent")));

      const mode = await entityManager.cast("mode", { id: "m-1", slug: "flashcard" }, TestMode);
      specimen.expect(mode.$intents.get()).toEqual([]);

      const intent = await entityManager.cast("intent", { id: "i-1", slug: "survival", mode: "m-1" }, TestIntent);
      specimen.expect(mode.$intents.get()).toEqual([intent]);
    });

    specimen.it("$collection updates when child is dropped", async () => {
      const entityManager = new RemoteEntityManager(conn, schema);
      entityManager.register("mode", new RemoteRepository(TestMode).connect(conn.branch("/entities/mode")));
      entityManager.register("intent", new RemoteRepository(TestIntent).connect(conn.branch("/entities/intent")));

      const mode = await entityManager.cast("mode", { id: "m-1", slug: "flashcard" }, TestMode);
      await entityManager.cast("intent", { id: "i-1", slug: "a", mode: "m-1" }, TestIntent);
      await entityManager.cast("intent", { id: "i-2", slug: "b", mode: "m-1" }, TestIntent);
      specimen.expect(mode.$intents.get().length).toBe(2);

      entityManager.drop("intent", "i-1");
      specimen.expect(mode.$intents.get().length).toBe(1);
      specimen.expect(mode.$intents.get()[0].id).toBe("i-2");
    });

    specimen.it("$collection only includes children for this parent", async () => {
      const entityManager = new RemoteEntityManager(conn, schema);
      entityManager.register("mode", new RemoteRepository(TestMode).connect(conn.branch("/entities/mode")));
      entityManager.register("intent", new RemoteRepository(TestIntent).connect(conn.branch("/entities/intent")));

      const modeA = await entityManager.cast("mode", { id: "m-a", slug: "flash" }, TestMode);
      const modeB = await entityManager.cast("mode", { id: "m-b", slug: "drill" }, TestMode);

      await entityManager.cast("intent", { id: "i-1", slug: "a", mode: "m-a" }, TestIntent);
      await entityManager.cast("intent", { id: "i-2", slug: "b", mode: "m-b" }, TestIntent);
      await entityManager.cast("intent", { id: "i-3", slug: "c", mode: "m-a" }, TestIntent);

      specimen.expect(modeA.$intents.get().length).toBe(2);
      specimen.expect(modeB.$intents.get().length).toBe(1);
    });

    specimen.it("skips $collection when target repo not registered", async () => {
      const entityManager = new RemoteEntityManager(conn, schema);
      entityManager.register("mode", new RemoteRepository(TestMode).connect(conn.branch("/entities/mode")));

      const mode = await entityManager.cast("mode", { id: "m-1", slug: "flashcard" }, TestMode);
      specimen.expect(mode.$intents).toBeUndefined();
    });
  });

  specimen.describe("dirty tracking", () => {
    specimen.it("detects changes against snapshot", () => {
      const entityManager = new RemoteEntityManager(conn, schema);
      entityManager.register("mode", new RemoteRepository(TestMode).connect(conn.branch("/entities/mode")));

      const entity = entityManager.merge("mode", { id: "m-1", slug: "test", name: "Original" }, TestMode);
      specimen.expect(entityManager.changes("mode", entity)).toBe(null);

      entity.name = "Mutated";
      const diff = entityManager.changes("mode", entity);
      specimen.expect(diff).toBeDefined();
      specimen.expect(diff.name).toBe("Mutated");
    });

    specimen.it("re-snapshot clears changes", () => {
      const entityManager = new RemoteEntityManager(conn, schema);
      entityManager.register("mode", new RemoteRepository(TestMode).connect(conn.branch("/entities/mode")));

      const entity = entityManager.merge("mode", { id: "m-1", slug: "test" }, TestMode);
      entity.slug = "changed";
      specimen.expect(entityManager.changes("mode", entity)).not.toBe(null);

      entityManager.snapshot("mode", entity);
      specimen.expect(entityManager.changes("mode", entity)).toBe(null);
    });
  });

  specimen.describe("unit of work", () => {
    specimen.it("persist and remove toggle correctly", () => {
      const entityManager = new RemoteEntityManager(conn, schema);
      entityManager.register("mode", new RemoteRepository(TestMode).connect(conn.branch("/entities/mode")));

      const entity = entityManager.merge("mode", { id: "m-1", slug: "test" }, TestMode);

      entityManager.persist(entity);
      specimen.expect(entityManager.dirty.has(entity)).toBe(true);

      entityManager.remove(entity);
      specimen.expect(entityManager.dirty.has(entity)).toBe(false);
      specimen.expect(entityManager.removed.has(entity)).toBe(true);
    });

    specimen.it("persist clears entity from removed set", () => {
      const entityManager = new RemoteEntityManager(conn, schema);
      entityManager.register("mode", new RemoteRepository(TestMode).connect(conn.branch("/entities/mode")));

      const entity = entityManager.merge("mode", { id: "m-1", slug: "test" }, TestMode);

      entityManager.remove(entity);
      specimen.expect(entityManager.removed.has(entity)).toBe(true);

      entityManager.persist(entity);
      specimen.expect(entityManager.removed.has(entity)).toBe(false);
      specimen.expect(entityManager.dirty.has(entity)).toBe(true);
    });

    specimen.it("persist triggers refreshStore and propagates to subscribers", () => {
      const entityManager = new RemoteEntityManager(conn, schema);
      entityManager.register("mode", new RemoteRepository(TestMode).connect(conn.branch("/entities/mode")));

      const entity = entityManager.merge("mode", { id: "m-1", slug: "test" }, TestMode);
      const storeBefore = entityManager.stores.mode.get();

      entity.slug = "mutated";
      entityManager.persist(entity);

      const storeAfter = entityManager.stores.mode.get();
      specimen.expect(storeAfter).not.toBe(storeBefore);
      specimen.expect(storeAfter[0]).toBe(entity);
      specimen.expect(storeAfter[0].slug).toBe("mutated");
    });

    specimen.it("persist propagation reaches nanostore subscribers", () => {
      const entityManager = new RemoteEntityManager(conn, schema);
      entityManager.register("mode", new RemoteRepository(TestMode).connect(conn.branch("/entities/mode")));

      const entity = entityManager.merge("mode", { id: "m-1", slug: "original" }, TestMode);

      let subscriberSlugs = [];
      entityManager.stores.mode.subscribe((modes) => {
        subscriberSlugs = modes.map((m) => m.slug);
      });

      entity.slug = "changed";
      entityManager.persist(entity);

      specimen.expect(subscriberSlugs).toEqual(["changed"]);
    });

    specimen.it("persist on unregistered entity does not throw", () => {
      const entityManager = new RemoteEntityManager(conn, schema);
      const orphan = { id: "orphan-1", slug: "rogue" };
      entityManager.persist(orphan);
      specimen.expect(entityManager.dirty.has(orphan)).toBe(true);
    });

    specimen.it("persist → remove → persist cycle restores dirty state", () => {
      const entityManager = new RemoteEntityManager(conn, schema);
      entityManager.register("mode", new RemoteRepository(TestMode).connect(conn.branch("/entities/mode")));

      const entity = entityManager.merge("mode", { id: "m-1", slug: "test" }, TestMode);

      entityManager.persist(entity);
      entityManager.remove(entity);
      entityManager.persist(entity);

      specimen.expect(entityManager.dirty.has(entity)).toBe(true);
      specimen.expect(entityManager.removed.has(entity)).toBe(false);
    });

    specimen.it("multiple persists on same entity do not duplicate in dirty set", () => {
      const entityManager = new RemoteEntityManager(conn, schema);
      entityManager.register("mode", new RemoteRepository(TestMode).connect(conn.branch("/entities/mode")));

      const entity = entityManager.merge("mode", { id: "m-1", slug: "test" }, TestMode);

      entityManager.persist(entity);
      entityManager.persist(entity);
      entityManager.persist(entity);

      specimen.expect(entityManager.dirty.size).toBe(1);
    });
  });

  specimen.describe("fork", () => {
    specimen.it("creates fresh EM with same connection and schema", () => {
      const entityManager = new RemoteEntityManager(conn, schema);
      entityManager.register("mode", new RemoteRepository(TestMode).connect(conn.branch("/entities/mode")));
      entityManager.merge("mode", { id: "m-1", slug: "test" }, TestMode);

      const forked = entityManager.fork();
      specimen.expect(forked.identities.size).toBe(0);
      specimen.expect(forked.connection).toBe(conn);
      specimen.expect(forked.schema).toBe(schema);
    });
  });
});

  specimen.describe("class field initializer safety", () => {
    specimen.it("merge preserves data over field initializer defaults", () => {
      const entityManager = new RemoteEntityManager(conn, schema);
      entityManager.register("mode", new RemoteRepository(TestMode).connect(conn.branch("/entities/mode")));
      entityManager.register("thread", new RemoteRepository(TestThread).connect(conn.branch("/entities/mode")));

      const mode = entityManager.merge("mode", { id: "m-1", slug: "test" }, TestMode);
      const thread = entityManager.merge("thread", {
        id: "t-1", mode: mode, intent: { id: "i-1" }, cursor: 5, counter: 10,
      }, TestThread);

      specimen.expect(thread).toBeInstanceOf(TestThread);
      specimen.expect(thread.mode).toBe(mode);
      specimen.expect(thread.intent).toEqual({ id: "i-1" });
      specimen.expect(thread.cursor).toBe(5);
      specimen.expect(thread.counter).toBe(10);
    });

    specimen.it("cast preserves hydrated relations over field initializer defaults", async () => {
      const entityManager = new RemoteEntityManager(conn, schema);
      entityManager.register("mode", new RemoteRepository(TestMode).connect(conn.branch("/entities/mode")));
      entityManager.register("intent", new RemoteRepository(TestIntent).connect(conn.branch("/entities/intent")));
      entityManager.register("thread", new RemoteRepository(TestThread).connect(conn.branch("/entities/mode")));

      const mode = entityManager.merge("mode", { id: "m-1", slug: "test" }, TestMode);

      const thread = await entityManager.cast("thread", {
        id: "t-1", mode: "m-1", cursor: 3,
      }, TestThread);

      specimen.expect(thread.mode).toBe(mode);
      specimen.expect(thread.cursor).toBe(3);
    });
  });

  specimen.describe("snapshot resilience", () => {
    specimen.it("snapshot tolerates entities with non-cloneable properties", () => {
      const entityManager = new RemoteEntityManager(conn, schema);
      entityManager.register("mode", new RemoteRepository(TestEnrichedMode).connect(conn.branch("/entities/mode")));

      // Simulate enriched mode with functions (like daemon.wafer /resolve does)
      const enriched = entityManager.merge("mode", {
        id: "m-1",
        slug: "test",
        call: function() {},
        buffer: () => ({ mode: "m-1", data: {} }),
        connection: { fetch: () => {} },
        intents: new Set(["i-1"]),
      }, TestEnrichedMode);

      // Should not throw — snapshot skips non-cloneable entities
      specimen.expect(enriched.id).toBe("m-1");
      specimen.expect(enriched.slug).toBe("test");

      // Dirty tracking gracefully degrades (no snapshot = no diff)
      enriched.slug = "mutated";
      const changes = entityManager.changes("mode", enriched);
      specimen.expect(changes).toBe(null);
    });
  });

// ── RemoteRepository managed by RemoteEntityManager ──────────────────────

specimen.describe("RemoteRepository + RemoteEntityManager", () => {

  specimen.it("managed repo delegates merge to EM identity map", async () => {
    const entityManager = new RemoteEntityManager(conn, schema);
    const modeRepo = new RemoteRepository(TestMode).connect(conn.branch("/entities/mode"));
    entityManager.register("mode", modeRepo);

    const modes = await modeRepo.find();
    specimen.expect(modes.length).toBeGreaterThan(0);
    specimen.expect(modes[0]).toBeInstanceOf(TestMode);

    // Same reference on second find — EM identity guarantee
    const again = await modeRepo.find();
    specimen.expect(again[0]).toBe(modes[0]);
  });

  specimen.it("managed repo $entities points to EM store", async () => {
    const entityManager = new RemoteEntityManager(conn, schema);
    const modeRepo = new RemoteRepository(TestMode).connect(conn.branch("/entities/mode"));
    entityManager.register("mode", modeRepo);

    specimen.expect(modeRepo.$entities).toBe(entityManager.stores.mode);

    await modeRepo.find();
    specimen.expect(modeRepo.$entities.get().length).toBeGreaterThan(0);
  });

  specimen.it("managed repo findOneLocal works against EM store", async () => {
    const entityManager = new RemoteEntityManager(conn, schema);
    const modeRepo = new RemoteRepository(TestMode).connect(conn.branch("/entities/mode"));
    entityManager.register("mode", modeRepo);

    await modeRepo.find();
    const found = modeRepo.findOneLocal({ slug: "test" });
    specimen.expect(found).toBeDefined();
    specimen.expect(found.slug).toBe("test");
  });

  specimen.it("managed repo drop delegates to EM", async () => {
    const entityManager = new RemoteEntityManager(conn, schema);
    const modeRepo = new RemoteRepository(TestMode).connect(conn.branch("/entities/mode"));
    entityManager.register("mode", modeRepo);

    await modeRepo.find();
    const id = modeRepo.$entities.get()[0].id;

    modeRepo.drop(id);
    specimen.expect(entityManager.identity("mode", id)).toBe(null);
    specimen.expect(modeRepo.$entities.get().find((e) => e.id === id)).toBeUndefined();
  });

  specimen.it("managed repo cast resolves cross-repo via EM", async () => {
    const entityManager = new RemoteEntityManager(conn, schema);
    const modeRepo = new RemoteRepository(TestMode).connect(conn.branch("/entities/mode"));
    const intentRepo = new RemoteRepository(TestIntent).connect(conn.branch("/entities/intent"));
    entityManager.register("mode", modeRepo);
    entityManager.register("intent", intentRepo);

    // Populate modes
    const modes = await modeRepo.find();
    const modeId = modes[0].id;

    // Cast an intent through the managed repo — should resolve mode via EM
    const intent = await intentRepo.cast({ id: "i-synthetic", slug: "test-intent", mode: { id: modeId } });
    specimen.expect(intent.mode).toBe(modes[0]);
  });

});
