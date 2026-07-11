import {
  specimen, sleep, Aperture, Vector, Connection, Url,
  shard, shape,
} from "@vivalence/typology"
import { datamap } from "@vivalence/typology/scenarios"
import { BufferEntity, ThreadEntity } from "@vivalence/typology/entities"
import { RequestContext } from "@mikro-orm/core"

// Reproduces the LIVE buffer wire: a user-scoped entity whose broadcast owner is read off the
// ORM request context (the `user` filter param that also scopes find; resolution.js binds it
// per-request, `carry` re-enters it for a lazy stream). No ambient, no denormalized column. The
// literal tests cover only UNSCOPED broadcast — this exercises the scoped path that buffer/turn
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

  // Buffer carries a default MikroORM filter `user` (cond: thread.user = args.user).
  // Production satisfies it per-request via resolution.js datamap.shard.bind("user", …).
  // Single global em here → set the param once so repo.find/updateOne don't 500 AND so the
  // reactive can read the owner back off the ORM context on broadcast.
  em.setFilterParams("user", { user: fixtures.user.id })

  const twitch = new Vector()
  const aperture = new Aperture()

  // no ambient — the reactive reads the owner off the ORM context (the `user` filter param).
  // attach user -> scope (for repo find) -> repo + reactive(scope for subscribe).
  aperture
    .branch("/buffer")
    .use(shard.context.attach("user", fixtures.user))
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

  scenario.em.getEventManager().registerSubscriber(shape.subscriber(twitch))

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

  specimen.it("reactive THROWS when the ORM context carries no owner — never silently drops", async () => {
    // The owner rides the `user` filter param on the request context. A write whose context has
    // no owner (it escaped the request scope without `carry`) must fail loud, never drop. Fire the
    // twitch inside a FRESH context that never bound `user` — the reactive can't resolve the owner.
    const twitchBare = new Vector()
    shard.datamap.reactive(scenario.repos.buffer, twitchBare, { scope: (ctx) => ({ user: ctx.user.id }) })
    const subscriber = shape.subscriber(twitchBare)

    let threw = null
    await RequestContext.create(scenario.orm.em, async () => {
      RequestContext.getEntityManager().setFilterParams("user", undefined) // owner absent on this context
      try {
        await subscriber.afterCreate({
          entity: { toJSON: () => ({ id: "bare", data: {} }) },
          meta: { className: "BufferEntity" },
        })
      } catch (error) {
        threw = error
      }
    })
    specimen.expect(threw).not.toBe(null)
    specimen.expect(String(threw?.message)).toContain("carries no owner")
  })
})
