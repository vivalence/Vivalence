import { specimen } from "@vivalence/typology"
import { LocalRepository } from "../prototypes/local-repository.js"

specimen.describe("LocalRepository", () => {
  specimen.it("a store creates, finds, and forgets", async () => {
    const repository = new LocalRepository()

    const home = await repository.create({ slug: "home" })
    specimen.expect(home.id).toBeTruthy()
    specimen.expect(home.slug).toBe("home")
    specimen.expect(repository.$entities.get()).toContain(home)

    specimen.expect((await repository.create({ id: "custom", slug: "explicit" })).id).toBe("custom")

    await repository.create({ slug: "alpha", type: "game" })
    await repository.create({ slug: "beta", type: "tactic" })
    specimen.expect(repository.find().length).toBeGreaterThan(0)
    specimen.expect(repository.find({ type: "game" }).every((entity) => entity.type === "game")).toBe(true)
    specimen.expect(repository.findOne({ slug: "home" }).slug).toBe("home")
    specimen.expect(repository.findOne({ slug: "nonexistent" })).toBeNull()
    specimen.expect(repository.count()).toBe(repository.find().length)

    const checked = await repository.create({ slug: "check" })
    specimen.expect(repository.has(checked.id)).toBe(true)
    specimen.expect(repository.has("missing")).toBe(false)

    const doomed = await repository.create({ slug: "doomed" })
    const before = repository.size
    repository.remove(doomed.id)
    specimen.expect(repository.size).toBe(before - 1)
    specimen.expect(repository.has(doomed.id)).toBe(false)

    repository.clear()
    specimen.expect(repository.size).toBe(0)
    specimen.expect(repository.$entities.get().length).toBe(0)
  })

  specimen.it("an identity upserts by id", async () => {
    const repository = new LocalRepository()

    const first = await repository.merge({ id: "1", slug: "a", enriched: "yes" })
    const second = await repository.merge({ id: "1", slug: "b" })
    specimen.expect(first).toBe(second)
    specimen.expect(first.slug).toBe("b")
    specimen.expect(first.enriched).toBe("yes")
    specimen.expect(repository.size).toBe(1)

    await repository.merge({ id: "2", slug: "c" })
    specimen.expect(repository.size).toBe(2)
    specimen.expect(await repository.merge(null)).toBeNull()

    repository.drop("1")
    repository.drop("2")
    specimen.expect(repository.size).toBe(0)
  })

  specimen.it("an update patches in place and notifies", async () => {
    const repository = new LocalRepository()
    const entity = await repository.create({ slug: "mutable", count: 0 })

    const updated = repository.update(entity.id, { count: 5 })
    specimen.expect(updated).toBe(entity)
    specimen.expect(updated.count).toBe(5)
    specimen.expect(repository.update("ghost", { count: 1 })).toBeNull()

    let notified = false
    repository.$entities.subscribe(() => { notified = true })
    notified = false
    repository.update(entity.id, { slug: "changed" })
    specimen.expect(notified).toBe(true)
  })

  specimen.it("a kind wraps every entity", async () => {
    class Terminal { constructor(data) { Object.assign(this, data) } }
    const repository = new LocalRepository({ kind: Terminal })
    specimen.expect(await repository.create({ slug: "home" })).toBeInstanceOf(Terminal)
    specimen.expect(await repository.merge({ id: "1", slug: "home" })).toBeInstanceOf(Terminal)
  })

  specimen.it("integrate fires once per new identity", async () => {
    const created = new LocalRepository()
    const seen = []
    created.integrate = async (entity, raw) => seen.push({ entity, raw })
    const entity = await created.create({ slug: "h" })
    specimen.expect(seen.length).toBe(1)
    specimen.expect(seen[0].entity).toBe(entity)
    specimen.expect(seen[0].raw.slug).toBe("h")

    const merged = new LocalRepository()
    let mergedCount = 0
    merged.integrate = async () => { mergedCount++ }
    await merged.merge({ id: "x", slug: "a" })
    specimen.expect(mergedCount).toBe(1)

    const existing = new LocalRepository()
    await existing.create({ id: "x", slug: "a" })
    let existingCount = 0
    existing.integrate = async () => { existingCount++ }
    await existing.merge({ id: "x", slug: "b" })
    specimen.expect(existingCount).toBe(0)

    const recast = new LocalRepository()
    let recastCount = 0
    recast.integrate = async () => { recastCount++ }
    await recast.cast({ id: "x", slug: "a" })
    await recast.cast({ id: "x", slug: "b" })
    specimen.expect(recastCount).toBe(1)
  })
})
