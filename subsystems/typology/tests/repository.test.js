import {
  specimen, Aperture, Connection, Url,
  shard, shape, RemoteEntityManager,
} from "@vivalence/typology"
import { datamap } from "@vivalence/typology/scenarios"
import { RemoteRepository } from "@vivalence/typology/prototypes"

let scenario, conn, schema, entityManager

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

  schema = shard.datamap.strip(scenario.orm.getMetadata())
})

specimen.afterAll(async () => {
  await scenario.orm.close()
})

// Helper: create a fresh EM with repos registered
function createEntityManager(repoConfigs) {
  const entityManager = new RemoteEntityManager(conn, schema)
  for (const [name, kind, endpoint] of repoConfigs) {
    const repository = new RemoteRepository(kind).connect(conn.branch(endpoint))
    entityManager.register(name, repository)
  }
  return entityManager
}

specimen.describe("RemoteRepository", () => {
  specimen.describe("CRUD", () => {
    let entityManager, remote

    specimen.beforeAll(() => {
      entityManager = createEntityManager([
        ["literal", null, "/literal"],
        ["mode", null, "/mode"],
      ])
      remote = entityManager.repo("literal")
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
      const freshEntityManager = createEntityManager([["literal", null, "/literal"]])
      const fresh = freshEntityManager.repo("literal")
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
      const modeRepo = entityManager.repo("mode")
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
      const entityManager = createEntityManager([])
      const typed = new RemoteRepository(Literal).connect(conn.branch("/literal"))
      entityManager.register("literal", typed)
      const results = await typed.find({ slug: "hello" })
      specimen.expect(results[0]).toBeInstanceOf(Literal)
    })

    specimen.it("wraps create result in prototype", async () => {
      class Literal { constructor(d) { Object.assign(this, d) } }
      const entityManager = createEntityManager([])
      const typed = new RemoteRepository(Literal).connect(conn.branch("/literal"))
      entityManager.register("literal", typed)
      const entity = await typed.create({ slug: "proto-create", trait: {} })
      specimen.expect(entity).toBeInstanceOf(Literal)
    })
  })

  specimen.describe("store identity", () => {
    specimen.it("merge upserts by id", async () => {
      const entityManager = createEntityManager([["test", null, "/literal"]])
      const remote = entityManager.repo("test")
      const a = await remote.merge({ id: "1", slug: "a" })
      const b = await remote.merge({ id: "1", slug: "b" })
      specimen.expect(a).toBe(b)
      specimen.expect(a.slug).toBe("b")
      specimen.expect(remote.$entities.get().length).toBe(1)
    })

    specimen.it("merge appends new entities", async () => {
      const entityManager = createEntityManager([["test", null, "/literal"]])
      const remote = entityManager.repo("test")
      await remote.merge({ id: "1", slug: "a" })
      await remote.merge({ id: "2", slug: "b" })
      specimen.expect(remote.$entities.get().length).toBe(2)
    })

    specimen.it("merge returns null for null input", async () => {
      const entityManager = createEntityManager([["test", null, "/literal"]])
      const remote = entityManager.repo("test")
      specimen.expect(await remote.merge(null)).toBeNull()
    })

    specimen.it("drop removes by id", async () => {
      const entityManager = createEntityManager([["test", null, "/literal"]])
      const remote = entityManager.repo("test")
      await remote.merge({ id: "1", slug: "a" })
      await remote.merge({ id: "2", slug: "b" })
      remote.drop("1")
      specimen.expect(remote.$entities.get().length).toBe(1)
      specimen.expect(remote.$entities.get()[0].id).toBe("2")
    })

    specimen.it("upsert does not overwrite existing values with undefined", async () => {
      const entityManager = createEntityManager([["test", null, "/literal"]])
      const remote = entityManager.repo("test")
      const a = await remote.merge({ id: "1", slug: "a", enriched: "yes" })
      await remote.merge({ id: "1", slug: "b" })
      specimen.expect(a.slug).toBe("b")
      specimen.expect(a.enriched).toBe("yes")
    })

    specimen.it("hydrate runs after merge on entity", async () => {
      const entityManager = createEntityManager([["test", null, "/literal"]])
      const remote = entityManager.repo("test")
      const lookup = { m1: { id: "m1", slug: "flashcard", daemon: "brazilian" } }
      remote.hydrate = async (raw) => {
        const entity = remote.entityManager.merge(remote.managedName, raw, remote.kind)
        if (typeof entity.mode === "string") entity.mode = lookup[entity.mode]
        return entity
      }
      const a = await remote.merge({ id: "1", mode: "m1" })
      specimen.expect(a.mode).toBe(lookup.m1)

      const b = await remote.merge({ id: "1", mode: "m1", extra: true })
      specimen.expect(b).toBe(a)
      specimen.expect(b.mode).toBe(lookup.m1)
      specimen.expect(b.extra).toBe(true)
    })

    specimen.it("hydrate preserves enriched references across merges", async () => {
      const entityManager = createEntityManager([["test", null, "/literal"]])
      const remote = entityManager.repo("test")
      const enrichedMode = { id: "m1", slug: "test", daemon: { slug: "brazilian" } }
      remote.hydrate = async (raw) => {
        const entity = remote.entityManager.merge(remote.managedName, raw, remote.kind)
        if (entity.mode !== enrichedMode) entity.mode = enrichedMode
        return entity
      }
      const a = await remote.merge({ id: "1", mode: "m1" })
      specimen.expect(a.mode).toBe(enrichedMode)

      await remote.merge({ id: "1", mode: "m1" })
      specimen.expect(a.mode).toBe(enrichedMode)
    })
  })

  specimen.describe("hydration", () => {
    specimen.it("hydrates m:1 relations via EM", async () => {
      const entityManager = new RemoteEntityManager(conn, schema)
      const modes = new RemoteRepository().connect(conn.branch("/mode"))
      const intents = new RemoteRepository().connect(conn.branch("/intent"))
      entityManager.register("mode", modes)
      entityManager.register("intent", intents)

      const mode = await modes.merge({ id: "m1", slug: "flashcard" })
      const intent = await intents.cast({ id: "i1", slug: "greet", mode: { id: "m1", slug: "flashcard" } })

      specimen.expect(intent.mode).toBe(mode)
    })

    specimen.it("hydrates 1:m relations via EM", async () => {
      const entityManager = new RemoteEntityManager(conn, schema)
      const modes = new RemoteRepository().connect(conn.branch("/mode"))
      const intents = new RemoteRepository().connect(conn.branch("/intent"))
      entityManager.register("mode", modes)
      entityManager.register("intent", intents)

      const i1 = await intents.merge({ id: "i1", slug: "a" })
      const mode = await modes.cast({ id: "m1", intents: [{ id: "i1", slug: "a" }, { id: "i2", slug: "b" }] })

      specimen.expect(mode.intents[0]).toBe(i1)
      specimen.expect(mode.intents[1].id).toBe("i2")
    })

    specimen.it("skips null relation values", async () => {
      const entityManager = new RemoteEntityManager(conn, schema)
      const modes = new RemoteRepository().connect(conn.branch("/mode"))
      entityManager.register("mode", modes)

      const entity = await modes.cast({ id: "1", mode: null })
      specimen.expect(entity.mode).toBeNull()
    })
  })
})
