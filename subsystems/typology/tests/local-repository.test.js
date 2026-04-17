import { specimen } from "@vivalence/typology"
import { LocalRepository } from "../prototypes/local-repository.js"

specimen.describe("LocalRepository", () => {
  specimen.describe("CRUD", () => {
    let repo

    specimen.beforeAll(() => {
      repo = new LocalRepository()
    })

    specimen.it("create assigns id and populates store", async () => {
      const entity = await repo.create({ slug: "home" })
      specimen.expect(entity.id).toBeTruthy()
      specimen.expect(entity.slug).toBe("home")
      specimen.expect(repo.$entities.get()).toContain(entity)
    })

    specimen.it("create with explicit id preserves it", async () => {
      const entity = await repo.create({ id: "custom", slug: "explicit" })
      specimen.expect(entity.id).toBe("custom")
    })

    specimen.it("find returns all when no where", () => {
      const results = repo.find()
      specimen.expect(results.length).toBeGreaterThan(0)
    })

    specimen.it("find filters by where clause", async () => {
      await repo.create({ slug: "alpha", type: "game" })
      await repo.create({ slug: "beta", type: "tactic" })
      const games = repo.find({ type: "game" })
      specimen.expect(games.every(entity => entity.type === "game")).toBe(true)
    })

    specimen.it("findOne returns first match", () => {
      const result = repo.findOne({ slug: "home" })
      specimen.expect(result.slug).toBe("home")
    })

    specimen.it("findOne returns null for missing", () => {
      specimen.expect(repo.findOne({ slug: "nonexistent" })).toBeNull()
    })

    specimen.it("count matches find length", () => {
      specimen.expect(repo.count()).toBe(repo.find().length)
    })

    specimen.it("has checks existence by id", async () => {
      const entity = await repo.create({ slug: "check" })
      specimen.expect(repo.has(entity.id)).toBe(true)
      specimen.expect(repo.has("missing")).toBe(false)
    })

    specimen.it("remove drops from store and identity", async () => {
      const entity = await repo.create({ slug: "doomed" })
      const before = repo.size
      repo.remove(entity.id)
      specimen.expect(repo.size).toBe(before - 1)
      specimen.expect(repo.has(entity.id)).toBe(false)
    })
  })

  specimen.describe("identity", () => {
    specimen.it("merge upserts by id", async () => {
      const repo = new LocalRepository()
      const a = await repo.merge({ id: "1", slug: "a" })
      const b = await repo.merge({ id: "1", slug: "b" })
      specimen.expect(a).toBe(b)
      specimen.expect(a.slug).toBe("b")
      specimen.expect(repo.size).toBe(1)
    })

    specimen.it("merge appends new entities", async () => {
      const repo = new LocalRepository()
      await repo.merge({ id: "1", slug: "a" })
      await repo.merge({ id: "2", slug: "b" })
      specimen.expect(repo.size).toBe(2)
    })

    specimen.it("merge returns null for null", async () => {
      const repo = new LocalRepository()
      specimen.expect(await repo.merge(null)).toBeNull()
    })

    specimen.it("merge preserves fields not in patch", async () => {
      const repo = new LocalRepository()
      await repo.merge({ id: "1", slug: "a", enriched: "yes" })
      await repo.merge({ id: "1", slug: "b" })
      const entity = repo.findOne({ id: "1" })
      specimen.expect(entity.slug).toBe("b")
      specimen.expect(entity.enriched).toBe("yes")
    })

    specimen.it("drop aliases remove", async () => {
      const repo = new LocalRepository()
      await repo.create({ id: "1", slug: "a" })
      repo.drop("1")
      specimen.expect(repo.size).toBe(0)
    })
  })

  specimen.describe("update", () => {
    specimen.it("patches existing entity in place", async () => {
      const repo = new LocalRepository()
      const entity = await repo.create({ slug: "mutable", count: 0 })
      const updated = repo.update(entity.id, { count: 5 })
      specimen.expect(updated).toBe(entity)
      specimen.expect(updated.count).toBe(5)
    })

    specimen.it("returns null for missing id", () => {
      const repo = new LocalRepository()
      specimen.expect(repo.update("ghost", { count: 1 })).toBeNull()
    })

    specimen.it("triggers $entities refresh", async () => {
      const repo = new LocalRepository()
      const entity = await repo.create({ slug: "watch" })
      let notified = false
      repo.$entities.subscribe(() => { notified = true })
      notified = false
      repo.update(entity.id, { slug: "changed" })
      specimen.expect(notified).toBe(true)
    })
  })

  specimen.describe("prototype wrapping", () => {
    specimen.it("wraps created entities in kind", async () => {
      class Terminal { constructor(data) { Object.assign(this, data) } }
      const repo = new LocalRepository({ kind: Terminal })
      const entity = await repo.create({ slug: "home" })
      specimen.expect(entity).toBeInstanceOf(Terminal)
    })

    specimen.it("wraps merged entities in kind", async () => {
      class Terminal { constructor(data) { Object.assign(this, data) } }
      const repo = new LocalRepository({ kind: Terminal })
      const entity = await repo.merge({ id: "1", slug: "home" })
      specimen.expect(entity).toBeInstanceOf(Terminal)
    })
  })

  specimen.describe("integrate", () => {
    specimen.it("fires integrate on cast of new id", async () => {
      const repo = new LocalRepository()
      const seen = []
      repo.integrate = async (entity, raw) => seen.push({ entity, raw })
      const entity = await repo.create({ slug: "h" })
      specimen.expect(seen.length).toBe(1)
      specimen.expect(seen[0].entity).toBe(entity)
      specimen.expect(seen[0].raw.slug).toBe("h")
    })

    specimen.it("fires integrate on merge of new id", async () => {
      const repo = new LocalRepository()
      let count = 0
      repo.integrate = async () => { count++ }
      await repo.merge({ id: "x", slug: "a" })
      specimen.expect(count).toBe(1)
    })

    specimen.it("does not fire integrate on merge of existing id", async () => {
      const repo = new LocalRepository()
      await repo.create({ id: "x", slug: "a" })
      let count = 0
      repo.integrate = async () => { count++ }
      await repo.merge({ id: "x", slug: "b" })
      specimen.expect(count).toBe(0)
    })

    specimen.it("does not fire integrate on re-cast of same id", async () => {
      const repo = new LocalRepository()
      let count = 0
      repo.integrate = async () => { count++ }
      await repo.cast({ id: "x", slug: "a" })
      await repo.cast({ id: "x", slug: "b" })
      specimen.expect(count).toBe(1)
    })
  })

  specimen.describe("clear", () => {
    specimen.it("empties everything", async () => {
      const repo = new LocalRepository()
      await repo.create({ slug: "a" })
      await repo.create({ slug: "b" })
      repo.clear()
      specimen.expect(repo.size).toBe(0)
      specimen.expect(repo.$entities.get().length).toBe(0)
    })
  })
})
