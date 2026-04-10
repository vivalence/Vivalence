import { specimen } from "@vivalence/typology"
import { LocalRepository } from "../prototypes/local-repository.js"

specimen.describe("LocalRepository", () => {
  specimen.describe("CRUD", () => {
    let repo

    specimen.beforeAll(() => {
      repo = new LocalRepository()
    })

    specimen.it("create assigns id and populates store", () => {
      const entity = repo.create({ slug: "home" })
      specimen.expect(entity.id).toBeTruthy()
      specimen.expect(entity.slug).toBe("home")
      specimen.expect(repo.$entities.get()).toContain(entity)
    })

    specimen.it("create with explicit id preserves it", () => {
      const entity = repo.create({ id: "custom", slug: "explicit" })
      specimen.expect(entity.id).toBe("custom")
    })

    specimen.it("find returns all when no where", () => {
      const results = repo.find()
      specimen.expect(results.length).toBeGreaterThan(0)
    })

    specimen.it("find filters by where clause", () => {
      repo.create({ slug: "alpha", type: "game" })
      repo.create({ slug: "beta", type: "tactic" })
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

    specimen.it("has checks existence by id", () => {
      const entity = repo.create({ slug: "check" })
      specimen.expect(repo.has(entity.id)).toBe(true)
      specimen.expect(repo.has("missing")).toBe(false)
    })

    specimen.it("remove drops from store and identity", () => {
      const entity = repo.create({ slug: "doomed" })
      const before = repo.size
      repo.remove(entity.id)
      specimen.expect(repo.size).toBe(before - 1)
      specimen.expect(repo.has(entity.id)).toBe(false)
    })
  })

  specimen.describe("identity", () => {
    specimen.it("merge upserts by id", () => {
      const repo = new LocalRepository()
      const a = repo.merge({ id: "1", slug: "a" })
      const b = repo.merge({ id: "1", slug: "b" })
      specimen.expect(a).toBe(b)
      specimen.expect(a.slug).toBe("b")
      specimen.expect(repo.size).toBe(1)
    })

    specimen.it("merge appends new entities", () => {
      const repo = new LocalRepository()
      repo.merge({ id: "1", slug: "a" })
      repo.merge({ id: "2", slug: "b" })
      specimen.expect(repo.size).toBe(2)
    })

    specimen.it("merge returns raw for null", () => {
      const repo = new LocalRepository()
      specimen.expect(repo.merge(null)).toBeNull()
    })

    specimen.it("merge preserves fields not in patch", () => {
      const repo = new LocalRepository()
      repo.merge({ id: "1", slug: "a", enriched: "yes" })
      repo.merge({ id: "1", slug: "b" })
      const entity = repo.findOne({ id: "1" })
      specimen.expect(entity.slug).toBe("b")
      specimen.expect(entity.enriched).toBe("yes")
    })

    specimen.it("drop aliases remove", () => {
      const repo = new LocalRepository()
      repo.create({ id: "1", slug: "a" })
      repo.drop("1")
      specimen.expect(repo.size).toBe(0)
    })
  })

  specimen.describe("update", () => {
    specimen.it("patches existing entity in place", () => {
      const repo = new LocalRepository()
      const entity = repo.create({ slug: "mutable", count: 0 })
      const updated = repo.update(entity.id, { count: 5 })
      specimen.expect(updated).toBe(entity)
      specimen.expect(updated.count).toBe(5)
    })

    specimen.it("returns null for missing id", () => {
      const repo = new LocalRepository()
      specimen.expect(repo.update("ghost", { count: 1 })).toBeNull()
    })

    specimen.it("triggers $entities refresh", () => {
      const repo = new LocalRepository()
      const entity = repo.create({ slug: "watch" })
      let notified = false
      repo.$entities.subscribe(() => { notified = true })
      notified = false
      repo.update(entity.id, { slug: "changed" })
      specimen.expect(notified).toBe(true)
    })
  })

  specimen.describe("prototype wrapping", () => {
    specimen.it("wraps created entities in kind", () => {
      class Terminal { constructor(data) { Object.assign(this, data) } }
      const repo = new LocalRepository({ kind: Terminal })
      const entity = repo.create({ slug: "home" })
      specimen.expect(entity).toBeInstanceOf(Terminal)
    })

    specimen.it("wraps merged entities in kind", () => {
      class Terminal { constructor(data) { Object.assign(this, data) } }
      const repo = new LocalRepository({ kind: Terminal })
      const entity = repo.merge({ id: "1", slug: "home" })
      specimen.expect(entity).toBeInstanceOf(Terminal)
    })
  })

  specimen.describe("clear", () => {
    specimen.it("empties everything", () => {
      const repo = new LocalRepository()
      repo.create({ slug: "a" })
      repo.create({ slug: "b" })
      repo.clear()
      specimen.expect(repo.size).toBe(0)
      specimen.expect(repo.$entities.get().length).toBe(0)
    })
  })
})
