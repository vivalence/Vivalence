import { specimen, shard, RemoteRepository, RemoteEntityManager } from "@vivalence/typology"
import { daemon } from "@vivalence/runtime/scenarios"
import { Mode } from "../../src/typology/entities/mode/mode.js"
import { Intent } from "../../src/typology/entities/intent.js"

let scenario

specimen.beforeAll(async () => {
  scenario = await daemon.create()
})

specimen.afterAll(async () => {
  await scenario.orm.close()
})

function createManagedRepo(kind, endpoint) {
  const entityManager = new RemoteEntityManager(scenario.conn, {})
  const repo = new RemoteRepository(kind).connect(scenario.conn.branch(endpoint))
  entityManager.register("entity", repo)
  return repo
}

specimen.describe("daemon entities", () => {
  specimen.it("mode wrapped in prototype", async () => {
    const modeRepo = createManagedRepo(Mode, "/entities/mode")
    const modes = await modeRepo.find()
    specimen.expect(modes.length).toBeGreaterThan(0)
    specimen.expect(modes[0]).toBeInstanceOf(Mode)
    specimen.expect(modes[0].traits).toContain("APPLICATION")
  })

  specimen.it("schema strip and wire", async () => {
    const schema = await scenario.conn.call("/datamap")
    const literal = new RemoteRepository()
    const symbol = new RemoteRepository()
    shard.datamap.wire({ literal, symbol }, schema)
    specimen.expect(literal.schema.stores.symbol).toBe(symbol)
    specimen.expect(symbol.schema.stores.literal).toBe(literal)
  })

  specimen.it("cross-repo identity through wired hydration", async () => {
    const schema = await scenario.conn.call("/datamap")
    const entityManager = new RemoteEntityManager(scenario.conn, schema)
    const symbolRepo = new RemoteRepository().connect(scenario.conn.branch("/entities/symbol"))
    const literalRepo = new RemoteRepository().connect(scenario.conn.branch("/entities/literal"))
    entityManager.register("symbol", symbolRepo)
    entityManager.register("literal", literalRepo)

    await symbolRepo.find()
    const literals = await literalRepo.find({}, { populate: ["symbols"] })
    specimen.expect(literals[0].symbols.length).toBeGreaterThan(0)
    specimen.expect(literals[0].symbols[0]).toBe(symbolRepo.$entities.get()[0])
  })

  specimen.it("thread create through authed connection", async () => {
    const entityManager = new RemoteEntityManager(scenario.conn, {})
    const modeRepo = new RemoteRepository().connect(scenario.conn.branch("/entities/mode"))
    const threadRepo = new RemoteRepository().connect(scenario.authedConn.branch("/userspace/entities/thread"))
    entityManager.register("mode", modeRepo)
    entityManager.register("thread", threadRepo)

    const modes = await modeRepo.find()
    const created = await threadRepo.create({
      mode: modes[0].id, trait: {}, cursor: 0, counter: 0,
    })
    specimen.expect(created.id).toBeDefined()
    specimen.expect(created.user).toBeTruthy()
  })
})
