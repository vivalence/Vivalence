import {
  specimen, Aperture, Vector, Connection, Url,
  shard, shape,
} from "@vivalence/typology"
import { datamap } from "@vivalence/typology/scenarios"

let scenario, conn

specimen.beforeAll(async () => {
  scenario = await datamap.seed()
  scenario.em.setFilterParams("user", { user: scenario.fixtures.user.id })
  const { repos, fixtures } = scenario

  const aperture = new Aperture()

  aperture.branch("/literal").slurp(shard.datamap.repository(repos.literal))
  aperture.branch("/symbol").slurp(shard.datamap.repository(repos.symbol))
  aperture.branch("/mode").slurp(shard.datamap.repository(repos.mode))

  aperture
    .branch("/thread")
    .use(shard.context.attach("user", fixtures.user))
    .use(shard.datamap.scope((ctx) => ({ user: ctx.user.id })))
    .slurp(shard.datamap.repository(repos.thread))

  aperture.open("/manifest", () => ({ slug: "test", version: "0.0.1" }))
  aperture.open("/cargo", () => ({ assets: true }))
  aperture.open("/datamap", () => shard.datamap.strip(scenario.orm.getMetadata()))

  aperture.open("/batch", shard.batch.route(aperture))

  const handler = shape.http(aperture)
  conn = new Connection(
    new Url("http://test"),
    shard.transmitter.inline(handler),
  )
})

specimen.afterAll(async () => {
  await scenario.orm.close()
})

specimen.describe("shard.batch.route", () => {
  specimen.it("dispatches multiple calls, returns ordered results", async () => {
    const results = await conn.call("/batch", [
      { path: "/manifest" },
      { path: "/cargo" },
      { path: "/datamap" },
    ])
    specimen.expect(results).toHaveLength(3)
    specimen.expect(results[0].path).toBe("/manifest")
    specimen.expect(results[0].status).toBe(200)
    specimen.expect(results[0].body.slug).toBe("test")
    specimen.expect(results[1].body.assets).toBe(true)
    specimen.expect(results[2].body.literal).toBeDefined()
  })

  specimen.it("batch CRUD operations", async () => {
    const results = await conn.call("/batch", [
      { path: "/literal/find", body: { where: { slug: "hello" } } },
      { path: "/literal/find", body: { where: { slug: "goodbye" } } },
      { path: "/symbol/find", body: { where: { slug: "greeting" } } },
    ])
    specimen.expect(results).toHaveLength(3)
    specimen.expect(results[0].body.length).toBe(1)
    specimen.expect(results[0].body[0].slug).toBe("hello")
    specimen.expect(results[1].body[0].slug).toBe("goodbye")
    specimen.expect(results[2].body[0].slug).toBe("greeting")
  })

  specimen.it("404 in one call doesn't fail the batch", async () => {
    const results = await conn.call("/batch", [
      { path: "/manifest" },
      { path: "/nonexistent/route" },
      { path: "/cargo" },
    ])
    specimen.expect(results).toHaveLength(3)
    specimen.expect(results[0].status).toBe(200)
    specimen.expect(results[1].status).toBe(404)
    specimen.expect(results[2].status).toBe(200)
  })

  specimen.it("empty array returns empty array", async () => {
    const results = await conn.call("/batch", [])
    specimen.expect(results).toHaveLength(0)
  })

  specimen.it("works with middleware-carrying branches (scope, context.attach)", async () => {
    const created = await conn.call("/thread/create", {
      data: { mode: scenario.fixtures.mode.id, trait: {}, cursor: 0, counter: 0 },
    })

    const results = await conn.call("/batch", [
      { path: "/thread/find", body: { where: {} } },
      { path: "/manifest" },
    ])
    specimen.expect(results[0].status).toBe(200)
    const threads = results[0].body
    const userId = scenario.fixtures.user.id
    for (const t of threads) {
      const tu = typeof t.user === "object" ? t.user.id : t.user
      specimen.expect(tu).toBe(userId)
    }
  })

  specimen.it("preserves status codes per sub-call", async () => {
    const results = await conn.call("/batch", [
      { path: "/literal/updateOne", body: { where: { id: "00000000-0000-0000-0000-000000000000" }, data: {} } },
      { path: "/manifest" },
    ])
    specimen.expect(results[0].status).not.toBe(200)
    specimen.expect(results[1].status).toBe(200)
  })
})

specimen.describe("shard.connection.batch", () => {
  let batchConn

  specimen.beforeAll(() => {
    const aperture = new Aperture()

    aperture.branch("/literal").slurp(shard.datamap.repository(scenario.repos.literal))
    aperture.branch("/symbol").slurp(shard.datamap.repository(scenario.repos.symbol))
    aperture.open("/manifest", () => ({ slug: "test", version: "0.0.1" }))
    aperture.open("/cargo", () => ({ assets: true }))
    aperture.open("/datamap", () => shard.datamap.strip(scenario.orm.getMetadata()))
    aperture.open("/batch", shard.batch.route(aperture))

    const handler = shape.http(aperture)
    batchConn = new Connection(
      new Url("http://test"),
      shard.transmitter.inline(handler),
    )
    batchConn.use(shard.connection.batch())
  })

  specimen.it("concurrent calls in same tick are batched into one request", async () => {
    const [manifest, cargo, schema] = await Promise.all([
      batchConn.call("/manifest"),
      batchConn.call("/cargo"),
      batchConn.call("/datamap"),
    ])

    specimen.expect(manifest.slug).toBe("test")
    specimen.expect(cargo.assets).toBe(true)
    specimen.expect(schema.literal).toBeDefined()
  })

  specimen.it("single call still works (passthrough, no batch)", async () => {
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
    specimen.expect(results[0].value.slug).toBe("test")
    specimen.expect(results[1].status).toBe("rejected")
    specimen.expect(results[2].status).toBe("fulfilled")
    specimen.expect(results[2].value.assets).toBe(true)
  })

  specimen.it("calls in different ticks are separate batches", async () => {
    const first = await batchConn.call("/manifest")
    const second = await batchConn.call("/cargo")

    specimen.expect(first.slug).toBe("test")
    specimen.expect(second.assets).toBe(true)
  })
})
