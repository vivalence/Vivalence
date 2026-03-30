import {
  specimen, sleep, Aperture, Vector, Connection, Url,
  shard, shape,
} from "@vivalence/typology"
import { datamap } from "@vivalence/typology/scenarios"
import { RemoteRepository } from "@vivalence/typology/prototypes"

const PORT = 9887
let scenario, server, conn

specimen.beforeAll(async () => {
  scenario = await datamap.seed()
  const { repos, fixtures } = scenario

  const twitch = new Vector()
  const aperture = new Aperture()

  aperture.branch("/literal")
    .slurp(shard.datamap.repository(repos.literal))
    .slurp(shard.datamap.reactive(repos.literal, twitch))

  aperture.branch("/symbol")
    .slurp(shard.datamap.repository(repos.symbol))
    .slurp(shard.datamap.reactive(repos.symbol, twitch))

  aperture.branch("/mode")
    .slurp(shard.datamap.repository(repos.mode))

  aperture
    .branch("/thread")
    .use(shard.context.attach("user", fixtures.user))
    .use(shard.datamap.scope((ctx) => ({ user: ctx.user.id })))
    .slurp(shard.datamap.repository(repos.thread))
    .slurp(shard.datamap.reactive(repos.thread, twitch))

  const sub = shape.subscriber(twitch)
  scenario.em.getEventManager().registerSubscriber(sub)

  const handler = shape.http(aperture)
  const abort = new AbortController()
  server = { abort }
  Deno.serve({ port: PORT, signal: abort.signal, onListen() {} }, handler)
  await sleep.ms(100)

  conn = new Connection(new Url(`http://localhost:${PORT}`))
})

specimen.afterAll(async () => {
  server.abort.abort()
  await scenario.orm.close()
})

specimen.describe("datamap over HTTP", () => {
  specimen.it("CRUD works over real network", async () => {
    const created = await conn.call("/literal/create", { data: { slug: "net-create", trait: {} } })
    specimen.expect(created.slug).toBe("net-create")

    const found = await conn.call("/literal/find", { where: { slug: "net-create" } })
    specimen.expect(found.length).toBe(1)

    const updated = await conn.call("/literal/updateOne", {
      where: { id: created.id }, data: { trait: { NET: true } },
    })
    specimen.expect(updated.trait.NET).toBe(true)

    const removed = await conn.call("/literal/removeOne", { where: { id: created.id } })
    specimen.expect(removed.ok).toBe(true)
  })
})

specimen.describe("reactive subscriptions over HTTP", () => {
  specimen.it("subscribe receives create events", async () => {
    const events = []
    const controller = new AbortController()

    const reader = (async () => {
      for await (const event of conn.subscribe("/literal/subscribe", {
        signal: controller.signal,
      })) {
        events.push(event)
        if (events.length >= 1) break
      }
    })()

    await sleep.ms(50)
    await conn.call("/literal/create", { data: { slug: "sse-create", trait: {} } })
    await reader

    specimen.expect(events.length).toBe(1)
    specimen.expect(events[0].op).toBe("create")
    specimen.expect(events[0].entity.slug).toBe("sse-create")
    controller.abort()
  })

  specimen.it("subscribe receives update events", async () => {
    const created = await conn.call("/literal/create", { data: { slug: "sse-update", trait: {} } })

    const events = []
    const controller = new AbortController()

    const reader = (async () => {
      for await (const event of conn.subscribe("/literal/subscribe", {
        signal: controller.signal,
      })) {
        events.push(event)
        if (events.length >= 1) break
      }
    })()

    await sleep.ms(50)
    await conn.call("/literal/updateOne", {
      where: { id: created.id }, data: { trait: { UPDATED: true } },
    })
    await reader

    specimen.expect(events[0].op).toBe("update")
    controller.abort()
  })

  specimen.it("subscribe receives delete events", async () => {
    const created = await conn.call("/literal/create", { data: { slug: "sse-delete", trait: {} } })

    const events = []
    const controller = new AbortController()

    const reader = (async () => {
      for await (const event of conn.subscribe("/literal/subscribe", {
        signal: controller.signal,
      })) {
        events.push(event)
        if (events.length >= 1) break
      }
    })()

    await sleep.ms(50)
    await conn.call("/literal/removeOne", { where: { id: created.id } })
    await reader

    specimen.expect(events[0].op).toBe("delete")
    controller.abort()
  })

  specimen.it("multiple entities on same server", async () => {
    const events = []
    const controller = new AbortController()

    const reader = (async () => {
      for await (const event of conn.subscribe("/symbol/subscribe", {
        signal: controller.signal,
      })) {
        events.push(event)
        if (events.length >= 1) break
      }
    })()

    await sleep.ms(50)
    await conn.call("/symbol/create", { data: { slug: "sse-symbol", trait: {} } })
    await reader

    specimen.expect(events[0].op).toBe("create")
    specimen.expect(events[0].entity.slug).toBe("sse-symbol")
    controller.abort()
  })
})

specimen.describe("RemoteRepository over HTTP", () => {
  specimen.it("CRUD through RemoteRepository", async () => {
    const repo = new RemoteRepository()
    repo.connect(conn.branch("/literal"))

    const created = await repo.create({ slug: "remote-net", trait: {} })
    specimen.expect(created.slug).toBe("remote-net")
    specimen.expect(repo.$entities.get()).toContain(created)

    const found = await repo.find({ slug: "remote-net" })
    specimen.expect(found.length).toBeGreaterThan(0)

    const updated = await repo.updateOne({ id: created.id }, { trait: { R: 1 } })
    specimen.expect(updated).toBe(created)
    specimen.expect(updated.trait.R).toBe(1)

    await repo.removeOne({ id: created.id })
    specimen.expect(repo.$entities.get()).not.toContain(created)
  })

  specimen.it("subscribe drives store updates", async () => {
    const repo = new RemoteRepository()
    repo.connect(conn.branch("/literal"))

    const unsub = repo.subscribe()
    await sleep.ms(50)

    await conn.call("/literal/create", { data: { slug: "sub-driven", trait: {} } })
    await sleep.ms(200)

    const store = repo.$entities.get()
    const found = store.find(e => e.slug === "sub-driven")
    specimen.expect(found).toBeDefined()

    unsub()
  })
})
