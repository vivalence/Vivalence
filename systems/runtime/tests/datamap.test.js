import {
  specimen, Aperture, Vector, Connection, Url,
  shard, shape, RemoteRepository, RemoteEntityManager,
} from "@vivalence/typology"
import { datamap } from "@vivalence/runtime/scenarios"

let scenario, conn, twitch

specimen.beforeAll(async () => {
  scenario = await datamap.seed()
  scenario.em.setFilterParams("user", { user: scenario.fixtures.user.id })
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
  specimen.it("a repository creates, reads, counts, and finds one", async () => {
    const created = await conn.call("/literal/create", { data: { slug: "created", trait: {} } })
    specimen.expect(created.id).toBeDefined()
    specimen.expect(created.slug).toBe("created")

    const found = await conn.call("/literal/find", { where: { slug: "hello" } })
    specimen.expect(found.length).toBe(1)
    specimen.expect(found[0].slug).toBe("hello")

    const one = await conn.call("/literal/findOne", { where: { slug: "hello" } })
    specimen.expect(one.slug).toBe("hello")
    const none = await conn.call("/literal/findOne", { where: { slug: "nope" } })
    specimen.expect(none).toBeNull()

    const [entities, count] = await conn.call("/literal/findAndCount", { where: {} })
    specimen.expect(count).toBeGreaterThan(0)
    specimen.expect(entities.length).toBe(count)
    specimen.expect(typeof await conn.call("/literal/count", { where: {} })).toBe("number")
  })

  specimen.it("a repository updates, removes, and ensures", async () => {
    const mutable = await conn.call("/literal/create", { data: { slug: "mutable", trait: {} } })
    const updated = await conn.call("/literal/updateOne", {
      where: { id: mutable.id }, data: { trait: { TAGGED: true } },
    })
    specimen.expect(updated.trait.TAGGED).toBe(true)

    const ephemeral = await conn.call("/literal/create", { data: { slug: "ephemeral", trait: {} } })
    const removed = await conn.call("/literal/removeOne", { where: { id: ephemeral.id } })
    specimen.expect(removed.ok).toBe(true)
    specimen.expect(await scenario.repos.literal.findOne({ slug: "ephemeral" })).toBeNull()

    const first = await conn.call("/mode/ensure", {
      data: { slug: "ensured", type: "test", traits: [], installed: "" },
    })
    specimen.expect(first.slug).toBe("ensured")
    const second = await conn.call("/mode/ensure", {
      data: { slug: "ensured", type: "test", traits: ["APPLICATION"], installed: "installed" },
    })
    specimen.expect(second.id).toBe(first.id)
    specimen.expect(second.traits).toContain("APPLICATION")
  })

  specimen.it("a repository forwards populate and strips unsafe options", async () => {
    const populated = await conn.call("/literal/find", {
      where: { slug: "hello" }, options: { populate: ["symbols"] },
    })
    specimen.expect(populated[0].symbols.length).toBeGreaterThan(0)

    const stripped = await conn.call("/literal/find", {
      where: {}, options: { lockMode: 4 },
    })
    specimen.expect(stripped.length).toBeGreaterThan(0)
  })
})

specimen.describe("shard.datamap.scope", () => {
  specimen.it("scope injects the owner into writes and filters reads", async () => {
    const userId = scenario.fixtures.user.id

    const thread = await conn.call("/thread/create", {
      data: { mode: scenario.fixtures.mode.id, trait: {}, cursor: 0, counter: 0 },
    })
    const threadUser = typeof thread.user === "object" ? thread.user.id : thread.user
    specimen.expect(threadUser).toBe(userId)

    const threads = await conn.call("/thread/find", { where: {} })
    for (const found of threads) {
      const foundUser = typeof found.user === "object" ? found.user.id : found.user
      specimen.expect(foundUser).toBe(userId)
    }
  })
})

