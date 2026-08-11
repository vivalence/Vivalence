import {
  specimen, sleep, Aperture, Vector, Connection, Url,
  shard, shape,
} from "@vivalence/typology"
import { datamap } from "@vivalence/runtime/scenarios"

const PORT = 9889
let scenario, server, conn

specimen.beforeAll(async () => {
  scenario = await datamap.seed()
  const { repos, fixtures } = scenario

  const aperture = new Aperture()

  aperture.branch("/literal").slurp(shard.datamap.repository(repos.literal))
  aperture.branch("/symbol").slurp(shard.datamap.repository(repos.symbol))
  aperture.branch("/mode").slurp(shard.datamap.repository(repos.mode))

  scenario.orm.em.setFilterParams("user", { user: fixtures.user.id })

  aperture
    .branch("/thread")
    .use(shard.context.attach("user", fixtures.user))
    .use(shard.datamap.scope((ctx) => ({ user: ctx.user.id })))
    .slurp(shard.datamap.repository(repos.thread))

  aperture.open("/manifest", () => ({ slug: "test", version: "0.0.1" }))
  aperture.open("/cargo", () => ({ assets: true }))
  aperture.open("/datamap", () => shard.datamap.strip(scenario.orm.getMetadata()))
  aperture.open("/batch", shard.batch.route(aperture))

  const handler = shard.cors.wrap(shape.http(aperture))
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

specimen.describe("batch over HTTP", () => {
  specimen.it("single batch replaces N individual requests", async () => {
    const results = await conn.call("/batch", [
      { path: "/manifest" },
      { path: "/cargo" },
      { path: "/datamap" },
    ])
    specimen.expect(results).toHaveLength(3)
    specimen.expect(results[0].body.slug).toBe("test")
    specimen.expect(results[1].body.assets).toBe(true)
    specimen.expect(results[2].body.literal).toBeDefined()
  })

  specimen.it("CRUD through batch", async () => {
    const results = await conn.call("/batch", [
      { path: "/literal/find", body: { where: { slug: "hello" } } },
      { path: "/symbol/find", body: { where: { slug: "greeting" } } },
    ])
    specimen.expect(results[0].body[0].slug).toBe("hello")
    specimen.expect(results[1].body[0].slug).toBe("greeting")
  })

  specimen.it("mixed success/404 results", async () => {
    const results = await conn.call("/batch", [
      { path: "/manifest" },
      { path: "/does-not-exist" },
      { path: "/cargo" },
    ])
    specimen.expect(results[0].status).toBe(200)
    specimen.expect(results[1].status).toBe(404)
    specimen.expect(results[2].status).toBe(200)
  })

  specimen.it("middleware branches work through batch", async () => {
    await conn.call("/thread/create", {
      data: { mode: scenario.fixtures.mode.id, trait: {}, cursor: 0, counter: 0 },
    })

    const results = await conn.call("/batch", [
      { path: "/thread/find", body: { where: {} } },
    ])
    specimen.expect(results[0].status).toBe(200)
    const threads = results[0].body
    const userId = scenario.fixtures.user.id
    for (const t of threads) {
      const tu = typeof t.user === "object" ? t.user.id : t.user
      specimen.expect(tu).toBe(userId)
    }
  })
})

specimen.describe("connection.batch over HTTP", () => {
  let batchConn

  specimen.beforeAll(() => {
    batchConn = new Connection(new Url(`http://localhost:${PORT}`))
    batchConn.use(shard.connection.batch())
  })

  specimen.it("concurrent calls batched into one HTTP request", async () => {
    const [manifest, cargo, schema] = await Promise.all([
      batchConn.call("/manifest"),
      batchConn.call("/cargo"),
      batchConn.call("/datamap"),
    ])
    specimen.expect(manifest.slug).toBe("test")
    specimen.expect(cargo.assets).toBe(true)
    specimen.expect(schema.literal).toBeDefined()
  })

  specimen.it("single call passes through without batching", async () => {
    const result = await batchConn.call("/manifest")
    specimen.expect(result.slug).toBe("test")
  })

  specimen.it("error in one sub-call rejects only that caller", async () => {
    const results = await Promise.allSettled([
      batchConn.call("/manifest"),
      batchConn.call("/nonexistent"),
      batchConn.call("/cargo"),
    ])
    specimen.expect(results[0].status).toBe("fulfilled")
    specimen.expect(results[1].status).toBe("rejected")
    specimen.expect(results[2].status).toBe("fulfilled")
  })
})
