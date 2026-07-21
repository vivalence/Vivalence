import {
  specimen, Aperture, Connection, Url,
  shard, shape, RemoteEntityManager, RemoteRepository,
} from "@vivalence/typology";
import { datamap } from "@vivalence/typology/scenarios";

function managed(connection, name, kind) {
  const entityManager = new RemoteEntityManager(connection);
  const repository = entityManager.register(name, new RemoteRepository(kind));
  repository.connect(connection.branch(`/${name}`));
  return repository;
}

specimen.describe("RemoteRepository.persist", { sanitizeResources: false, sanitizeOps: false }, () => {
  let scenario, connection;

  specimen.beforeAll(async () => {
    scenario = await datamap.seed();

    const aperture = new Aperture();
    aperture.branch("/literal").slurp(shard.datamap.repository(scenario.repos.literal));
    aperture.branch("/symbol").slurp(shard.datamap.repository(scenario.repos.symbol));
    aperture.branch("/mode").slurp(shard.datamap.repository(scenario.repos.mode));
    aperture.branch("/intent").slurp(shard.datamap.repository(scenario.repos.intent));

    connection = new Connection(
      new Url("http://test"),
      shard.transmitter.inline(shape.http(aperture)),
    );
  });

  specimen.afterAll(async () => {
    await scenario.orm.close();
  });

  specimen.it("a persisted repository writes through and hydrates back", async () => {
    localStorage.clear();
    const literalKey = connection.branch("/literal").url.absolute;
    const literals = managed(connection, "literal");
    literals.persist();

    await literals.find();
    const stored = localStorage.getItem(literalKey);
    specimen.expect(stored).toBeDefined();
    const parsed = JSON.parse(stored);
    specimen.expect(parsed.length).toBeGreaterThan(0);
    specimen.expect(parsed[0].slug).toBeDefined();

    await literals.create({ slug: "persist-create", trait: {} });
    const afterCreate = JSON.parse(localStorage.getItem(literalKey));
    specimen.expect(afterCreate.find((entity) => entity.slug === "persist-create")).toBeDefined();

    localStorage.clear();
    const modeKey = connection.branch("/mode").url.absolute;
    localStorage.setItem(modeKey, JSON.stringify([
      { id: "cached-1", slug: "from-cache", type: "game", traits: ["APPLICATION"] },
    ]));
    const hydrated = managed(connection, "mode");
    hydrated.persist();
    const local = hydrated.$entities.get();
    specimen.expect(local.length).toBe(1);
    specimen.expect(local[0].slug).toBe("from-cache");

    class Mode {
      constructor(data) { Object.assign(this, data); }
      implements(trait) { return this.traits?.includes(trait); }
    }

    localStorage.clear();
    localStorage.setItem(modeKey, JSON.stringify([
      { id: "p1", slug: "flashcard", type: "game", traits: ["APPLICATION", "SELFEVIDENT"] },
    ]));
    const wrapped = managed(connection, "mode", Mode);
    wrapped.persist();
    const entities = wrapped.$entities.get();
    specimen.expect(entities.length).toBe(1);
    specimen.expect(entities[0]).toBeInstanceOf(Mode);
    specimen.expect(entities[0].implements("APPLICATION")).toBe(true);
    specimen.expect(entities[0].implements("NOPE")).toBe(false);

    localStorage.clear();
    localStorage.setItem(modeKey, JSON.stringify([
      { id: "p2", slug: "cached-mode", type: "game", traits: ["EMITTER"] },
    ]));
    const cachedRepository = managed(connection, "mode", Mode);
    cachedRepository.persist();
    const results = await cachedRepository.find();
    specimen.expect(results[0]).toBeInstanceOf(Mode);
    specimen.expect(results[0].implements("EMITTER")).toBe(true);
  });

  specimen.it("an identity survives the cache and the wire", async () => {
    localStorage.clear();
    const literalKey = connection.branch("/literal").url.absolute;
    const existing = await connection.call("/literal/find", { where: { slug: "hello" } });
    localStorage.setItem(literalKey, JSON.stringify(existing));

    const literals = managed(connection, "literal");
    literals.persist();
    specimen.expect(literals.$entities.get().length).toBe(1);
    const cached = literals.$entities.get()[0];

    const fetched = await literals.find({ slug: "hello" });
    specimen.expect(fetched.length).toBe(1);
    specimen.expect(fetched[0]).toBe(cached);
    specimen.expect(literals.$entities.get().length).toBe(1);

    localStorage.clear();
    localStorage.setItem(literalKey, JSON.stringify([
      { id: "dup-1", slug: "original", trait: {} },
    ]));
    const merging = managed(connection, "literal");
    merging.persist();
    merging.merge({ id: "dup-1", slug: "updated", trait: { X: 1 } });
    specimen.expect(merging.$entities.get().length).toBe(1);
    specimen.expect(merging.$entities.get()[0].slug).toBe("updated");
    specimen.expect(merging.$entities.get()[0].trait.X).toBe(1);

    localStorage.clear();
    const subscribed = managed(connection, "literal");
    subscribed.persist();
    const results = await subscribed.find({ slug: "hello" });
    const entity = results[0];
    subscribed.merge({ id: entity.id, slug: "hello", trait: { SSE: true } });
    specimen.expect(subscribed.$entities.get().filter((candidate) => candidate.id === entity.id).length).toBe(1);
    specimen.expect(entity.trait.SSE).toBe(true);
  });

  specimen.it("a relation knits across sibling stores", async () => {
    localStorage.clear();
    const modeIntentSchema = {
      mode: { properties: {} },
      intent: { properties: { mode: { kind: "m:1", target: "mode" } } },
    };
    const modeIntentManager = new RemoteEntityManager(connection, modeIntentSchema);
    const modes = modeIntentManager.register("mode", new RemoteRepository());
    const intents = modeIntentManager.register("intent", new RemoteRepository());
    shard.datamap.wire({ mode: modes, intent: intents }, modeIntentSchema);

    const mode = await modes.merge({ id: "m1", slug: "flashcard" });
    const intent = await intents.cast({ id: "i1", slug: "greet", mode: "m1" });
    specimen.expect(intent.mode).toBe(mode);

    const literalSymbolSchema = {
      literal: { properties: { symbols: { kind: "m:n", target: "symbol" } } },
      symbol: { properties: {} },
    };
    const literalSymbolManager = new RemoteEntityManager(connection, literalSymbolSchema);
    const literals = literalSymbolManager.register("literal", new RemoteRepository());
    const symbols = literalSymbolManager.register("symbol", new RemoteRepository());
    shard.datamap.wire({ literal: literals, symbol: symbols }, literalSymbolSchema);

    const greeting = await symbols.merge({ id: "s1", slug: "greeting" });
    const farewell = await symbols.merge({ id: "s2", slug: "farewell" });
    const literal = await literals.cast({ id: "l1", slug: "hello", symbols: ["s1", "s2"] });
    specimen.expect(literal.symbols[0]).toBe(greeting);
    specimen.expect(literal.symbols[1]).toBe(farewell);

    const orphan = await literals.cast({ id: "l2", slug: "orphan", symbols: ["missing-id"] });
    specimen.expect(orphan.symbols[0]).toBe("missing-id");

    const modeKey = connection.branch("/mode").url.absolute;
    const intentKey = connection.branch("/intent").url.absolute;
    const serverModes = await connection.call("/mode/find", { where: {} });
    const serverIntents = await connection.call("/intent/find", { where: {} });
    localStorage.setItem(modeKey, JSON.stringify(serverModes));
    localStorage.setItem(intentKey, JSON.stringify(serverIntents.map((intentRow) => ({
      ...intentRow,
      mode: typeof intentRow.mode === "object" ? intentRow.mode.id : intentRow.mode,
    }))));

    const schema = shard.datamap.strip(scenario.orm.getMetadata());
    const entityManager = new RemoteEntityManager(connection, schema);
    const modeRepository = entityManager.register("mode", new RemoteRepository());
    const intentRepository = entityManager.register("intent", new RemoteRepository());
    modeRepository.connect(connection.branch("/mode")).persist();
    intentRepository.connect(connection.branch("/intent")).persist();
    shard.datamap.wire({ mode: modeRepository, intent: intentRepository }, schema);

    specimen.expect(modeRepository.$entities.get().length).toBeGreaterThan(0);

    const foundIntents = await intentRepository.find();
    await intentRepository.revalidating;
    for (const found of foundIntents) {
      if (found.mode) {
        const modeReference = modeRepository.$entities.get().find((candidate) => candidate.id === (found.mode?.id ?? found.mode));
        if (modeReference) {
          specimen.expect(found.mode).toBe(modeReference);
        }
      }
    }
  });

  specimen.it("a stale cache serves instantly, then the wire corrects it", async () => {
    localStorage.clear();
    const literals = managed(connection, "literal");
    literals.persist();

    const cold = await literals.find({ slug: "hello" });
    specimen.expect(cold.length).toBe(1);
    const warm = await literals.find({ slug: "hello" });
    specimen.expect(warm.length).toBe(1);
    specimen.expect(warm[0]).toBe(cold[0]);
    await literals.revalidating;

    localStorage.clear();
    const modeKey = connection.branch("/mode").url.absolute;
    localStorage.setItem(modeKey, JSON.stringify([
      { id: "stale-1", slug: "deleted-mode", type: "game", traits: [] },
      { id: "stale-2", slug: "also-deleted", type: "game", traits: [] },
    ]));
    const stale = managed(connection, "mode");
    stale.persist();
    specimen.expect(stale.$entities.get().length).toBe(2);

    const results = await stale.find();
    specimen.expect(results.length).toBe(2);
    await stale.revalidating;
    const updated = stale.$entities.get();
    specimen.expect(updated.find((entity) => entity.id === "stale-1")).toBeUndefined();
    specimen.expect(updated.find((entity) => entity.id === "stale-2")).toBeUndefined();
    specimen.expect(updated.length).toBeGreaterThan(0);

    localStorage.clear();
    const enrichable = managed(connection, "mode");
    enrichable.persist();
    const modes = await enrichable.find();
    for (const mode of modes) {
      mode.daemon = { slug: "brazilian" };
      mode.connection = { fake: true };
      mode.call = () => {};
    }
    const enriched = modes[0];
    specimen.expect(enriched.daemon.slug).toBe("brazilian");

    await enrichable.find();
    await enrichable.revalidating;
    specimen.expect(enriched.daemon.slug).toBe("brazilian");
    specimen.expect(enriched.connection.fake).toBe(true);
    specimen.expect(typeof enriched.call).toBe("function");
  });

  specimen.it("an encode strips the unstorable, and failures never poison the store", async () => {
    const modeRepository = managed(connection, "mode");
    modeRepository.persist();

    const withFunctions = { id: "fn-1", slug: "test", type: "game", traits: [] };
    withFunctions.call = () => {};
    withFunctions.buffer = () => ({});
    const strippedFunctions = JSON.parse(modeRepository.encode([withFunctions])).find((entity) => entity.id === "fn-1");
    specimen.expect(strippedFunctions.call).toBeUndefined();
    specimen.expect(strippedFunctions.buffer).toBeUndefined();
    specimen.expect(strippedFunctions.slug).toBe("test");

    const withCollections = { id: "set-1", slug: "test", type: "game", traits: ["APPLICATION"] };
    withCollections.intents = new Set(["a", "b"]);
    withCollections.mount = { constructor: class Path {}, nature: "/mode/game/test" };
    const strippedCollections = JSON.parse(modeRepository.encode([withCollections])).find((entity) => entity.id === "set-1");
    specimen.expect(strippedCollections.intents).toBeUndefined();
    specimen.expect(strippedCollections.mount).toBeUndefined();
    specimen.expect(strippedCollections.traits).toContain("APPLICATION");

    const intentRepository = managed(connection, "intent");
    intentRepository.schema = {
      properties: { mode: { kind: "m:1", target: "mode" } },
    };
    intentRepository.persist();
    const collapsed = JSON.parse(intentRepository.encode([{
      id: "enc-1",
      slug: "test-intent",
      mode: { id: "m1", slug: "flashcard", type: "game", daemon: { slug: "brazilian" } },
    }])).find((entity) => entity.id === "enc-1");
    specimen.expect(collapsed.mode).toEqual({ id: "m1" });

    const literalRepository = managed(connection, "literal");
    literalRepository.schema = {
      properties: { symbols: { kind: "m:n", target: "symbol" } },
    };
    literalRepository.persist();
    const collapsedMany = JSON.parse(literalRepository.encode([{
      id: "enc-2",
      slug: "test-literal",
      symbols: [
        { id: "s1", slug: "greeting", trait: {} },
        { id: "s2", slug: "farewell", trait: {} },
      ],
    }])).find((entity) => entity.id === "enc-2");
    specimen.expect(collapsedMany.symbols).toEqual([{ id: "s1" }, { id: "s2" }]);

    class Daemon { constructor(slug) { this.slug = slug; } }
    const circularRepository = managed(connection, "mode");
    circularRepository.persist();
    const circular = { id: "circ-1", slug: "circular", type: "game", traits: [] };
    circular.daemon = new Daemon("brazilian");
    circular.daemon.entities = { mode: circularRepository };
    circular.intents = new Set();
    circular.connection = connection.branch("/mode");
    const encodedCircular = JSON.parse(circularRepository.encode([circular])).find((entity) => entity.id === "circ-1");
    specimen.expect(encodedCircular.slug).toBe("circular");
    specimen.expect(encodedCircular.daemon).toBeUndefined();
    specimen.expect(encodedCircular.connection).toBeUndefined();
    specimen.expect(encodedCircular.intents).toBeUndefined();

    localStorage.clear();
    const modeKey = connection.branch("/mode").url.absolute;
    localStorage.setItem(modeKey, "{ this is not ] valid json");
    const corruptWarnings = [];
    const warnBeforeCorrupt = console.warn;
    console.warn = (...warned) => corruptWarnings.push(warned);
    let corrupted;
    try {
      corrupted = managed(connection, "mode");
      corrupted.persist();
    } finally {
      console.warn = warnBeforeCorrupt;
    }
    specimen.expect(corrupted.$entities.get().length).toBe(0);
    specimen.expect(localStorage.getItem(modeKey)).toBe(null);
    specimen.expect(corruptWarnings.length).toBeGreaterThan(0);

    localStorage.clear();
    const quota = managed(connection, "literal");
    quota.persist();
    const quotaWarnings = [];
    const warnBeforeQuota = console.warn;
    console.warn = (...warned) => quotaWarnings.push(warned);
    quota.encode = () => { throw new Error("QuotaExceededError"); };
    try {
      await quota.merge({ id: "quota-1", slug: "survives", trait: {} });
    } finally {
      console.warn = warnBeforeQuota;
    }
    specimen.expect(quota.$entities.get().find((entity) => entity.id === "quota-1")).toBeDefined();
    specimen.expect(quotaWarnings.length).toBeGreaterThan(0);
  });
});
