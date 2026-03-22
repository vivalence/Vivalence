import { specimen, Broadcaster } from "@vivalence/typology"

specimen.describe("Broadcaster", () => {
  specimen.it("push reaches subscriber", async () => {
    const broadcaster = new Broadcaster()
    const { iterable, unsubscribe } = broadcaster.subscribe()
    broadcaster.push({ op: "create", entity: { id: "1", slug: "test" } }, { id: "1", slug: "test" })

    const result = await iterable[Symbol.asyncIterator]().next()
    specimen.expect(result.value.op).toBe("create")
    specimen.expect(result.value.entity.slug).toBe("test")
    unsubscribe()
  })

  specimen.it("filter matches", async () => {
    const broadcaster = new Broadcaster()
    const { iterable, unsubscribe } = broadcaster.subscribe({ slug: "hello" })

    broadcaster.push({ op: "update", entity: { id: "1", slug: "other" } }, { id: "1", slug: "other" })
    broadcaster.push({ op: "update", entity: { id: "2", slug: "hello" } }, { id: "2", slug: "hello" })

    const result = await iterable[Symbol.asyncIterator]().next()
    specimen.expect(result.value.entity.slug).toBe("hello")
    unsubscribe()
  })

  specimen.it("empty filter matches everything", async () => {
    const broadcaster = new Broadcaster()
    const { iterable, unsubscribe } = broadcaster.subscribe()
    broadcaster.push({ op: "create", entity: { id: "1" } }, { id: "1" })

    const result = await iterable[Symbol.asyncIterator]().next()
    specimen.expect(result.value.op).toBe("create")
    unsubscribe()
  })

  specimen.it("unsubscribe stops iteration", async () => {
    const broadcaster = new Broadcaster()
    const { iterable, unsubscribe } = broadcaster.subscribe()

    unsubscribe()

    const result = await iterable[Symbol.asyncIterator]().next()
    specimen.expect(result.done).toBe(true)
  })

  specimen.it("multiple subscribers", async () => {
    const broadcaster = new Broadcaster()
    const a = broadcaster.subscribe()
    const b = broadcaster.subscribe()

    broadcaster.push({ op: "create", entity: { id: "1" } }, { id: "1" })

    const ra = await a.iterable[Symbol.asyncIterator]().next()
    const rb = await b.iterable[Symbol.asyncIterator]().next()
    specimen.expect(ra.value.op).toBe("create")
    specimen.expect(rb.value.op).toBe("create")

    a.unsubscribe()
    b.unsubscribe()
  })

  specimen.it("push to closed subscription is no-op", async () => {
    const broadcaster = new Broadcaster()
    const { iterable, unsubscribe } = broadcaster.subscribe()
    unsubscribe()

    broadcaster.push({ op: "create", entity: { id: "1" } }, { id: "1" })
    const result = await iterable[Symbol.asyncIterator]().next()
    specimen.expect(result.done).toBe(true)
  })

  specimen.it("timeout ends iteration", async () => {
    const broadcaster = new Broadcaster()
    const { iterable, unsubscribe } = broadcaster.subscribe({}, { timeout: 50 })

    const result = await iterable[Symbol.asyncIterator]().next()
    specimen.expect(result.done).toBe(true)
    unsubscribe()
  })

  specimen.it("queues events before consumption", async () => {
    const broadcaster = new Broadcaster()
    const { iterable, unsubscribe } = broadcaster.subscribe()

    broadcaster.push({ op: "create", entity: { id: "1" } }, { id: "1" })
    broadcaster.push({ op: "update", entity: { id: "2" } }, { id: "2" })

    const iter = iterable[Symbol.asyncIterator]()
    const first = await iter.next()
    const second = await iter.next()
    specimen.expect(first.value.entity.id).toBe("1")
    specimen.expect(second.value.entity.id).toBe("2")
    unsubscribe()
  })

  specimen.it("unsubscribe removes from _subscribers set", () => {
    const broadcaster = new Broadcaster()
    const { unsubscribe } = broadcaster.subscribe()
    specimen.expect(broadcaster._subscribers.size).toBe(1)
    unsubscribe()
    specimen.expect(broadcaster._subscribers.size).toBe(0)
  })
})
