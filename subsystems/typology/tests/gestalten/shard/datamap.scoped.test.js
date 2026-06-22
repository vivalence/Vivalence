import {
  specimen, sleep, Aperture, Vector, Connection, Url,
  shard, shape,
} from "@vivalence/typology"
import { datamap } from "@vivalence/typology/scenarios"
import { BufferEntity, ThreadEntity } from "@vivalence/typology/entities"

// Reproduces the LIVE buffer wire: a user-scoped entity whose broadcast owner is
// stamped from ambient context (resolution.js:6 mounts ambient.store at the daemon
// root; userspace.js mounts reactive(buffer, { scope: user })). The literal tests
// cover only UNSCOPED broadcast — this exercises the scoped path that buffer/turn
// actually use, over create + updateOne + emitter-style raw-mutate+flush.

const PORT = 9889
let scenario, server, conn, thread, buffer

specimen.beforeAll(async () => {
  scenario = await datamap.seed()
  const { repos, fixtures, em } = scenario

  thread = em.create(ThreadEntity, { user: fixtures.user.id, mode: fixtures.mode.id, traits: [] })
  await em.flush()
  buffer = em.create(BufferEntity, {
    thread: thread.id, mode: fixtures.mode.id, index: 0, data: { label: "probe", bumped: 0 },
  })
  await em.flush()

  // Buffer/Thread carry a default MikroORM filter `user` (cond: thread.user = args.user).
  // Production satisfies it per-request via resolution.js:7 datamap.shard.bind("user", …).
  // Single global em here → set the param once so repo.find/updateOne don't 500.
  em.setFilterParams("user", { user: fixtures.user.id })

  const twitch = new Vector()
  const aperture = new Aperture()

  // faithful to production: attach user -> ambient.store (stamps owner) -> scope -> repo + reactive(scope)
  aperture
    .branch("/buffer")
    .use(shard.context.attach("user", fixtures.user))
    .use(shard.ambient.store((ctx) => ({ user: ctx.user })))
    .use(shard.datamap.scope((ctx) => ({ thread: { user: ctx.user.id } })))
    .slurp(shard.datamap.repository(repos.buffer))
    .slurp(shard.datamap.reactive(repos.buffer, twitch, { scope: (ctx) => ({ user: ctx.user.id }) }))
    // emitter-style write: raw findOne + reassign data + flush (what /spawned/bump does)
    .post("/bump", async (input) => {
      const target = await repos.buffer.findOne(input.id)
      target.data = { ...target.data, bumped: (target.data?.bumped ?? 0) + 1 }
      await repos.buffer.getEntityManager().flush()
      return target
    })

  // control: identical EXCEPT no ambient.store -> owner never stamped -> must be dropped
  aperture
    .branch("/buffer-noambient")
    .use(shard.context.attach("user", fixtures.user))
    .use(shard.datamap.scope((ctx) => ({ thread: { user: ctx.user.id } })))
    .slurp(shard.datamap.repository(repos.buffer))
    .slurp(shard.datamap.reactive(repos.buffer, twitch, { scope: (ctx) => ({ user: ctx.user.id }) }))

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

specimen.describe("shard.datamap.reactive — scoped broadcast", () => {
  specimen.it("scoped subscribe receives update via /updateOne", async () => {
    const events = []
    const controller = new AbortController()
    const reader = (async () => {
      try { for await (const event of conn.stream("/buffer/subscribe", controller.signal)) {
        events.push(event)
        if (events.length >= 1) break
      } } catch (_) {}
    })()

    await sleep.ms(50)
    await conn.call("/buffer/updateOne", { where: { id: buffer.id }, data: { data: { label: "probe", bumped: 1 } } })
    await reader

    specimen.expect(events.length).toBe(1)
    specimen.expect(events[0].op).toBe("update")
    specimen.expect(events[0].entity.data.bumped).toBe(1)
    controller.abort()
  })

  specimen.it("scoped subscribe receives update via emitter-style raw mutate + flush", async () => {
    const events = []
    const controller = new AbortController()
    const reader = (async () => {
      try { for await (const event of conn.stream("/buffer/subscribe", controller.signal)) {
        events.push(event)
        if (events.length >= 1) break
      } } catch (_) {}
    })()

    await sleep.ms(50)
    await conn.call("/buffer/bump", { id: buffer.id })
    await reader

    specimen.expect(events.length).toBe(1)
    specimen.expect(events[0].op).toBe("update")
    controller.abort()
  })

  specimen.it("scoped broadcast is DROPPED when no ambient owner is present", async () => {
    // The reactive twitch handler runs in-process on flush; with no ambient owner it
    // warns + skips the push. Assert via that warn (an infinite /subscribe reader can't
    // be unblocked by abort in this Deno, so we don't open one here).
    const warnings = []
    const original = console.warn
    console.warn = (...args) => warnings.push(args.join(" "))
    try {
      await conn.call("/buffer-noambient/updateOne", {
        where: { id: buffer.id }, data: { data: { label: "probe", bumped: 99 } },
      })
      await sleep.ms(50)
    } finally {
      console.warn = original
    }
    specimen.expect(warnings.some((w) => w.includes("without an owner"))).toBe(true)
  })
})
