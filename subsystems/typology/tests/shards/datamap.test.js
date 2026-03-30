import {
  specimen, Aperture, Vector, Connection, Url,
  shard, shape, RemoteRepository,
} from "@vivalence/typology"
import { datamap } from "@vivalence/typology/scenarios"

let scenario, conn, twitch

specimen.beforeAll(async () => {
  scenario = await datamap.seed()
  const { repos, fixtures } = scenario

  twitch = new Vector()
  const aperture = new Aperture()

  aperture.branch("/literal")
    .slurp(shard.datamap.repository(repos.literal))
    .slurp(shard.datamap.reactive(repos.literal, twitch))
    .slurp(shard.datamap.ingest(repos.literal))

  aperture.branch("/symbol").slurp(shard.datamap.repository(repos.symbol))
  aperture.branch("/mode").slurp(shard.datamap.repository(repos.mode))
  aperture.branch("/intent").slurp(shard.datamap.repository(repos.intent))

  aperture
    .branch("/thread")
    .use(shard.context.attach("user", fixtures.user))
    .use(shard.datamap.scope((ctx) => ({ user: ctx.user.id })))
    .slurp(shard.datamap.repository(repos.thread))

  const sub = shape.subscriber(twitch)
  scenario.em.getEventManager().registerSubscriber(sub)

  const handler = shape.http(aperture)
  conn = new Connection(
    new Url("http://test"),
    shard.transmitter.inline(handler),
  )
})

specimen.afterAll(async () => {
  await scenario.orm.close()
})

specimen.describe("shard.datamap.repository", () => {
  specimen.it("create", async () => {
    const result = await conn.call("/literal/create", { data: { slug: "created", trait: {} } })
    specimen.expect(result.id).toBeDefined()
    specimen.expect(result.slug).toBe("created")
  })

  specimen.it("find", async () => {
    const results = await conn.call("/literal/find", { where: { slug: "hello" } })
    specimen.expect(results.length).toBe(1)
    specimen.expect(results[0].slug).toBe("hello")
  })

  specimen.it("findOne", async () => {
    const result = await conn.call("/literal/findOne", { where: { slug: "hello" } })
    specimen.expect(result.slug).toBe("hello")
  })

  specimen.it("findOne null", async () => {
    const result = await conn.call("/literal/findOne", { where: { slug: "nope" } })
    specimen.expect(result).toBeNull()
  })

  specimen.it("findAndCount", async () => {
    const [entities, count] = await conn.call("/literal/findAndCount", { where: {} })
    specimen.expect(count).toBeGreaterThan(0)
    specimen.expect(entities.length).toBe(count)
  })

  specimen.it("count", async () => {
    const count = await conn.call("/literal/count", { where: {} })
    specimen.expect(typeof count).toBe("number")
  })

  specimen.it("update", async () => {
    const created = await conn.call("/literal/create", { data: { slug: "mutable", trait: {} } })
    const updated = await conn.call("/literal/updateOne", {
      where: { id: created.id }, data: { trait: { TAGGED: true } },
    })
    specimen.expect(updated.trait.TAGGED).toBe(true)
  })

  specimen.it("remove", async () => {
    const created = await conn.call("/literal/create", { data: { slug: "ephemeral", trait: {} } })
    const result = await conn.call("/literal/removeOne", { where: { id: created.id } })
    specimen.expect(result.ok).toBe(true)
    const gone = await scenario.repos.literal.findOne({ slug: "ephemeral" })
    specimen.expect(gone).toBeNull()
  })

  specimen.it("ensure creates then merges", async () => {
    const first = await conn.call("/mode/ensure", {
      data: { slug: "ensured", type: "test", traits: [], installed: false },
    })
    specimen.expect(first.slug).toBe("ensured")

    const second = await conn.call("/mode/ensure", {
      data: { slug: "ensured", type: "test", traits: ["BUFFERED"], installed: true },
    })
    specimen.expect(second.id).toBe(first.id)
    specimen.expect(second.traits).toContain("BUFFERED")
  })

  specimen.it("populate passes through", async () => {
    const results = await conn.call("/literal/find", {
      where: { slug: "hello" }, options: { populate: ["symbols"] },
    })
    specimen.expect(results[0].symbols.length).toBeGreaterThan(0)
  })

  specimen.it("strips unsafe options", async () => {
    const results = await conn.call("/literal/find", {
      where: {}, options: { lockMode: 4 },
    })
    specimen.expect(results.length).toBeGreaterThan(0)
  })
})

