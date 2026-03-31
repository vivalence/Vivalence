import {
  specimen, Aperture, Connection, Url,
  shard, shape,
} from "@vivalence/typology"
import { datamap } from "@vivalence/typology/scenarios"
import { RemoteRepository } from "@vivalence/typology/prototypes"
import { useTestStorageEngine, cleanTestStorage, getTestStorage, setTestStorageKey } from "@nanostores/persistent"

useTestStorageEngine()

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
  specimen.beforeEach(() => cleanTestStorage())

  specimen.it("persist() writes to storage on find", async () => {
    const repo = new RemoteRepository()
    repo.connect(conn.branch("/literal"))
    repo.persist()

    await repo.find()
    const stored = getTestStorage()
    const key = conn.branch("/literal").url.absolute
    specimen.expect(stored[key]).toBeDefined()
    const parsed = JSON.parse(stored[key])
    specimen.expect(parsed.length).toBeGreaterThan(0)
    specimen.expect(parsed[0].slug).toBeDefined()
  })

  specimen.it("persist() writes to storage on create", async () => {
    const repo = new RemoteRepository()
    repo.connect(conn.branch("/literal"))
    repo.persist()

    await repo.create({ slug: "persist-create", trait: {} })
    const stored = getTestStorage()
    const key = conn.branch("/literal").url.absolute
    const parsed = JSON.parse(stored[key])
    specimen.expect(parsed.find((e) => e.slug === "persist-create")).toBeDefined()
  })

  specimen.it("persist() hydrates from storage on construction", () => {
    const key = conn.branch("/mode").url.absolute
    setTestStorageKey(key, JSON.stringify([
      { id: "cached-1", slug: "from-cache", type: "game", traits: ["BUFFERED"] },
    ]))

    const repo = new RemoteRepository()
    repo.connect(conn.branch("/mode"))
    repo.persist()

    const local = repo.$entities.get()
    specimen.expect(local.length).toBe(1)
    specimen.expect(local[0].slug).toBe("from-cache")
  })
})

specimen.describe("persist: prototype wrapping survives storage", () => {
  specimen.beforeEach(() => cleanTestStorage())

  specimen.it("hydrated entities have prototype methods", () => {
    class Mode {
      constructor(d) { Object.assign(this, d) }
      implements(t) { return this.traits?.includes(t) }
    }

    const key = conn.branch("/mode").url.absolute
    setTestStorageKey(key, JSON.stringify([
      { id: "p1", slug: "flashcard", type: "game", traits: ["BUFFERED", "SELFEVIDENT"] },
    ]))

    const repo = new RemoteRepository(Mode)
    repo.connect(conn.branch("/mode"))
    repo.persist()

    const entities = repo.$entities.get()
    specimen.expect(entities.length).toBe(1)
    specimen.expect(entities[0]).toBeInstanceOf(Mode)
    specimen.expect(entities[0].implements("BUFFERED")).toBe(true)
    specimen.expect(entities[0].implements("NOPE")).toBe(false)
  })

  specimen.it("find from cache returns prototype-wrapped entities", async () => {
    class Mode {
      constructor(d) { Object.assign(this, d) }
      implements(t) { return this.traits?.includes(t) }
    }

    const key = conn.branch("/mode").url.absolute
    setTestStorageKey(key, JSON.stringify([
      { id: "p2", slug: "cached-mode", type: "game", traits: ["EMITTER"] },
    ]))

    const repo = new RemoteRepository(Mode)
    repo.connect(conn.branch("/mode"))
    repo.persist()

    const results = await repo.find()
    specimen.expect(results[0]).toBeInstanceOf(Mode)
    specimen.expect(results[0].implements("EMITTER")).toBe(true)
  })
})

