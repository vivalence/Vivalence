import {
  specimen, Aperture, Connection, Url,
  shard, shape,
} from "@vivalence/typology"
import { datamap } from "@vivalence/typology/scenarios"
import { RemoteRepository } from "@vivalence/typology/prototypes"

let scenario, conn

specimen.beforeAll(async () => {
  scenario = await datamap.seed()
  const { repos } = scenario

  const aperture = new Aperture()
  aperture.branch("/literal").slurp(shard.datamap.repository(repos.literal))
  aperture.branch("/symbol").slurp(shard.datamap.repository(repos.symbol))
  aperture.branch("/mode").slurp(shard.datamap.repository(repos.mode))

  conn = new Connection(
    new Url("http://test"),
    shard.transmitter.inline(shape.http(aperture)),
  )
})

specimen.afterAll(async () => {
  await scenario.orm.close()
})

specimen.describe("RemoteRepository", () => {
  specimen.describe("CRUD", () => {
    let remote

    specimen.beforeAll(() => {
      remote = new RemoteRepository()
      remote.connect(conn.branch("/literal"))
    })

    specimen.it("find populates store", async () => {
      const results = await remote.find({ slug: "hello" })
      specimen.expect(results[0].slug).toBe("hello")
      specimen.expect(remote.$entities.get().length).toBeGreaterThan(0)
    })

    specimen.it("findOne local-first", async () => {
      const local = await remote.findOne({ slug: "hello" })
      specimen.expect(local.slug).toBe("hello")
    })

    specimen.it("findOne falls back to server", async () => {
      const fresh = new RemoteRepository()
      fresh.connect(conn.branch("/literal"))
      const result = await fresh.findOne({ slug: "hello" })
      specimen.expect(result.slug).toBe("hello")
    })

    specimen.it("findOne returns null for missing", async () => {
      const result = await remote.findOne({ slug: "doesnt-exist-at-all" })
      specimen.expect(result).toBeNull()
    })

    specimen.it("findAndCount returns tuple", async () => {
      const [entities, count] = await remote.findAndCount({})
      specimen.expect(count).toBeGreaterThan(0)
      specimen.expect(entities.length).toBe(count)
    })

    specimen.it("count returns number", async () => {
      const count = await remote.count({})
      specimen.expect(typeof count).toBe("number")
      specimen.expect(count).toBeGreaterThan(0)
    })

    specimen.it("create stores in $entities", async () => {
      const entity = await remote.create({ slug: "repo-create", trait: {} })
      specimen.expect(remote.$entities.get()).toContain(entity)
    })

    specimen.it("ensure stores", async () => {
      const modeRepo = new RemoteRepository()
      modeRepo.connect(conn.branch("/mode"))
      const entity = await modeRepo.ensure({ slug: "repo-ensure", type: "test", traits: [], installed: false })
      specimen.expect(entity.slug).toBe("repo-ensure")
      specimen.expect(modeRepo.$entities.get()).toContain(entity)
    })

    specimen.it("updateOne preserves identity", async () => {
      const entity = await remote.create({ slug: "repo-mut", trait: {} })
      const updated = await remote.updateOne({ id: entity.id }, { trait: { X: 1 } })
      specimen.expect(updated).toBe(entity)
      specimen.expect(updated.trait.X).toBe(1)
    })

    specimen.it("remove drops from store", async () => {
      const entity = await remote.create({ slug: "repo-rm", trait: {} })
      const before = remote.$entities.get().length
      await remote.removeOne({ id: entity.id })
      specimen.expect(remote.$entities.get().length).toBe(before - 1)
    })
  })

  specimen.describe("prototype wrapping", () => {
    specimen.it("wraps find results in prototype", async () => {
      class Literal { constructor(d) { Object.assign(this, d) } }
      const typed = new RemoteRepository(Literal)
      typed.connect(conn.branch("/literal"))
      const results = await typed.find({ slug: "hello" })
      specimen.expect(results[0]).toBeInstanceOf(Literal)
    })

    specimen.it("wraps create result in prototype", async () => {
      class Literal { constructor(d) { Object.assign(this, d) } }
      const typed = new RemoteRepository(Literal)
      typed.connect(conn.branch("/literal"))
      const entity = await typed.create({ slug: "proto-create", trait: {} })
      specimen.expect(entity).toBeInstanceOf(Literal)
    })
  })

  specimen.describe("store identity", () => {
    specimen.it("merge upserts by id", () => {
      const remote = new RemoteRepository()
      const a = remote.merge({ id: "1", slug: "a" })
      const b = remote.merge({ id: "1", slug: "b" })
      specimen.expect(a).toBe(b)
      specimen.expect(a.slug).toBe("b")
      specimen.expect(remote.$entities.get().length).toBe(1)
    })

    specimen.it("merge appends new entities", () => {
      const remote = new RemoteRepository()
      remote.merge({ id: "1", slug: "a" })
      remote.merge({ id: "2", slug: "b" })
      specimen.expect(remote.$entities.get().length).toBe(2)
    })

    specimen.it("merge returns null for null input", () => {
      const remote = new RemoteRepository()
      specimen.expect(remote.merge(null)).toBeNull()
    })

    specimen.it("_drop removes by id", () => {
      const remote = new RemoteRepository()
      remote.merge({ id: "1", slug: "a" })
      remote.merge({ id: "2", slug: "b" })
      remote._drop("1")
      specimen.expect(remote.$entities.get().length).toBe(1)
      specimen.expect(remote.$entities.get()[0].id).toBe("2")
    })

    specimen.it("upsert does not overwrite existing values with undefined", () => {
      const remote = new RemoteRepository()
      const a = remote.merge({ id: "1", slug: "a", enriched: "yes" })
      remote.merge({ id: "1", slug: "b" })
      specimen.expect(a.slug).toBe("b")
      specimen.expect(a.enriched).toBe("yes")
    })

    specimen.it("resolve runs after upsert on existing entity", () => {
      const remote = new RemoteRepository()
      const lookup = { m1: { id: "m1", slug: "flashcard", daemon: "brazilian" } }
      remote.resolve = (entity) => {
        if (typeof entity.mode === "string") entity.mode = lookup[entity.mode]
      }
      const a = remote.merge({ id: "1", mode: "m1" })
      specimen.expect(a.mode).toBe(lookup.m1)

      const b = remote.merge({ id: "1", mode: "m1", extra: true })
      specimen.expect(b).toBe(a)
      specimen.expect(b.mode).toBe(lookup.m1)
      specimen.expect(b.extra).toBe(true)
    })

    specimen.it("resolve preserves enriched references across merges", () => {
      const remote = new RemoteRepository()
      const enrichedMode = { id: "m1", slug: "test", daemon: { slug: "brazilian" } }
      remote.resolve = (entity) => {
        if (entity.mode !== enrichedMode) entity.mode = enrichedMode
      }
      const a = remote.merge({ id: "1", mode: "m1" })
      specimen.expect(a.mode).toBe(enrichedMode)

      remote.merge({ id: "1", mode: "m1" })
      specimen.expect(a.mode).toBe(enrichedMode)
    })
  })

  specimen.describe("offline mode", () => {
    specimen.it("find without connection filters local store", () => {
      const remote = new RemoteRepository()
      remote.merge({ id: "1", slug: "a" })
      remote.merge({ id: "2", slug: "b" })
      const result = remote.find({ slug: "a" })
      specimen.expect(result).resolves
    })

    specimen.it("create without connection stores locally", async () => {
      const remote = new RemoteRepository()
      const entity = await remote.create({ id: "1", slug: "local" })
      specimen.expect(remote.$entities.get()).toContain(entity)
    })

    specimen.it("subscribe without connection returns no-op", () => {
      const remote = new RemoteRepository()
      const unsub = remote.subscribe()
      specimen.expect(typeof unsub).toBe("function")
      unsub()
    })
  })

  specimen.describe("hydration", () => {
    specimen.it("hydrates m:1 relations via sibling repo", () => {
      const modes = new RemoteRepository()
      const intents = new RemoteRepository()

      const stores = { mode: modes, intent: intents }

      modes._schema = {
        properties: {},
        _stores: stores,
      }
      intents._schema = {
        properties: {
          mode: { kind: "m:1", target: "mode" },
        },
        _stores: stores,
      }

      const mode = modes.merge({ id: "m1", slug: "flashcard" })
      const intent = intents._hydrate({ id: "i1", slug: "greet", mode: { id: "m1", slug: "flashcard" } })

      specimen.expect(intent.mode).toBe(mode)
    })

    specimen.it("hydrates 1:m relations via sibling repo", () => {
      const modes = new RemoteRepository()
      const intents = new RemoteRepository()

      const stores = { mode: modes, intent: intents }

      modes._schema = {
        properties: {
          intents: { kind: "1:m", target: "intent" },
        },
        _stores: stores,
      }
      intents._schema = {
        properties: {},
        _stores: stores,
      }

      const i1 = intents.merge({ id: "i1", slug: "a" })
      const mode = modes._hydrate({ id: "m1", intents: [{ id: "i1", slug: "a" }, { id: "i2", slug: "b" }] })

      specimen.expect(mode.intents[0]).toBe(i1)
      specimen.expect(mode.intents[1].id).toBe("i2")
    })

    specimen.it("skips hydration when no schema", () => {
      const remote = new RemoteRepository()
      const entity = remote._hydrate({ id: "1", slug: "raw" })
      specimen.expect(entity.slug).toBe("raw")
    })

    specimen.it("skips null relation values", () => {
      const remote = new RemoteRepository()
      remote._schema = {
        properties: {
          mode: { kind: "m:1", target: "mode" },
        },
        _stores: {},
      }
      const entity = remote._hydrate({ id: "1", mode: null })
      specimen.expect(entity.mode).toBeNull()
    })
  })
})