specimen.describe("shard.datamap.scope", () => {
  specimen.it("injects into create", async () => {
    const thread = await conn.call("/thread/create", {
      data: { mode: scenario.fixtures.mode.id, trait: {}, cursor: 0, counter: 0 },
    })
    const userId = scenario.fixtures.user.id
    const threadUser = typeof thread.user === "object" ? thread.user.id : thread.user
    specimen.expect(threadUser).toBe(userId)
  })

  specimen.it("filters find", async () => {
    const threads = await conn.call("/thread/find", { where: {} })
    const userId = scenario.fixtures.user.id
    for (const s of threads) {
      const su = typeof s.user === "object" ? s.user.id : s.user
      specimen.expect(su).toBe(userId)
    }
  })
})

specimen.describe("shard.datamap.errors", () => {
  specimen.it("404 on update not found", async () => {
    const res = await conn.fetch("/literal/updateOne", {
      where: { id: "00000000-0000-0000-0000-000000000000" }, data: {},
    })
    specimen.expect(res.status).toBe(404)
    specimen.expect(res.body.code).toBe("NOT_FOUND")
  })

  specimen.it("404 on remove not found", async () => {
    const res = await conn.fetch("/literal/removeOne", {
      where: { id: "00000000-0000-0000-0000-000000000000" },
    })
    specimen.expect(res.status).toBe(404)
    specimen.expect(res.body.code).toBe("NOT_FOUND")
  })
})

specimen.describe("shard.datamap.reactive", () => {
  specimen.it("twitch effects fire on entity events", async () => {
    const events = []
    twitch.open("/literal/create/after", (ctx) => {
      events.push({ custom: true, slug: ctx.input.entity?.slug })
    })

    await conn.call("/literal/create", { data: { slug: "twitch-fire", trait: {} } })

    specimen.expect(events.length).toBe(1)
    specimen.expect(events[0].custom).toBe(true)
    specimen.expect(events[0].slug).toBe("twitch-fire")
  })
})

specimen.describe("shard.datamap.ingest", () => {
  let handler

  specimen.beforeAll(() => {
    const aperture = new Aperture()
    aperture.branch("/literal").slurp(shard.datamap.ingest(scenario.repos.literal))
    handler = shape.http(aperture)
  })

  specimen.it("creates from SSE stream", async () => {
    const encoder = new TextEncoder()
    const body = new ReadableStream({
      start(controller) {
        controller.enqueue(encoder.encode('data: {"op":"create","data":{"slug":"ingested","trait":{}}}\n\n'))
        controller.close()
      },
    })
    const req = new Request("http://test/literal/ingest", {
      method: "POST",
      headers: { "content-type": "text/event-stream" },
      body,
    })
    const res = await handler(req)
    const result = await res.json()
    specimen.expect(result.length).toBe(1)
    specimen.expect(result[0].slug).toBe("ingested")
  })

  specimen.it("updates from SSE stream", async () => {
    const created = await conn.call("/literal/create", { data: { slug: "ingest-update", trait: {} } })
    const encoder = new TextEncoder()
    const body = new ReadableStream({
      start(controller) {
        const event = { op: "update", where: { id: created.id }, data: { trait: { INGESTED: true } } }
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`))
        controller.close()
      },
    })
    const req = new Request("http://test/literal/ingest", {
      method: "POST",
      headers: { "content-type": "text/event-stream" },
      body,
    })
    const res = await handler(req)
    const result = await res.json()
    specimen.expect(result.length).toBe(1)
    specimen.expect(result[0].trait.INGESTED).toBe(true)
  })

  specimen.it("deletes from SSE stream", async () => {
    const created = await conn.call("/literal/create", { data: { slug: "ingest-delete", trait: {} } })
    const encoder = new TextEncoder()
    const body = new ReadableStream({
      start(controller) {
        const event = { op: "delete", where: { id: created.id } }
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`))
        controller.close()
      },
    })
    const req = new Request("http://test/literal/ingest", {
      method: "POST",
      headers: { "content-type": "text/event-stream" },
      body,
    })
    const res = await handler(req)
    const result = await res.json()
    specimen.expect(result.length).toBe(1)
    specimen.expect(result[0].ok).toBe(true)
    const gone = await scenario.repos.literal.findOne({ slug: "ingest-delete" })
    specimen.expect(gone).toBeNull()
  })

  specimen.it("handles multiple events in one stream", async () => {
    const encoder = new TextEncoder()
    const body = new ReadableStream({
      start(controller) {
        controller.enqueue(encoder.encode('data: {"op":"create","data":{"slug":"batch-a","trait":{}}}\n\n'))
        controller.enqueue(encoder.encode('data: {"op":"create","data":{"slug":"batch-b","trait":{}}}\n\n'))
        controller.close()
      },
    })
    const req = new Request("http://test/literal/ingest", {
      method: "POST",
      headers: { "content-type": "text/event-stream" },
      body,
    })
    const res = await handler(req)
    const result = await res.json()
    specimen.expect(result.length).toBe(2)
    specimen.expect(result[0].slug).toBe("batch-a")
    specimen.expect(result[1].slug).toBe("batch-b")
  })
})

