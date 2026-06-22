import {
  specimen, Aperture, Connection, Url,
  shard, shape, RemoteEntityManager,
} from "@vivalence/typology"
import { datamap } from "@vivalence/typology/scenarios"
import { RemoteRepository } from "@vivalence/typology/prototypes"

function managed(connection, name, kind) {
  const entityManager = new RemoteEntityManager(connection)
  const repo = entityManager.register(name, new RemoteRepository(kind))
  repo.connect(connection.branch(`/${name}`))
  return repo
}

specimen.describe("persist", { sanitizeResources: false, sanitizeOps: false }, () => {
let scenario, conn

specimen.beforeAll(async () => {
  scenario = await datamap.seed()
  const { repos } = scenario

  const aperture = new Aperture()
  aperture.branch("/literal").slurp(shard.datamap.repository(repos.literal))
  aperture.branch("/symbol").slurp(shard.datamap.repository(repos.symbol))
  aperture.branch("/mode").slurp(shard.datamap.repository(repos.mode))
  aperture.branch("/intent").slurp(shard.datamap.repository(repos.intent))

  conn = new Connection(
    new Url("http://test"),
    shard.transmitter.inline(shape.http(aperture)),
  )
})

specimen.afterAll(async () => {
  await scenario.orm.close()
})

specimen.describe("persist: basic lifecycle", () => {
  specimen.beforeEach(() => localStorage.clear())

  specimen.it("persist() writes to storage on find", async () => {
    const repo = managed(conn, "literal")
    repo.persist()

    await repo.find()
    const key = conn.branch("/literal").url.absolute
    const stored = localStorage.getItem(key)
    specimen.expect(stored).toBeDefined()
    const parsed = JSON.parse(stored)
    specimen.expect(parsed.length).toBeGreaterThan(0)
    specimen.expect(parsed[0].slug).toBeDefined()
  })

  specimen.it("persist() writes to storage on create", async () => {
    const repo = managed(conn, "literal")
    repo.persist()

    await repo.create({ slug: "persist-create", trait: {} })
    const key = conn.branch("/literal").url.absolute
    const stored = localStorage.getItem(key)
    const parsed = JSON.parse(stored)
    specimen.expect(parsed.find((e) => e.slug === "persist-create")).toBeDefined()
  })

  specimen.it("persist() hydrates from storage on construction", () => {
    const key = conn.branch("/mode").url.absolute
    localStorage.setItem(key, JSON.stringify([
      { id: "cached-1", slug: "from-cache", type: "game", traits: ["APPLICATION"] },
    ]))

    const repo = managed(conn, "mode")
    repo.persist()

    const local = repo.$entities.get()
    specimen.expect(local.length).toBe(1)
    specimen.expect(local[0].slug).toBe("from-cache")
  })
})

specimen.describe("persist: prototype wrapping survives storage", () => {
  specimen.beforeEach(() => localStorage.clear())

  specimen.it("hydrated entities have prototype methods", () => {
    class Mode {
      constructor(d) { Object.assign(this, d) }
      implements(t) { return this.traits?.includes(t) }
    }

    const key = conn.branch("/mode").url.absolute
    localStorage.setItem(key, JSON.stringify([
      { id: "p1", slug: "flashcard", type: "game", traits: ["APPLICATION", "SELFEVIDENT"] },
    ]))

    const repo = managed(conn, "mode", Mode)
    repo.persist()

    const entities = repo.$entities.get()
    specimen.expect(entities.length).toBe(1)
    specimen.expect(entities[0]).toBeInstanceOf(Mode)
    specimen.expect(entities[0].implements("APPLICATION")).toBe(true)
    specimen.expect(entities[0].implements("NOPE")).toBe(false)
  })

  specimen.it("find from cache returns prototype-wrapped entities", async () => {
    class Mode {
      constructor(d) { Object.assign(this, d) }
      implements(t) { return this.traits?.includes(t) }
    }

    const key = conn.branch("/mode").url.absolute
    localStorage.setItem(key, JSON.stringify([
      { id: "p2", slug: "cached-mode", type: "game", traits: ["EMITTER"] },
    ]))

    const repo = managed(conn, "mode", Mode)
    repo.persist()

    const results = await repo.find()
    specimen.expect(results[0]).toBeInstanceOf(Mode)
    specimen.expect(results[0].implements("EMITTER")).toBe(true)
  })
})

specimen.describe("persist: identity guarantees", () => {
  specimen.beforeEach(() => localStorage.clear())

  specimen.it("no duplicates: persist hydrate + network fetch returns same references", async () => {
    const key = conn.branch("/literal").url.absolute
    const existing = await conn.call("/literal/find", { where: { slug: "hello" } })
    localStorage.setItem(key, JSON.stringify(existing))

    const repo = managed(conn, "literal")
    repo.persist()

    specimen.expect(repo.$entities.get().length).toBe(1)
    const cached = repo.$entities.get()[0]

    const fetched = await repo.find({ slug: "hello" })
    specimen.expect(fetched.length).toBe(1)

    // persisted find returns from cache — same objects
    specimen.expect(fetched[0]).toBe(cached)
    // store still has exactly one entity, not two
    specimen.expect(repo.$entities.get().length).toBe(1)
  })

  specimen.it("no duplicates: merge after persist doesn't create copies", async () => {
    const key = conn.branch("/literal").url.absolute
    localStorage.setItem(key, JSON.stringify([
      { id: "dup-1", slug: "original", trait: {} },
    ]))

    const repo = managed(conn, "literal")
    repo.persist()

    repo.merge({ id: "dup-1", slug: "updated", trait: { X: 1 } })
    specimen.expect(repo.$entities.get().length).toBe(1)
    specimen.expect(repo.$entities.get()[0].slug).toBe("updated")
    specimen.expect(repo.$entities.get()[0].trait.X).toBe(1)
  })

  specimen.it("no duplicates: concurrent find + merge from subscription", async () => {
    const repo = managed(conn, "literal")
    repo.persist()

    const results = await repo.find({ slug: "hello" })
    const entity = results[0]

    // simulate subscription event for same entity
    repo.merge({ id: entity.id, slug: "hello", trait: { SSE: true } })

    specimen.expect(repo.$entities.get().filter((e) => e.id === entity.id).length).toBe(1)
    specimen.expect(entity.trait.SSE).toBe(true)
  })
})

specimen.describe("persist: cross-repo wiring", () => {
  specimen.beforeEach(() => localStorage.clear())

  specimen.it("cast resolves string id refs from sibling store", async () => {
    const schema = {
      mode: { properties: {} },
      intent: { properties: { mode: { kind: "m:1", target: "mode" } } },
    }
    const entityManager = new RemoteEntityManager(conn, schema)
    const modes = entityManager.register("mode", new RemoteRepository())
    const intents = entityManager.register("intent", new RemoteRepository())
    shard.datamap.wire({ mode: modes, intent: intents }, schema)

    const mode = await modes.merge({ id: "m1", slug: "flashcard" })
    const intent = await intents.cast({ id: "i1", slug: "greet", mode: "m1" })

    specimen.expect(intent.mode).toBe(mode)
  })

  specimen.it("cast resolves string id array refs (m:n) from sibling store", async () => {
    const schema = {
      literal: { properties: { symbols: { kind: "m:n", target: "symbol" } } },
      symbol: { properties: {} },
    }
    const entityManager = new RemoteEntityManager(conn, schema)
    const literals = entityManager.register("literal", new RemoteRepository())
    const symbols = entityManager.register("symbol", new RemoteRepository())
    shard.datamap.wire({ literal: literals, symbol: symbols }, schema)

    const s1 = await symbols.merge({ id: "s1", slug: "greeting" })
    const s2 = await symbols.merge({ id: "s2", slug: "farewell" })
    const lit = await literals.cast({ id: "l1", slug: "hello", symbols: ["s1", "s2"] })

    specimen.expect(lit.symbols[0]).toBe(s1)
    specimen.expect(lit.symbols[1]).toBe(s2)
  })

  specimen.it("cast leaves unresolvable string ids as-is", async () => {
    const schema = {
      literal: { properties: { symbols: { kind: "m:n", target: "symbol" } } },
      symbol: { properties: {} },
    }
    const entityManager = new RemoteEntityManager(conn, schema)
    const literals = entityManager.register("literal", new RemoteRepository())
    const symbols = entityManager.register("symbol", new RemoteRepository())
    shard.datamap.wire({ literal: literals, symbol: symbols }, schema)

    const lit = await literals.cast({ id: "l1", slug: "orphan", symbols: ["missing-id"] })
    specimen.expect(lit.symbols[0]).toBe("missing-id")
  })

  specimen.it("persisted repo serves cached data with resolved relations", async () => {
    const modeKey = conn.branch("/mode").url.absolute
    const intentKey = conn.branch("/intent").url.absolute

    // pre-populate storage
    const modes = await conn.call("/mode/find", { where: {} })
    const intents = await conn.call("/intent/find", { where: {} })
    localStorage.setItem(modeKey, JSON.stringify(modes))
    localStorage.setItem(intentKey, JSON.stringify(intents.map((i) => ({
      ...i,
      mode: typeof i.mode === "object" ? i.mode.id : i.mode,
    }))))

    const schema = shard.datamap.strip(scenario.orm.getMetadata())
    const entityManager = new RemoteEntityManager(conn, schema)
    const modeRepo = entityManager.register("mode", new RemoteRepository())
    const intentRepo = entityManager.register("intent", new RemoteRepository())
    modeRepo.connect(conn.branch("/mode")).persist()
    intentRepo.connect(conn.branch("/intent")).persist()
    shard.datamap.wire({ mode: modeRepo, intent: intentRepo }, schema)

    // mode store is populated from persistence
    specimen.expect(modeRepo.$entities.get().length).toBeGreaterThan(0)

    // intent find serves from cache, cast resolves mode ref
    const foundIntents = await intentRepo.find()
    await intentRepo.revalidating
    for (const intent of foundIntents) {
      if (intent.mode) {
        const modeRef = modeRepo.$entities.get().find((m) => m.id === (intent.mode?.id ?? intent.mode))
        if (modeRef) {
          specimen.expect(intent.mode).toBe(modeRef)
        }
      }
    }
  })
})

specimen.describe("persist: stale-while-revalidate", () => {
  specimen.beforeEach(() => localStorage.clear())

  specimen.it("returns cached data immediately, background updates store", async () => {
    const repo = managed(conn, "literal")
    repo.persist()

    // cold fetch populates
    const cold = await repo.find({ slug: "hello" })
    specimen.expect(cold.length).toBe(1)

    // warm fetch returns instantly from cache
    const warm = await repo.find({ slug: "hello" })
    specimen.expect(warm.length).toBe(1)
    specimen.expect(warm[0]).toBe(cold[0])

    await repo.revalidating
  })

  specimen.it("background revalidate removes deleted entities", async () => {
    const key = conn.branch("/mode").url.absolute
    localStorage.setItem(key, JSON.stringify([
      { id: "stale-1", slug: "deleted-mode", type: "game", traits: [] },
      { id: "stale-2", slug: "also-deleted", type: "game", traits: [] },
    ]))

    const repo = managed(conn, "mode")
    repo.persist()

    specimen.expect(repo.$entities.get().length).toBe(2)

    // find triggers background revalidate
    const results = await repo.find()
    // immediate return has stale data
    specimen.expect(results.length).toBe(2)

    // wait for background revalidate to complete
    await repo.revalidating

    // stale entities should be gone, replaced with real server data
    const updated = repo.$entities.get()
    specimen.expect(updated.find((e) => e.id === "stale-1")).toBeUndefined()
    specimen.expect(updated.find((e) => e.id === "stale-2")).toBeUndefined()
    specimen.expect(updated.length).toBeGreaterThan(0)
  })

  specimen.it("enrichment survives background revalidate", async () => {
    const repo = managed(conn, "mode")
    repo.persist()

    // cold fetch
    const modes = await repo.find()
    // enrich like daemon lifecycle does
    for (const m of modes) {
      m.daemon = { slug: "brazilian" }
      m.connection = { fake: true }
      m.call = () => {}
    }

    const enriched = modes[0]
    specimen.expect(enriched.daemon.slug).toBe("brazilian")

    // trigger warm find (background revalidate)
    await repo.find()
    await repo.revalidating

    // enrichment should survive — put() only overwrites keys from incoming POJO
    specimen.expect(enriched.daemon.slug).toBe("brazilian")
    specimen.expect(enriched.connection.fake).toBe(true)
    specimen.expect(typeof enriched.call).toBe("function")
  })
})

specimen.describe("persist: encode edge cases", () => {
  specimen.it("encode strips functions from entities", () => {
    const repo = managed(conn, "mode")
    repo.persist()

    const mode = { id: "fn-1", slug: "test", type: "game", traits: [] }
    mode.call = () => {}
    mode.buffer = () => ({})

    const parsed = JSON.parse(repo.encode([mode]))
    const found = parsed.find((e) => e.id === "fn-1")
    specimen.expect(found.call).toBeUndefined()
    specimen.expect(found.buffer).toBeUndefined()
    specimen.expect(found.slug).toBe("test")
  })

  specimen.it("encode strips Sets and non-plain objects", () => {
    const repo = managed(conn, "mode")
    repo.persist()

    const mode = { id: "set-1", slug: "test", type: "game", traits: ["APPLICATION"] }
    mode.intents = new Set(["a", "b"])
    mode.mount = { constructor: class Path {}, nature: "/mode/game/test" }

    const parsed = JSON.parse(repo.encode([mode]))
    const found = parsed.find((e) => e.id === "set-1")
    specimen.expect(found.intents).toBeUndefined()
    specimen.expect(found.mount).toBeUndefined()
    specimen.expect(found.traits).toContain("APPLICATION")
  })

  specimen.it("encode collapses m:1 relations to {id}", () => {
    const intentRepo = managed(conn, "intent")
    intentRepo.schema = {
      properties: { mode: { kind: "m:1", target: "mode" } },
    }
    intentRepo.persist()

    const intent = {
      id: "enc-1",
      slug: "test-intent",
      mode: { id: "m1", slug: "flashcard", type: "game", daemon: { slug: "brazilian" } },
    }

    const parsed = JSON.parse(intentRepo.encode([intent]))
    const found = parsed.find((e) => e.id === "enc-1")
    specimen.expect(found.mode).toEqual({ id: "m1" })
  })

  specimen.it("encode collapses m:n relations to [{id}]", () => {
    const literalRepo = managed(conn, "literal")
    literalRepo.schema = {
      properties: { symbols: { kind: "m:n", target: "symbol" } },
    }
    literalRepo.persist()

    const literal = {
      id: "enc-2",
      slug: "test-literal",
      symbols: [
        { id: "s1", slug: "greeting", trait: {} },
        { id: "s2", slug: "farewell", trait: {} },
      ],
    }

    const parsed = JSON.parse(literalRepo.encode([literal]))
    const found = parsed.find((e) => e.id === "enc-2")
    specimen.expect(found.symbols).toEqual([{ id: "s1" }, { id: "s2" }])
  })

  specimen.it("encode handles circular-ish enrichment without throwing", () => {
    class Daemon { constructor(s) { this.slug = s } }

    const repo = managed(conn, "mode")
    repo.persist()

    const mode = { id: "circ-1", slug: "circular", type: "game", traits: [] }
    mode.daemon = new Daemon("brazilian")
    mode.daemon.entities = { mode: repo }
    mode.intents = new Set()
    mode.connection = conn.branch("/mode")

    const parsed = JSON.parse(repo.encode([mode]))
    const found = parsed.find((e) => e.id === "circ-1")
    specimen.expect(found.slug).toBe("circular")
    specimen.expect(found.daemon).toBeUndefined()
    specimen.expect(found.connection).toBeUndefined()
    specimen.expect(found.intents).toBeUndefined()
  })
})

specimen.describe("persist: error paths (silent-catch recovery)", () => {
  specimen.beforeEach(() => localStorage.clear())

  specimen.it("corrupt cache → discards the poisoned key, recovers, warns (not silent)", () => {
    const key = conn.branch("/mode").url.absolute
    localStorage.setItem(key, "{ this is not ] valid json")

    const warnings = []
    const originalWarn = console.warn
    console.warn = (...args) => warnings.push(args)

    let repo
    try {
      repo = managed(conn, "mode")
      repo.persist() // must NOT throw on a corrupt cache
    } finally {
      console.warn = originalWarn
    }

    specimen.expect(repo.$entities.get().length).toBe(0)   // nothing hydrated from garbage
    specimen.expect(localStorage.getItem(key)).toBe(null)  // poisoned key cleared (won't re-break next boot)
    specimen.expect(warnings.length).toBeGreaterThan(0)    // logged, not swallowed
  })

  specimen.it("store() failure → best-effort, never throws, keeps in-memory data", async () => {
    const repo = managed(conn, "literal")
    repo.persist()

    const warnings = []
    const originalWarn = console.warn
    console.warn = (...args) => warnings.push(args)
    repo.encode = () => { throw new Error("QuotaExceededError") } // store() runs encode inside its try → forces the failure

    try {
      await repo.merge({ id: "quota-1", slug: "survives", trait: {} }) // merge → store(): must not throw
    } finally {
      console.warn = originalWarn
    }

    specimen.expect(repo.$entities.get().find((e) => e.id === "quota-1")).toBeDefined() // in-memory unaffected
    specimen.expect(warnings.length).toBeGreaterThan(0)
  })
})
})