specimen.describe("persist: identity guarantees", () => {
  specimen.beforeEach(() => cleanTestStorage())

  specimen.it("no duplicates: persist hydrate + network fetch returns same references", async () => {
    const key = conn.branch("/literal").url.absolute
    const existing = await conn.call("/literal/find", { where: { slug: "hello" } })
    setTestStorageKey(key, JSON.stringify(existing))

    const repo = new RemoteRepository()
    repo.connect(conn.branch("/literal"))
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
    setTestStorageKey(key, JSON.stringify([
      { id: "dup-1", slug: "original", trait: {} },
    ]))

    const repo = new RemoteRepository()
    repo.connect(conn.branch("/literal"))
    repo.persist()

    repo.merge({ id: "dup-1", slug: "updated", trait: { X: 1 } })
    specimen.expect(repo.$entities.get().length).toBe(1)
    specimen.expect(repo.$entities.get()[0].slug).toBe("updated")
    specimen.expect(repo.$entities.get()[0].trait.X).toBe(1)
  })

  specimen.it("no duplicates: concurrent find + merge from subscription", async () => {
    const repo = new RemoteRepository()
    repo.connect(conn.branch("/literal"))
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
  specimen.beforeEach(() => cleanTestStorage())

  specimen.it("cast resolves string id refs from sibling store", () => {
    const modes = new RemoteRepository()
    const intents = new RemoteRepository()

    const stores = { mode: modes, intent: intents }
    modes.schema = { properties: {}, stores }
    intents.schema = {
      properties: { mode: { kind: "m:1", target: "mode" } },
      stores,
    }

    const mode = modes.merge({ id: "m1", slug: "flashcard" })
    const intent = intents.cast({ id: "i1", slug: "greet", mode: "m1" })

    specimen.expect(intent.mode).toBe(mode)
  })

  specimen.it("cast resolves string id array refs (m:n) from sibling store", () => {
    const literals = new RemoteRepository()
    const symbols = new RemoteRepository()

    const stores = { literal: literals, symbol: symbols }
    literals.schema = {
      properties: { symbols: { kind: "m:n", target: "symbol" } },
      stores,
    }
    symbols.schema = { properties: {}, stores }

    const s1 = symbols.merge({ id: "s1", slug: "greeting" })
    const s2 = symbols.merge({ id: "s2", slug: "farewell" })
    const lit = literals.cast({ id: "l1", slug: "hello", symbols: ["s1", "s2"] })

    specimen.expect(lit.symbols[0]).toBe(s1)
    specimen.expect(lit.symbols[1]).toBe(s2)
  })

  specimen.it("cast leaves unresolvable string ids as-is", () => {
    const literals = new RemoteRepository()
    const symbols = new RemoteRepository()

    const stores = { literal: literals, symbol: symbols }
    literals.schema = {
      properties: { symbols: { kind: "m:n", target: "symbol" } },
      stores,
    }
    symbols.schema = { properties: {}, stores }

    const lit = literals.cast({ id: "l1", slug: "orphan", symbols: ["missing-id"] })
    specimen.expect(lit.symbols[0]).toBe("missing-id")
  })

  specimen.it("persisted repo serves cached data with resolved relations", async () => {
    const modeKey = conn.branch("/mode").url.absolute
    const intentKey = conn.branch("/intent").url.absolute

    // pre-populate storage
    const modes = await conn.call("/mode/find", { where: {} })
    const intents = await conn.call("/intent/find", { where: {} })
    setTestStorageKey(modeKey, JSON.stringify(modes))
    setTestStorageKey(intentKey, JSON.stringify(intents.map((i) => ({
      ...i,
      mode: typeof i.mode === "object" ? i.mode.id : i.mode,
    }))))

    const modeRepo = new RemoteRepository()
    const intentRepo = new RemoteRepository()
    modeRepo.connect(conn.branch("/mode")).persist()
    intentRepo.connect(conn.branch("/intent")).persist()

    const schema = shard.datamap.strip(scenario.orm.getMetadata())
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
  specimen.beforeEach(() => cleanTestStorage())

  specimen.it("returns cached data immediately, background updates store", async () => {
    const repo = new RemoteRepository()
    repo.connect(conn.branch("/literal"))
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
    setTestStorageKey(key, JSON.stringify([
      { id: "stale-1", slug: "deleted-mode", type: "game", traits: [] },
      { id: "stale-2", slug: "also-deleted", type: "game", traits: [] },
    ]))

    const repo = new RemoteRepository()
    repo.connect(conn.branch("/mode"))
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
    const repo = new RemoteRepository()
    repo.connect(conn.branch("/mode"))
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
  specimen.beforeEach(() => cleanTestStorage())

  specimen.it("encode strips functions from entities", async () => {
    const repo = new RemoteRepository()
    repo.connect(conn.branch("/mode"))
    repo.persist()

    const mode = repo.merge({ id: "fn-1", slug: "test", type: "game", traits: [] })
    mode.call = () => {}
    mode.buffer = () => ({})
    repo.$entities.set([...repo.$entities.get()])

    const key = conn.branch("/mode").url.absolute
    const stored = getTestStorage()
    const parsed = JSON.parse(stored[key])
    const found = parsed.find((e) => e.id === "fn-1")
    specimen.expect(found.call).toBeUndefined()
    specimen.expect(found.buffer).toBeUndefined()
    specimen.expect(found.slug).toBe("test")
  })

  specimen.it("encode strips Sets and non-plain objects", async () => {
    const repo = new RemoteRepository()
    repo.connect(conn.branch("/mode"))
    repo.persist()

    const mode = repo.merge({ id: "set-1", slug: "test", type: "game", traits: ["BUFFERED"] })
    mode.intents = new Set(["a", "b"])
    mode.mount = { constructor: class Path {}, nature: "/mode/game/test" }
    repo.$entities.set([...repo.$entities.get()])

    const key = conn.branch("/mode").url.absolute
    const stored = getTestStorage()
    const parsed = JSON.parse(stored[key])
    const found = parsed.find((e) => e.id === "set-1")
    specimen.expect(found.intents).toBeUndefined()
    specimen.expect(found.mount).toBeUndefined()
    specimen.expect(found.traits).toContain("BUFFERED")
  })

  specimen.it("encode collapses m:1 relations to {id}", async () => {
    const intentRepo = new RemoteRepository()
    intentRepo.connect(conn.branch("/intent"))
    intentRepo.schema = {
      properties: { mode: { kind: "m:1", target: "mode" } },
      stores: {},
    }
    intentRepo.persist()

    intentRepo.merge({
      id: "enc-1",
      slug: "test-intent",
      mode: { id: "m1", slug: "flashcard", type: "game", daemon: { slug: "brazilian" } },
    })

    const key = conn.branch("/intent").url.absolute
    const stored = getTestStorage()
    const parsed = JSON.parse(stored[key])
    const found = parsed.find((e) => e.id === "enc-1")
    specimen.expect(found.mode).toEqual({ id: "m1" })
  })

  specimen.it("encode collapses m:n relations to [{id}]", async () => {
    const literalRepo = new RemoteRepository()
    literalRepo.connect(conn.branch("/literal"))
    literalRepo.schema = {
      properties: { symbols: { kind: "m:n", target: "symbol" } },
      stores: {},
    }
    literalRepo.persist()

    literalRepo.merge({
      id: "enc-2",
      slug: "test-literal",
      symbols: [
        { id: "s1", slug: "greeting", trait: {} },
        { id: "s2", slug: "farewell", trait: {} },
      ],
    })

    const key = conn.branch("/literal").url.absolute
    const stored = getTestStorage()
    const parsed = JSON.parse(stored[key])
    const found = parsed.find((e) => e.id === "enc-2")
    specimen.expect(found.symbols).toEqual([{ id: "s1" }, { id: "s2" }])
  })

  specimen.it("encode handles circular-ish enrichment without throwing", async () => {
    class Daemon { constructor(s) { this.slug = s } }

    const repo = new RemoteRepository()
    repo.connect(conn.branch("/mode"))
    repo.persist()

    const mode = repo.merge({ id: "circ-1", slug: "circular", type: "game", traits: [] })
    // simulate daemon lifecycle enrichment — Daemon is a class, not plain object
    mode.daemon = new Daemon("brazilian")
    mode.daemon.entities = { mode: repo }
    mode.intents = new Set()
    mode.connection = conn.branch("/mode") // real Connection instance

    // trigger persistence — should not throw
    repo.$entities.set([...repo.$entities.get()])

    const key = conn.branch("/mode").url.absolute
    const stored = getTestStorage()
    const parsed = JSON.parse(stored[key])
    const found = parsed.find((e) => e.id === "circ-1")
    specimen.expect(found.slug).toBe("circular")
    specimen.expect(found.daemon).toBeUndefined()
    specimen.expect(found.connection).toBeUndefined()
    specimen.expect(found.intents).toBeUndefined()
  })
})
})