specimen.describe("shard.datamap.strip", () => {
  specimen.it("produces normalized entity names", () => {
    const schema = shard.datamap.strip(scenario.orm.getMetadata())
    specimen.expect(schema.literal).toBeDefined()
    specimen.expect(schema.symbol).toBeDefined()
    specimen.expect(schema.mode).toBeDefined()
    specimen.expect(schema.intent).toBeDefined()
    specimen.expect(schema.thread).toBeDefined()
  })

  specimen.it("skips pivot tables", () => {
    const schema = shard.datamap.strip(scenario.orm.getMetadata())
    for (const name of Object.keys(schema)) {
      specimen.expect(name).not.toContain("_")
    }
  })

  specimen.it("captures m:n relations", () => {
    const schema = shard.datamap.strip(scenario.orm.getMetadata())
    specimen.expect(schema.literal.properties.symbols.kind).toBe("m:n")
    specimen.expect(schema.literal.properties.symbols.target).toBe("symbol")
  })

  specimen.it("captures m:1 relations", () => {
    const schema = shard.datamap.strip(scenario.orm.getMetadata())
    specimen.expect(schema.intent.properties.mode.kind).toBe("m:1")
    specimen.expect(schema.intent.properties.mode.target).toBe("mode")
  })

  specimen.it("captures 1:m relations", () => {
    const schema = shard.datamap.strip(scenario.orm.getMetadata())
    specimen.expect(schema.mode.properties.intents.kind).toBe("1:m")
    specimen.expect(schema.mode.properties.intents.target).toBe("intent")
  })

  specimen.it("only includes relation properties", () => {
    const schema = shard.datamap.strip(scenario.orm.getMetadata())
    for (const [name, meta] of Object.entries(schema)) {
      for (const [prop, rel] of Object.entries(meta.properties)) {
        specimen.expect(["m:1", "1:m", "m:n"]).toContain(rel.kind)
      }
    }
  })
})

specimen.describe("shard.datamap.wire", () => {
  specimen.it("wires _stores between repos", () => {
    const literal = new RemoteRepository()
    const symbol = new RemoteRepository()
    const schema = {
      literal: { properties: { symbols: { kind: "m:n", target: "symbol" } } },
      symbol: { properties: { literals: { kind: "m:n", target: "literal" } } },
    }
    shard.datamap.wire({ literal, symbol }, schema)
    specimen.expect(literal._schema._stores.symbol).toBe(symbol)
    specimen.expect(symbol._schema._stores.literal).toBe(literal)
  })

  specimen.it("handles self-referential relations", () => {
    const buffer = new RemoteRepository()
    const schema = {
      buffer: { properties: {
        parent: { kind: "m:1", target: "buffer" },
        children: { kind: "1:m", target: "buffer" },
      } },
    }
    shard.datamap.wire({ buffer }, schema)
    specimen.expect(buffer._schema._stores.buffer).toBe(buffer)
  })

  specimen.it("skips missing targets", () => {
    const literal = new RemoteRepository()
    const schema = {
      literal: { properties: { symbols: { kind: "m:n", target: "symbol" } } },
    }
    shard.datamap.wire({ literal }, schema)
    specimen.expect(literal._schema._stores.symbol).toBeUndefined()
  })

  specimen.it("hydrates cross-repo relations through wired stores", async () => {
    const literal = new RemoteRepository()
    const symbol = new RemoteRepository()

    literal.connect(conn.branch("/literal"))
    symbol.connect(conn.branch("/symbol"))

    const schema = shard.datamap.strip(scenario.orm.getMetadata())
    shard.datamap.wire({ literal, symbol }, schema)

    await symbol.find()
    const literals = await literal.find({}, { populate: ["symbols"] })

    const fromStore = symbol.$entities.get()[0]
    specimen.expect(literals[0].symbols[0]).toBe(fromStore)
  })

  specimen.it("prototypes wrap entities through wired hydration", async () => {
    class TestMode {
      constructor(raw) { Object.assign(this, raw) }
      implements(t) { return this.traits?.includes(t) }
    }
    const modeRepo = new RemoteRepository(TestMode)
    modeRepo.connect(conn.branch("/mode"))

    const schema = shard.datamap.strip(scenario.orm.getMetadata())
    shard.datamap.wire({ mode: modeRepo }, schema)

    const modes = await modeRepo.find()
    specimen.expect(modes[0]).toBeInstanceOf(TestMode)
    specimen.expect(modes[0].implements("BUFFERED")).toBe(true)
  })
})