specimen.describe("shard.datamap.errors", () => {
  specimen.it("a missing target 404s on update and remove", async () => {
    const missing = "00000000-0000-0000-0000-000000000000"

    const update = await conn.fetch("/literal/updateOne", { where: { id: missing }, data: {} })
    specimen.expect(update.status).toBe(404)
    specimen.expect(update.body.code).toBe("NOT_FOUND")

    const remove = await conn.fetch("/literal/removeOne", { where: { id: missing } })
    specimen.expect(remove.status).toBe(404)
    specimen.expect(remove.body.code).toBe("NOT_FOUND")
  })
})

specimen.describe("shard.datamap.reactive", () => {
  specimen.it("a twitch effect fires on entity events", async () => {
    const events = []
    twitch.open("/after/literal/create", (ctx) => {
      events.push({ custom: true, slug: ctx.input.entity?.slug })
    })

    await conn.call("/literal/create", { data: { slug: "twitch-fire", trait: {} } })

    specimen.expect(events.length).toBe(1)
    specimen.expect(events[0].custom).toBe(true)
    specimen.expect(events[0].slug).toBe("twitch-fire")
  })
})

specimen.describe("shard.datamap.ingest", () => {
  specimen.it("an ingest stream creates one entity and many in a batch", async () => {
    const aperture = new Aperture()
    aperture.branch("/literal").slurp(shard.datamap.ingest(scenario.repos.literal))
    const handler = shape.http(aperture)
    const encoder = new TextEncoder()
    const post = (body) => handler(new Request("http://test/literal/ingest", {
      method: "POST", headers: { "content-type": "text/event-stream" }, body,
    }))

    const single = await (await post(new ReadableStream({
      start(controller) {
        controller.enqueue(encoder.encode('data: {"op":"create","data":{"slug":"ingested","trait":{}}}\n\n'))
        controller.close()
      },
    }))).json()
    specimen.expect(single.length).toBe(1)
    specimen.expect(single[0].slug).toBe("ingested")

    const many = await (await post(new ReadableStream({
      start(controller) {
        controller.enqueue(encoder.encode('data: {"op":"create","data":{"slug":"batch-a","trait":{}}}\n\n'))
        controller.enqueue(encoder.encode('data: {"op":"create","data":{"slug":"batch-b","trait":{}}}\n\n'))
        controller.close()
      },
    }))).json()
    specimen.expect(many.length).toBe(2)
    specimen.expect(many[0].slug).toBe("batch-a")
    specimen.expect(many[1].slug).toBe("batch-b")
  })

  specimen.it("an ingest stream updates and deletes existing entities", async () => {
    const aperture = new Aperture()
    aperture.branch("/literal").slurp(shard.datamap.ingest(scenario.repos.literal))
    const handler = shape.http(aperture)
    const encoder = new TextEncoder()
    const post = (event) => handler(new Request("http://test/literal/ingest", {
      method: "POST",
      headers: { "content-type": "text/event-stream" },
      body: new ReadableStream({
        start(controller) {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`))
          controller.close()
        },
      }),
    }))

    const toUpdate = await conn.call("/literal/create", { data: { slug: "ingest-update", trait: {} } })
    const updated = await (await post({ op: "update", where: { id: toUpdate.id }, data: { trait: { INGESTED: true } } })).json()
    specimen.expect(updated.length).toBe(1)
    specimen.expect(updated[0].trait.INGESTED).toBe(true)

    const toDelete = await conn.call("/literal/create", { data: { slug: "ingest-delete", trait: {} } })
    const deleted = await (await post({ op: "delete", where: { id: toDelete.id } })).json()
    specimen.expect(deleted.length).toBe(1)
    specimen.expect(deleted[0].ok).toBe(true)
    specimen.expect(await scenario.repos.literal.findOne({ slug: "ingest-delete" })).toBeNull()
  })
})

specimen.describe("shard.datamap.strip", () => {
  specimen.it("strip normalizes entity names and keeps only relations", () => {
    const schema = shard.datamap.strip(scenario.orm.getMetadata())
    specimen.expect(schema.literal).toBeDefined()
    specimen.expect(schema.symbol).toBeDefined()
    specimen.expect(schema.mode).toBeDefined()
    specimen.expect(schema.intent).toBeDefined()
    specimen.expect(schema.thread).toBeDefined()

    for (const name of Object.keys(schema)) {
      specimen.expect(name).not.toContain("_")
    }
    for (const meta of Object.values(schema)) {
      for (const relation of Object.values(meta.properties)) {
        specimen.expect(["m:1", "1:m", "m:n"]).toContain(relation.kind)
      }
    }
  })

  specimen.it("strip captures every relation kind with its metadata", () => {
    const schema = shard.datamap.strip(scenario.orm.getMetadata())

    specimen.expect(schema.literal.properties.symbols.kind).toBe("m:n")
    specimen.expect(schema.literal.properties.symbols.target).toBe("symbol")
    specimen.expect(schema.intent.properties.mode.kind).toBe("m:1")
    specimen.expect(schema.intent.properties.mode.target).toBe("mode")
    specimen.expect(schema.mode.properties.intents.kind).toBe("1:m")
    specimen.expect(schema.mode.properties.intents.target).toBe("intent")

    specimen.expect(schema.mode.properties.intents.mappedBy).toBe("mode")
    specimen.expect(schema.thread.properties.buffers.mappedBy).toBe("thread")
    specimen.expect(schema.thread.properties.turns.mappedBy).toBe("thread")

    specimen.expect(schema.symbol.properties.literals.owner).toBe(true)
    specimen.expect(schema.literal.properties.symbols.owner).toBeUndefined()

    specimen.expect(schema.thread.properties.intent.nullable).toBe(true)
    specimen.expect(schema.thread.properties.mode.nullable).toBeUndefined()
  })
})

specimen.describe("shard.datamap.wire", () => {
  specimen.it("wire links repo stores across relations, self-references, and skips missing targets", () => {
    const literal = new RemoteRepository()
    const symbol = new RemoteRepository()
    shard.datamap.wire({ literal, symbol }, {
      literal: { properties: { symbols: { kind: "m:n", target: "symbol" } } },
      symbol: { properties: { literals: { kind: "m:n", target: "literal" } } },
    })
    specimen.expect(literal.schema.stores.symbol).toBe(symbol)
    specimen.expect(symbol.schema.stores.literal).toBe(literal)

    const buffer = new RemoteRepository()
    shard.datamap.wire({ buffer }, {
      buffer: { properties: {
        parent: { kind: "m:1", target: "buffer" },
        children: { kind: "1:m", target: "buffer" },
      } },
    })
    specimen.expect(buffer.schema.stores.buffer).toBe(buffer)

    const orphan = new RemoteRepository()
    shard.datamap.wire({ literal: orphan }, {
      literal: { properties: { symbols: { kind: "m:n", target: "symbol" } } },
    })
    specimen.expect(orphan.schema.stores.symbol).toBeUndefined()
  })

  specimen.it("wire hydrates cross-repo relations and wraps entities in prototypes", async () => {
    const schema = shard.datamap.strip(scenario.orm.getMetadata())
    const entityManager = new RemoteEntityManager(conn, schema)
    const literal = entityManager.register("literal", new RemoteRepository())
    const symbol = entityManager.register("symbol", new RemoteRepository())
    literal.connect(conn.branch("/literal"))
    symbol.connect(conn.branch("/symbol"))
    shard.datamap.wire({ literal, symbol }, schema)

    await symbol.find()
    const literals = await literal.find({}, { populate: ["symbols"] })
    const fromStore = symbol.$entities.get()[0]
    specimen.expect(literals[0].symbols[0]).toBe(fromStore)

    class TestMode {
      constructor(raw) { Object.assign(this, raw) }
      implements(trait) { return this.traits?.includes(trait) }
    }
    const modeManager = new RemoteEntityManager(conn)
    const modeRepo = modeManager.register("mode", new RemoteRepository(TestMode))
    modeRepo.connect(conn.branch("/mode"))
    shard.datamap.wire({ mode: modeRepo }, schema)

    const modes = await modeRepo.find()
    specimen.expect(modes[0]).toBeInstanceOf(TestMode)
    specimen.expect(modes[0].implements("APPLICATION")).toBe(true)
  })
})
