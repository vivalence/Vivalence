import {
  specimen, Aperture, Vector, Connection, Url,
  shard, shape,
} from "@vivalence/typology"
import { datamap } from "@vivalence/runtime/scenarios"

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
  specimen.it("a batch dispatches many calls and returns ordered results", async () => {
    const mixed = await conn.call("/batch", [
      { path: "/manifest" },
      { path: "/cargo" },
      { path: "/datamap" },
    ])
    specimen.expect(mixed).toHaveLength(3)
    specimen.expect(mixed[0].path).toBe("/manifest")
    specimen.expect(mixed[0].status).toBe(200)
    specimen.expect(mixed[0].body.slug).toBe("test")
    specimen.expect(mixed[1].body.assets).toBe(true)
    specimen.expect(mixed[2].body.literal).toBeDefined()

    const crud = await conn.call("/batch", [
      { path: "/literal/find", body: { where: { slug: "hello" } } },
      { path: "/literal/find", body: { where: { slug: "goodbye" } } },
      { path: "/symbol/find", body: { where: { slug: "greeting" } } },
    ])
    specimen.expect(crud).toHaveLength(3)
    specimen.expect(crud[0].body.length).toBe(1)
    specimen.expect(crud[0].body[0].slug).toBe("hello")
    specimen.expect(crud[1].body[0].slug).toBe("goodbye")
    specimen.expect(crud[2].body[0].slug).toBe("greeting")
  })

  specimen.it("a batch isolates failures and preserves per-call status", async () => {
    const withMiss = await conn.call("/batch", [
      { path: "/manifest" },
      { path: "/nonexistent/route" },
      { path: "/cargo" },
    ])
    specimen.expect(withMiss).toHaveLength(3)
    specimen.expect(withMiss[0].status).toBe(200)
    specimen.expect(withMiss[1].status).toBe(404)
    specimen.expect(withMiss[2].status).toBe(200)

    specimen.expect(await conn.call("/batch", [])).toHaveLength(0)

    const statuses = await conn.call("/batch", [
      { path: "/literal/updateOne", body: { where: { id: "00000000-0000-0000-0000-000000000000" }, data: {} } },
      { path: "/manifest" },
    ])
    specimen.expect(statuses[0].status).not.toBe(200)
    specimen.expect(statuses[1].status).toBe(200)

    await conn.call("/thread/create", {
      data: { mode: scenario.fixtures.mode.id, trait: {}, cursor: 0, counter: 0 },
    })
    const scoped = await conn.call("/batch", [
      { path: "/thread/find", body: { where: {} } },
      { path: "/manifest" },
    ])
    specimen.expect(scoped[0].status).toBe(200)
    const userId = scenario.fixtures.user.id
    for (const thread of scoped[0].body) {
      const threadUser = typeof thread.user === "object" ? thread.user.id : thread.user
      specimen.expect(threadUser).toBe(userId)
    }
  })
})

specimen.describe("shard.connection.batch", () => {
  const openBatchConnection = () => {
    const aperture = new Aperture()
    aperture.branch("/literal").slurp(shard.datamap.repository(scenario.repos.literal))
    aperture.branch("/symbol").slurp(shard.datamap.repository(scenario.repos.symbol))
    aperture.open("/manifest", () => ({ slug: "test", version: "0.0.1" }))
    aperture.open("/cargo", () => ({ assets: true }))
    aperture.open("/datamap", () => shard.datamap.strip(scenario.orm.getMetadata()))
    aperture.open("/batch", shard.batch.route(aperture))

    const connection = new Connection(
      new Url("http://test"),
      shard.transmitter.inline(shape.http(aperture)),
    )
    connection.use(shard.connection.batch())
    return connection
  }

  specimen.it("concurrent calls in one tick batch into a single request, and single calls pass through", async () => {
    const batchConn = openBatchConnection()

    const [manifest, cargo, schema] = await Promise.all([
      batchConn.call("/manifest"),
      batchConn.call("/cargo"),
      batchConn.call("/datamap"),
    ])
    specimen.expect(manifest.slug).toBe("test")
    specimen.expect(cargo.assets).toBe(true)
    specimen.expect(schema.literal).toBeDefined()

    const single = await batchConn.call("/manifest")
    specimen.expect(single.slug).toBe("test")

    const first = await batchConn.call("/manifest")
    const second = await batchConn.call("/cargo")
    specimen.expect(first.slug).toBe("test")
    specimen.expect(second.assets).toBe(true)
  })

  specimen.it("an error in one sub-call rejects only that caller", async () => {
    const batchConn = openBatchConnection()

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
})
